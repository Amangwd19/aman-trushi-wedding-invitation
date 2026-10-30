from pathlib import Path
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
import json,time
r=Path(__file__).resolve().parent
if not (r/'index.html').exists():r=r.parent
o=webdriver.ChromeOptions()
for a in ['--headless','--no-sandbox','--disable-dev-shm-usage']:o.add_argument(a)
o.set_capability('goog:loggingPrefs',{'browser':'ALL'})
d=webdriver.Chrome(options=o)
try:
 for width in [390,1365]:
  d.set_window_size(width,900);d.get((r/'index.html').as_uri()+'#invitation')
  assert d.execute_script('return document.documentElement.scrollWidth<=document.documentElement.clientWidth')
  assert d.execute_script('return EVENT_DATE.toISOString()')=='2026-12-13T13:30:00.000Z'
  assert d.execute_script('return calculateCountdown(new Date("2026-12-13T18:00:00+05:30")).hours')==1
  text=d.execute_script('return document.querySelector("#events").innerText')
  assert 'December 12, 2026' in text and 'December 14, 2026' in text and text.count('7:00 PM')==2
  assert 'Mehendi' not in text and 'Sangeet' not in text
  d.execute_script('const original=URL.createObjectURL;URL.createObjectURL=function(blob){window.testCalendarBlob=blob;return original(blob)};HTMLAnchorElement.prototype.click=function(){};document.querySelector("#saveDate").click()')
  ics=d.execute_async_script('window.testCalendarBlob.text().then(arguments[0])')
  assert 'DTSTART:20261213T133000Z' in ics and 'DTEND:' not in ics
  assert 'Civil Lines' in ics and 'Akashvani' in ics
  assert d.execute_script('return document.querySelectorAll("#galleryTrack figure").length')==4
  assert d.execute_script('return !!window.RSVPTelegram && !!document.querySelector("#rsvpStatus")')
  d.execute_script('document.querySelector("#events").scrollIntoView({block:"center"})');time.sleep(1)
  d.find_element('id','events').screenshot(str(r/f'events-preview-{width}.png'))
  errors=[x['message'] for x in d.get_log('browser') if 'Uncaught' in x['message']];assert not errors,errors
  print(json.dumps({'width':width,'schedule':'PASS','countdown_7pm_IST':'PASS','actual_calendar_blob_start_7pm_IST':'PASS','no_invented_end_time':True,'carousel_slides':4,'rsvp_preserved':True,'js_errors':errors}))
finally:d.quit()
