from pathlib import Path
import re,unittest
R=Path(__file__).resolve().parent
if not (R/'index.html').exists():R=R.parent
class EnglishOnlyTests(unittest.TestCase):
 def test_no_devanagari_in_public_files(self):
  for name in ['index.html','rsvp-config.js','rsvp-telegram.js']:
   found=re.findall(r'[\u0900-\u097f]+',(R/name).read_text())
   self.assertEqual(found,[],f'Non-English script remains in {name}')
 def test_english_note_and_event_details(self):
  s=(R/'index.html').read_text()
  self.assertFalse('Note: No gifts, please.' in s)
  self.assertTrue('Haldi' in s and 'Paunchar' in s)
  self.assertTrue('December 12, 2026' in s and 'December 14, 2026' in s)
  self.assertTrue('Sunday · 7:00 PM' in s)
if __name__=='__main__':unittest.main()
