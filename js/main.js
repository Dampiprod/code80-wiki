window.setAuthTab = function (tab) {
  const signupBlock = document.getElementById('signup-block');
  const loginBlock  = document.getElementById('login-block');
  if (signupBlock) signupBlock.style.display = tab === 'signup' ? 'block' : 'none';
  if (loginBlock)  loginBlock.style.display  = tab === 'login'  ? 'block' : 'none';
};

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('auth-modal');
  modal?.addEventListener('click', e => { if (e.target === modal) window.hideEl('auth-modal'); });

  document.getElementById('switch-to-signup')?.addEventListener('click', e => { e.preventDefault(); window.setAuthTab('signup'); });
  document.getElementById('switch-to-login') ?.addEventListener('click', e => { e.preventDefault(); window.setAuthTab('login');  });

  /* --- Регистрация --- */
  document.getElementById('signup-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    const email    = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const username = document.getElementById('reg-username').value.trim();
    const msgEl    = document.getElementById('signup-msg');

    msgEl.textContent = 'Регистрация...'; msgEl.style.color = 'orange';

    const { data, error } = await window.supabaseClient.auth.signUp({
      email,
      password,
      options: { data: { username } }
    });

    if (error) { msgEl.textContent = error.message; msgEl.style.color = 'red'; return; }

    if (data.user) {
      await window.supabaseClient.from('profiles').upsert(
        { id: data.user.id, username, bio: '' },
        { onConflict: 'id' }
      );
    }

    msgEl.textContent = 'Готово! Проверь почту для подтверждения.';
    msgEl.style.color = 'green';
  });

  /* --- Вход --- */
  document.getElementById('login-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    const email    = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const msgEl    = document.getElementById('login-msg');

    msgEl.textContent = 'Вход...'; msgEl.style.color = 'orange';

    const { error } = await window.supabaseClient.auth.signInWithPassword({ email, password });

    if (error) { msgEl.textContent = error.message; msgEl.style.color = 'red'; return; }

    window.hideEl('auth-modal');
    window.location.href = 'index.html';
  });
});