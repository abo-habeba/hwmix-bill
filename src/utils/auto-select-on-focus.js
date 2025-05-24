export default function setupAutoSelectOnFocus() {
  function handleFocus(event) {
    const el = event.target;
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      setTimeout(() => {
        el.select();
      }, 0);
    }
  }

  document.addEventListener('focusin', handleFocus);

  return () => {
    document.removeEventListener('focusin', handleFocus);
  };
}
