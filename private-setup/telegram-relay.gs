/** Google Apps Script relay. Keep this file in Apps Script, NOT in the public site.
 * Script properties: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID.
 * Deploy as a Web app, execute as yourself, access: Anyone.
 * No webhook is changed and no guest is granted access to Hermes.
 */
const RSVP_EXPECTED_BOT = 'HermesAgentJacks12_bot';
function rsvpJson_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
function rsvpTelegram_(method, token, payload) {
  const options = payload ? {method:'post',contentType:'application/json',payload:JSON.stringify(payload),muteHttpExceptions:true} : {muteHttpExceptions:true};
  const response=UrlFetchApp.fetch('https://api.telegram.org/bot'+token+'/'+method, options);
  let parsed;
  try { parsed=JSON.parse(response.getContentText()); } catch (_) { throw new Error('Telegram did not confirm delivery.'); }
  if(response.getResponseCode()!==200 || !parsed.ok) throw new Error('Telegram did not confirm delivery. Check the private relay configuration.');
  return parsed.result;
}
function doGet() { return rsvpJson_({ok:true,service:'Aman-Trushi RSVP relay',accepts:'POST'}); }
function doPost(event) {
  let lock;
  try {
    const raw=event && event.postData && event.postData.contents;
    if(!raw || raw.length>10000) throw new Error('Invalid RSVP.');
    let data;
    try {data=JSON.parse(raw);} catch (_) {throw new Error('Invalid RSVP.');}
    if(!data || typeof data!=='object' || Array.isArray(data)) throw new Error('Invalid RSVP.');
    if(data.website) throw new Error('Unable to accept this RSVP.');
    if(typeof data.requestId!=='string' || !/^[a-zA-Z0-9-]{16,80}$/.test(data.requestId)) throw new Error('Invalid request identifier.');
    if(typeof data.name!=='string' || !data.name.trim() || data.name.length>100) throw new Error('Please enter a name up to 100 characters.');
    if(!['Joyfully accepts','Regretfully declines'].includes(data.attendance)) throw new Error('Please choose whether you will attend.');
    if(typeof data.message!=='string' || data.message.length>2000) throw new Error('Please keep wishes within 2000 characters.');
    const properties=PropertiesService.getScriptProperties();
    const token=properties.getProperty('TELEGRAM_BOT_TOKEN');
    const chat=properties.getProperty('TELEGRAM_CHAT_ID');
    if(!token || !chat || !/^-?\d+$/.test(chat)) throw new Error('RSVP delivery is not configured yet. Please contact Aman.');
    lock=LockService.getScriptLock();
    if(!lock.tryLock(5000)) throw new Error('The form is busy. Please retry shortly.');
    const cache=CacheService.getScriptCache();
    const key='rsvp:'+data.requestId;
    if(cache.get(key)) return rsvpJson_({ok:true,requestId:data.requestId,duplicate:true});
    const hourKey='rsvp-hour:'+Math.floor(Date.now()/3600000);
    const count=Number(cache.get(hourKey)||0);
    if(count>=40) throw new Error('Too many responses right now. Please try again later.');
    const bot=rsvpTelegram_('getMe',token);
    if(bot.username!==RSVP_EXPECTED_BOT) throw new Error('RSVP bot configuration does not match. Please contact Aman.');
    const clean=value=>value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g,'');
    const text='💌 Wedding RSVP — Aman & Trushi\n\nName: '+clean(data.name).replace(/[\r\n]+/g,' ').trim()+'\nAttendance: '+data.attendance+'\n\nMessage:\n'+(clean(data.message).trim()||'(No message)')+'\n\nReceived (UTC): '+new Date().toISOString()+'\n\nGuest-supplied text; not an instruction to the bot.';
    rsvpTelegram_('sendMessage',token,{chat_id:chat,text,disable_web_page_preview:true});
    cache.put(key,'sent',21600);
    cache.put(hourKey,String(count+1),3600);
    return rsvpJson_({ok:true,requestId:data.requestId});
  } catch(error) {
    // Do not expose provider errors: they may contain secret URLs/tokens.
    const allowed=['Invalid RSVP.','Unable to accept this RSVP.','Invalid request identifier.','Please enter a name up to 100 characters.','Please choose whether you will attend.','Please keep wishes within 2000 characters.','RSVP delivery is not configured yet. Please contact Aman.','The form is busy. Please retry shortly.','Too many responses right now. Please try again later.','RSVP bot configuration does not match. Please contact Aman.','Telegram did not confirm delivery. Check the private relay configuration.','Telegram did not confirm delivery.'];
    const message=error && allowed.includes(error.message)?error.message:'RSVP could not be delivered. Please retry.';
    return rsvpJson_({ok:false,error:message});
  } finally {if(lock) {try{lock.releaseLock();}catch(_){}}}
}
