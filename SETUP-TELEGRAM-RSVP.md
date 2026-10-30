# Telegram RSVP setup — Aman & Trushi

## Current status
The website form and relay code have been tested locally using isolated API fixtures. No live RSVP was sent during testing. The relay has NOT been deployed. The public endpoint is intentionally blank and the form stays disabled until you configure it, instead of falsely claiming to save a guest's reply. The live GitHub Pages website has not been changed.

## What you receive
After activation, each successful RSVP arrives as a private Telegram message from @HermesAgentJacks12_bot to your account. It contains the guest's name, attendance, wishes, and receipt time. Messages are kept in your Telegram conversation, not in a public GitHub file. The bot username by itself is not sufficient to deliver messages securely.

## One-time activation

1. Open https://t.me/HermesAgentJacks12_bot from YOUR Telegram account and tap Start if needed. Do not change/reset the existing bot token or webhook.

2. Open https://script.google.com/ while signed into your Google account. Create a New project and replace the editor's default code with the supplied `private-setup/telegram-relay.gs`.

3. In Apps Script > Project Settings > Script properties, add these PRIVATE values:

   | Property | Value |
   | --- | --- |
   | TELEGRAM_BOT_TOKEN | The EXISTING token for @HermesAgentJacks12_bot. Enter it yourself only in these private settings. Do not paste it into Telegram chat, index.html, rsvp-config.js, or GitHub. Do not regenerate it. |
   | TELEGRAM_CHAT_ID | 1228991987 |

   The numeric chat ID above is the owner account in this conversation. If this bot is used with a different recipient account, confirm its private chat ID first.

4. Deploy > New deployment > select Web app. Execute as: Me. Who has access: Anyone. Approve the permissions to run your script and make the outbound Telegram API request. Copy the deployed URL ending in `/exec` (not `/dev`). This endpoint accepts submissions only; it does NOT expose a response list.

5. Open `rsvp-config.js` and paste ONLY that public `/exec` URL between the empty quotes after `endpoint`. You can also send Hermes just this public URL so the ZIP can be configured for you. No token is needed in chat.

6. Upload/replace these THREE public files at the ROOT of `amangwd19/aman-trushi-wedding-invitation`:
   - index.html
   - rsvp-config.js
   - rsvp-telegram.js

   Keep existing preview images and other unrelated files. Do not upload private setup files or secrets. Existing GitHub access rejected automated publication with HTTP 403, so manual upload is still required unless repository permissions change.

7. After Pages deploys, open the invitation in an incognito browser. Submit a reply clearly labelled `RSVP TEST`, then check that it REALLY arrives in your Telegram conversation. Only then share the invitation. Delete that test message from your own chat if desired.

## Delivery and failure behavior
- No message is marked delivered until Telegram's API confirms acceptance and the browser receives the relay acknowledgment. This does not mean the recipient has read it.
- If offline, timed out, rejected or not configured, the page reports the problem rather than pretending the RSVP was saved.
- On delivery error, the guest's inputs remain in the form while that page stays open. Do not close or refresh the page until delivery succeeds.
- Retries reuse the same request ID. Server-side duplicate suppression is best-effort using Google's cache (up to six hours, subject to eviction); it is not durable exactly-once storage.
- Guest-supplied message text is sent as plain text, not Telegram HTML or bot commands. Guests are not given access to Hermes.
- A honeypot and a best-effort 40-successful-submissions-per-hour cap reduce basic spam. This public form is not authenticated or a full anti-abuse service. Apps Script/Telegram free-service quotas and availability apply.
- The relay exposes no read/list API and the recipient is fixed in server settings. Never put the token or a bot API URL containing it into the public website.

## Changes retained
The supplied collage stays in the four-photo carousel; cake and illustrated placeholders stay removed. Schedule details are now aligned with the approved cards: Haldi on 12 December 2026, Wedding on 13 December 2026, and Paunchar on 14 December 2026, all at 7:00 PM IST. Scratch reveal, countdown, calendar start and wedding address have been corrected. Unconfirmed Mehendi/Sangeet listings, fabricated morning/lunch/reception times, and unsupported shuttle/hotel-rate claims have been removed or replaced with neutral guidance. All guest-facing website text is English. The separate no-gifts note has been removed. Haldi/Paunchar venue details were not supplied and are not invented. Music and the RSVP delivery implementation remain unchanged.

## Tests included
`tests/test-relay.cjs`: validation, fixed destination, duplicate suppression, spam-field rejection and Telegram failure paths; external APIs are isolated fixtures, NOT live delivery.
`tests/test-browser.py`: actual headless Chrome mobile form behavior with isolated fetch responses; no-configuration, error retention, retry and success acknowledgment.

Do not describe this as live until the final end-to-end Telegram receipt has been checked.
