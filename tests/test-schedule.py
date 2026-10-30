from pathlib import Path
import re,unittest
from datetime import datetime,timezone
from zoneinfo import ZoneInfo
R=Path(__file__).resolve().parent
if not (R/'index.html').exists():R=R.parent
class ScheduleTests(unittest.TestCase):
 def setUp(self):self.s=(R/'index.html').read_text()
 def section(self,name):return re.search(r'<section\b[^>]*id="'+name+r'"[^>]*>[\s\S]*?</section>',self.s)[0]
 def test_events_match_approved_cards(self):
  events=self.section('events')
  self.assertIn('December 12, 2026',events)
  self.assertIn('December 14, 2026',events)
  self.assertIn('Haldi',events);self.assertIn('Paunchar',events)
  self.assertEqual(events.count('7:00 PM'),2)
  for wrong in ['Mehendi','Sangeet','Bride’s Garden','Groom’s House']:self.assertNotIn(wrong,events)
 def test_wedding_time_everywhere(self):
  self.assertIn('Sunday · 7:00 PM',self.s)
  self.assertIn("2026-12-13T19:00:00+05:30",self.s)
  utc=datetime(2026,12,13,19,tzinfo=ZoneInfo('Asia/Kolkata')).astimezone(timezone.utc).strftime('%Y%m%dT%H%M%SZ')
  self.assertIn("start: '"+utc+"'",self.s)
  self.assertNotIn("end: '20261213T063000Z'",self.s)
  for wrong in ['10:00 AM','10:30 AM','1:00 PM','7:30 PM']:self.assertNotIn(wrong,self.section('timeline'))
 def test_venue_and_note(self):
  v=self.section('venue');self.assertIn('Opposite All India Radio',v)
  self.assertNotIn('Poonam Tower',v)
  self.assertNotIn('Note: No gifts, please.',self.section('gifts'))
  self.assertNotIn('9:00 AM',self.section('travel'))
if __name__=='__main__':unittest.main()
