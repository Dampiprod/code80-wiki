window.showEl = function (id) { const el = document.getElementById(id); if (el) el.style.display = 'block'; };
window.hideEl = function (id) { const el = document.getElementById(id); if (el) el.style.display = 'none'; };

function updateHeaderUI(session) {
  const loginBtn   = document.getElementById('btn-login-header');
  const avatarWrap = document.getElementById('user-avatar-header');
  const avatarImg  = document.getElementById('header-avatar');

  if (session?.user) {
    if (loginBtn)   loginBtn.style.display = 'none';
    if (avatarWrap) avatarWrap.style.display = 'inline-block';
    if (avatarImg)  avatarImg.src = session.user.user_metadata?.avatar_url || 'img/default-avatar.png';
    loadHeaderAvatar(session.user.id);
  } else {
    if (loginBtn)   loginBtn.style.display = 'inline-block';
    if (avatarWrap) avatarWrap.style.display = 'none';
  }
}

async function loadHeaderAvatar(userId) {
  const { data, error } = await window.supabaseClient
    .from('profiles')
    .select('avatar_url')
    .eq('id', userId)
    .maybeSingle();

  if (error) { console.warn('avatar load:', error.message); return; }
  const img = document.getElementById('header-avatar');
  if (img && data?.avatar_url) img.src = data.avatar_url;
}

window.supabaseClient.auth.onAuthStateChange((_event, session) => {
  updateHeaderUI(session);
});

// Тот самый обработчик клика по кнопке
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-login-header')?.addEventListener('click', () => {
    window.location.href = 'signup.html';
  });
});