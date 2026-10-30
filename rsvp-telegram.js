/* No credentials here. The private relay delivers to a server-configured owner. */
(function (root) {
  'use strict';
  function newId() {
    if (root.crypto && root.crypto.randomUUID) return root.crypto.randomUUID();
    return 'rsvp-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2) + '-' + Math.random().toString(36).slice(2);
  }
  function endpoint() {
    const value = String((root.RSVP_CONFIG || {}).endpoint || '').trim();
    return /^https:\/\/script\.google\.com\/macros\/s\/[a-zA-Z0-9_-]+\/exec$/.test(value) ? value : '';
  }
  function init(form) {
    if (!form) return;
    const status = form.querySelector('#rsvpStatus');
    const button = form.querySelector('button[type="submit"]');
    if (!status || !button) return;
    form.elements.name.maxLength = 100;
    form.elements.message.maxLength = 2000;
    const configured = !!endpoint();
    button.disabled = !configured;
    button.textContent = 'Send RSVP';
    if (!configured) status.textContent = 'RSVP delivery is not connected yet. Please contact Aman directly; this form has not sent anything.';
    else status.textContent = '';
    if (form._rsvpHandler) form.removeEventListener('submit', form._rsvpHandler);
    let pending = form._rsvpPending || null;
    form._rsvpHandler = async function (event) {
      event.preventDefault();
      const url = endpoint();
      if (!url) { status.textContent = 'RSVP delivery is not connected yet. No message has been sent.'; return; }
      if (button.disabled || !form.reportValidity()) return;
      const values = new FormData(form);
      const data = { name: String(values.get('name') || '').trim(), attendance: String(values.get('attendance') || ''), message: String(values.get('message') || ''), website: String(values.get('website') || '') };
      const signature = JSON.stringify(data);
      if (!pending || pending.signature !== signature) pending = {signature, id: newId()};
      form._rsvpPending = pending;
      button.disabled = true;
      button.textContent = 'Sending…';
      status.textContent = 'Sending your RSVP securely…';
      const abort = new AbortController();
      const timer = root.setTimeout(() => abort.abort(), 35000);
      try {
        const response = await root.fetch(url, { method: 'POST', headers: {'Content-Type': 'text/plain;charset=utf-8'}, body: JSON.stringify({...data, requestId: pending.id}), redirect: 'follow', credentials: 'omit', signal: abort.signal });
        if (!response.ok) throw new Error('The RSVP service is unavailable. Your text is still here; please retry.');
        const result = await response.json();
        if (!result || result.ok !== true || result.requestId !== pending.id) throw new Error((result && typeof result.error === 'string' && result.error.length < 240) ? result.error : 'Delivery could not be confirmed. Your text is still here; please retry.');
        status.textContent = 'Thank you! Your RSVP was delivered to Aman on Telegram.';
        form.reset();
        pending = null;
        form._rsvpPending = null;
      } catch (error) {
        status.textContent = error.name === 'AbortError' ? 'Delivery confirmation timed out. Your text is still here; retrying will reuse the same request ID.' : (error.message === 'Failed to fetch' ? 'Could not confirm delivery. Check your connection, or contact Aman directly. Your text is still here.' : error.message);
      } finally {
        root.clearTimeout(timer);
        button.disabled = false;
        button.textContent = 'Send RSVP';
      }
    };
    form.addEventListener('submit', form._rsvpHandler);
  }
  root.RSVPTelegram = {init};
})(window);
