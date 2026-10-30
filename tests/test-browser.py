from pathlib import Path
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
import json
r=Path(__file__).resolve().parent
if not (r/'index.html').exists():r=r.parent
o=webdriver.ChromeOptions()
for a in ['--headless','--no-sandbox','--disable-dev-shm-usage']:o.add_argument(a)
d=webdriver.Chrome(options=o);d.set_window_size(390,900)
try:
 d.get((r/'index.html').as_uri()+'#invitation')
 assert d.execute_script('return !!document.querySelector("#rsvpStatus")'),'Missing delivery-status UI: original RSVP only saves on guest device'
 d.execute_script('document.querySelector("#rsvpForm").scrollIntoView({block:"center"})')
 assert d.execute_script('return document.querySelector("#rsvpForm button[type=submit]").disabled'),'Must fail closed when relay is not configured'
 d.execute_script('window.RSVP_CONFIG={endpoint:"https://script.google.com/macros/s/FIXTURE/exec"};window.RSVPTelegram.init(document.querySelector("#rsvpForm"));window.fixtureFailure=true;window.fetch=async (url,options)=>{window.fixturePayload=JSON.parse(options.body);return {ok:true,json:async()=>window.fixtureFailure?{ok:false,error:"Fixture delivery failure"}:{ok:true,requestId:window.fixturePayload.requestId}}}')
 def submit():
  d.execute_script('const f=document.querySelector("#rsvpForm");f.elements.name.value="RSVP TEST — not a real guest";f.elements.attendance.value="Joyfully accepts";f.elements.message.value="<b>Fixture wishes</b>";f.requestSubmit()')
 submit()
 WebDriverWait(d,10).until(lambda d:'Fixture delivery failure' in d.find_element('id','rsvpStatus').text)
 assert d.execute_script('return document.querySelector("#rsvpForm").elements.message.value')=='<b>Fixture wishes</b>'
 assert d.execute_script('return !document.querySelector("#rsvpForm button[type=submit]").disabled')
 first=d.execute_script('return window.fixturePayload.requestId');d.execute_script('window.fixtureFailure=false');submit()
 WebDriverWait(d,10).until(lambda d:'delivered to Aman' in d.find_element('id','rsvpStatus').text)
 assert d.execute_script('return window.fixturePayload.requestId')==first,'Retry should reuse id to suppress duplicates'
 assert d.execute_script('return document.querySelector("#rsvpForm").elements.message.value')==''
 assert not d.execute_script('return document.querySelector("#rsvpStatus b")')
 assert d.execute_script('return document.documentElement.scrollWidth<=document.documentElement.clientWidth')
 print(json.dumps({'browser':'mobile 390px','not_configured':'blocked honestly','failed_delivery':'input retained, no false success','confirmed_delivery':'form cleared','retry_id_reused':True,'fixture_only':True}))
finally:d.quit()
