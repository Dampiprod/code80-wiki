document.addEventListener('DOMContentLoaded', () => {
  // Переключение вкладок (Вход <-> Регистрация)
  document.getElementById('switch-to-signup')?.addEventListener('click', e => { 
    e.preventDefault(); 
    document.getElementById('login-block').style.display = 'none'; 
    document.getElementById('signup-block').style.display = 'block'; 
  });
  
  document.getElementById('switch-to-login')?.addEventListener('click', e => { 
    e.preventDefault(); 
    document.getElementById('signup-block').style.display = 'none'; 
    document.getElementById('login-block').style.display = 'block'; 
  });

  // Логика Входа
  document.getElementById('login-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const msgEl = document.getElementById('login-msg');

    msgEl.textContent = 'Вход...'; 
    msgEl.style.color = 'orange';

    const { error } = await window.supabaseClient.auth.signInWithPassword({ email, password });

    if (error) { 
      msgEl.textContent = error.message; 
      msgEl.style.color = 'red'; 
      return; 
    }
    
    // После успешного входа редирект на главную
    window.location.href = 'index.html';
  });

  // Логика Регистрации
  document.getElementById('signup-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const username = document.getElementById('reg-username').value.trim();
    const msgEl = document.getElementById('signup-msg');

    msgEl.textContent = 'Регистрация...'; 
    msgEl.style.color = 'orange';

    const { data, error } = await window.supabaseClient.auth.signUp({
      email,
      password,
      options: { data: { username } }
    });

    if (error) { 
      msgEl.textContent = error.message; 
      msgEl.style.color = 'red'; 
      return; 
    }

    // Создаём профиль (если триггер в Supabase не сработал автоматически)
    if (data.user) {
      await window.supabaseClient.from('profiles').upsert(
        { id: data.user.id, username, bio: '' },
        { onConflict: 'id' }
      );
    }

    msgEl.textContent = 'Готово! Проверь почту и войди.';
    msgEl.style.color = 'green';
    
    // Перекидываем на форму входа через 2 секунды
    setTimeout(() => {
      document.getElementById('signup-block').style.display = 'none';
      document.getElementById('login-block').style.display = 'block';
    }, 2000);
  });
});