const loggedInBox  = document.getElementById('profile-logged-in');
const loggedOutBox = document.getElementById('profile-logged-out');
const usernameEl   = document.getElementById('profile-username');
const bioEl        = document.getElementById('profile-bio');
const avatarEl     = document.getElementById('profile-avatar');
const postsEl      = document.getElementById('profile-posts');
const logoutBtn    = document.getElementById('logout-btn');
const avatarInput  = document.getElementById('avatar-input');
const avatarMsg    = document.getElementById('avatar-msg');

function showLoggedOut() {
  loggedInBox.hidden  = true;
  loggedOutBox.hidden = false;
}

async function showLoggedIn(user) {
  loggedOutBox.hidden = true;
  loggedInBox.hidden  = false;

  const { data: profile, error } = await window.supabaseClient
    .from('profiles')
    .select('username, bio, avatar_url')
    .eq('id', user.id)
    .maybeSingle();

  if (error) console.warn('profile load:', error.message);

  usernameEl.textContent = profile?.username || user.email;
  bioEl.textContent      = profile?.bio || '';
  avatarEl.src           = profile?.avatar_url || 'img/default-avatar.png';

  loadUserPhotos(user.id);
}

async function loadUserPhotos(userId) {
  const { data, error } = await window.supabaseClient
    .from('photos')
    .select('id, url, title, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    postsEl.innerHTML = `<p class="text-muted" style="grid-column:1/-1;">Ошибка: ${error.message}</p>`;
    return;
  }

  if (!data?.length) {
    postsEl.innerHTML = '<p class="text-muted" style="grid-column:1/-1; text-align:center;">Нет публикаций</p>';
    return;
  }

  postsEl.innerHTML = data.map(p => `
    <div class="pub-card">
      <img src="${p.url}" alt="${p.title ?? ''}" style="width:100%; border-radius:4px;">
      <p style="margin:8px 0 0; font-size:0.9rem;">${p.title || 'Без названия'}</p>
    </div>
  `).join('');
}

avatarInput?.addEventListener('change', async () => {
  const file = avatarInput.files?.[0];
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    avatarMsg.textContent = 'Файл больше 2 МБ'; avatarMsg.style.color = 'red'; return;
  }

  avatarMsg.textContent = 'Загрузка...'; avatarMsg.style.color = 'orange';

  const { data: { user } } = await window.supabaseClient.auth.getUser();
  if (!user) { avatarMsg.textContent = 'Сначала войдите'; avatarMsg.style.color = 'red'; return; }

  const ext  = file.name.split('.').pop().toLowerCase();
  const path = `${user.id}/avatar.${ext}`;

  const { error: upErr } = await window.supabaseClient.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type });

  if (upErr) { avatarMsg.textContent = upErr.message; avatarMsg.style.color = 'red'; return; }

  const { data: pub } = window.supabaseClient.storage.from('avatars').getPublicUrl(path);
  const publicUrl = `${pub.publicUrl}?t=${Date.now()}`;

  const { error: dbErr } = await window.supabaseClient
    .from('profiles')
    .upsert({ id: user.id, avatar_url: publicUrl }, { onConflict: 'id' });

  if (dbErr) { avatarMsg.textContent = dbErr.message; avatarMsg.style.color = 'red'; return; }

  avatarEl.src = publicUrl;
  avatarMsg.textContent = 'Аватарка обновлена!'; avatarMsg.style.color = 'green';
});

logoutBtn?.addEventListener('click', async () => {
  logoutBtn.disabled = true;
  const { error } = await window.supabaseClient.auth.signOut();
  logoutBtn.disabled = false;
  if (error) { alert('Не удалось выйти: ' + error.message); return; }
  showLoggedOut();
});

window.supabaseClient.auth.onAuthStateChange((_event, session) => {
  if (session?.user) showLoggedIn(session.user);
  else showLoggedOut();
});