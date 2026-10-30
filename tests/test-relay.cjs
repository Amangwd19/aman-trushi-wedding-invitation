const fs = require('fs');
const vm = require('vm');
const assert = require('assert/strict');
const path = require('path');
const localRelay = path.join(__dirname,'telegram-relay.gs');
const source = fs.readFileSync(fs.existsSync(localRelay) ? localRelay : path.join(__dirname,'..','private-setup','telegram-relay.gs'),'utf8');
let sent=[];let fail=false;const cache=new Map();
const ctx={Date,JSON,Math,Error,String,Object,Array,Number,RegExp,
 PropertiesService:{getScriptProperties:()=>({getProperty:k=>({TELEGRAM_BOT_TOKEN:'fixture-token-not-real',TELEGRAM_CHAT_ID:'1228991987'}[k]||'')})},
 LockService:{getScriptLock:()=>({tryLock:()=>true,releaseLock:()=>{}})},
 CacheService:{getScriptCache:()=>({get:k=>cache.get(k)||null,put:(k,v)=>cache.set(k,v)})},
 ContentService:{MimeType:{JSON:'application/json'},createTextOutput:s=>({setMimeType:()=>s})},
 UrlFetchApp:{fetch:(url,options)=>{
  if(url.endsWith('/getMe'))return {getResponseCode:()=>200,getContentText:()=>JSON.stringify({ok:true,result:{username:'HermesAgentJacks12_bot'}})};
  sent.push(JSON.parse(options.payload));return {getResponseCode:()=>fail?500:200,getContentText:()=>JSON.stringify({ok:!fail,result:{message_id:1}})};
 }}
};
vm.createContext(ctx);vm.runInContext(source,ctx);
const request={requestId:'11111111-1111-4111-8111-111111111111',name:'RSVP TEST — not a real guest',attendance:'Joyfully accepts',message:'Fixture wishes',website:''};
function post(x){return JSON.parse(ctx.doPost({postData:{contents:JSON.stringify(x)}}));}
const first=post(request);assert.equal(first.ok,true);assert.equal(sent.length,1);assert.equal(sent[0].chat_id,'1228991987');assert.ok(sent[0].text.includes(request.name));assert.ok(sent[0].text.includes(request.message));
assert.equal(post(request).ok,true);assert.equal(sent.length,1,'retry must not send duplicate');
const bad=post({...request,requestId:'22222222-2222-4222-8222-222222222222',attendance:'invalid'});assert.equal(bad.ok,false);assert.equal(sent.length,1);
const trap=post({...request,requestId:'33333333-3333-4333-8333-333333333333',website:'spam.example'});assert.equal(trap.ok,false);assert.equal(sent.length,1);
fail=true;const failed=post({...request,requestId:'44444444-4444-4444-8444-444444444444'});assert.equal(failed.ok,false,'Telegram failure must never be reported as saved');
console.log('PASS: relay validation, fixed destination, duplicate protection, honeypot and Telegram failure handling (isolated API fixtures; no live message sent).');
