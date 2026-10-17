(() => {
  const form = document.querySelector('[data-support-form]');
  if (!form?.hasAttribute('action')) return;
  const destination = new URL(form.action);
  // Other reception services keep their native HTML form submission.
  if (destination.hostname !== 'formspree.io') return;
  const submit = form.querySelector('[data-support-submit]');
  const status = document.querySelector('[data-support-status]');
  let sending = false;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || !form.reportValidity()) return;
    sending = true;
    submit.disabled = true;
    form.setAttribute('aria-busy', 'true');
    status.textContent = 'Envoi en cours…';
    try {
      const response = await fetch(destination, {
        method: 'POST', body: new FormData(form),
        headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(30000),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.ok !== true) throw new Error('Reception not confirmed');
      form.reset();
      status.textContent = 'Votre demande a été reçue par le service de support. Vous pouvez conserver une copie de votre message.';
      status.dataset.state = 'success';
    } catch {
      status.textContent = 'La réception n’a pas pu être confirmée. Votre message est conservé dans les champs. Vous pouvez réessayer ou utiliser l’adresse e-mail ci-dessus.';
      status.dataset.state = 'error';
    } finally {
      sending = false;
      submit.disabled = false;
      form.removeAttribute('aria-busy');
      status.focus();
    }
  });
})();
