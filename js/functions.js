const hamburger = document.getElementById('hamburger-btn');
const navLinks = document.getElementById('nav-links');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    const isExpanded = hamburger.classList.toggle('active');
    navLinks.classList.toggle('active', isExpanded);
    hamburger.setAttribute('aria-expanded', String(isExpanded));
  });
}

// Sync aria-invalid with native :user-invalid state & provide fallback for older browsers
const UserInvalidFallback = (() => {
  const dirtyState = new WeakMap();

  const updateState = (input) => {
    const isValid = input.checkValidity();
    input.classList.toggle('user-invalid-fallback', !isValid);
    input.classList.toggle('user-valid-fallback', isValid);

    if (!isValid) {
      input.setAttribute('aria-invalid', 'true');
    } else {
      input.removeAttribute('aria-invalid');
    }
  };

  const handleEvent = (event) => {
    const input = event.target;

    if (event.type === 'reset') {
      const controls = input.elements || [];
      for (const control of controls) {
        dirtyState.delete(control);
        control.classList.remove('user-invalid-fallback', 'user-valid-fallback');
        control.removeAttribute('aria-invalid');
      }
      return;
    }

    if (!input || typeof input.checkValidity !== 'function') return;

    if (event.type === 'input' || event.type === 'change') {
      const state = dirtyState.get(input) || { hasInteracted: false, hasBlurred: false };
      state.hasInteracted = true;
      dirtyState.set(input, state);
      if (state.hasBlurred) {
        updateState(input);
      }
    } else if (event.type === 'blur') {
      const state = dirtyState.get(input) || { hasInteracted: false, hasBlurred: false };
      state.hasBlurred = true;
      dirtyState.set(input, state);
      if (state.hasInteracted) {
        updateState(input);
      }
    }
  };

  const syncAria = (el) => {
    if (!el || typeof el.matches !== 'function' || !('checkValidity' in el)) return;
    el.setAttribute('aria-invalid', el.matches(':user-invalid') ? 'true' : 'false');
  };

  const init = (root = document) => {
    if (CSS.supports('selector(:user-invalid)')) {
      root.addEventListener('blur', (e) => syncAria(e.target), true);
      root.addEventListener('input', (e) => {
        if (e.target && e.target.hasAttribute && e.target.hasAttribute('aria-invalid')) {
          syncAria(e.target);
        }
      });
      return;
    }

    root.addEventListener('blur', handleEvent, true);
    root.addEventListener('input', handleEvent);
    root.addEventListener('change', handleEvent);
    root.addEventListener('reset', handleEvent, true);
  };

  return { init };
})();

const diagnosticForm = document.getElementById('diagnostic-form');
if (diagnosticForm) {
  UserInvalidFallback.init(diagnosticForm);
}
