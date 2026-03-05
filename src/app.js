const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;
const PAGES = ['browse', 'profile', 'my-profile', 'edit-profile', 'invitations', 'register', 'login'];
// Головна магія: робимо папку public "публічною"
app.use(express.static('public'));

app.listen(PORT, () => {
    console.log(`Сервер працює! Переходь сюди: http://localhost:${PORT}`);
});

/*
  ═══════════════════════════════════════════════════════
  THEME TOGGLE
  Flips data-theme on <html> between 'dark' (default)
  and 'light'. Persists choice to localStorage so it
  survives page refresh.
  ═══════════════════════════════════════════════════════
*/
const btnTheme = document.getElementById('btn-theme');
const iconMoon = document.getElementById('icon-moon');
const iconSun = document.getElementById('icon-sun');

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  // Moon visible when dark (prompt to switch to light)
  // Sun visible when light (prompt to switch to dark)
  iconMoon.hidden = (theme === 'light');
  iconSun.hidden = (theme === 'dark');
  localStorage.setItem('theme', theme);
}

btnTheme.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

// Restore saved preference on load (defaults to dark if nothing saved)
applyTheme(localStorage.getItem('theme') || 'dark');

/*
  ═══════════════════════════════════════════════════════
  PAGE: MY PROFILE
  ═══════════════════════════════════════════════════════
*/

async function loadMyProfilePage() {
  try {
    const p = await API.getMyProfile(); // → ViewFullProfileDTO
    renderMyProfile(p);
  } catch (err) {
    document.getElementById('my-name').textContent = 'Error: ' + err.message;
  }
}

function renderMyProfile(p) {
  document.getElementById('my-name').textContent = `${p.name || '—'}${p.age ? ', ' + p.age : ''}`;
  document.getElementById('my-sub').textContent = [p.gender, p.publicInfo?.city].filter(Boolean).join(' · ');
  document.getElementById('my-bio').textContent = p.publicInfo?.bio || 'No bio yet. Click Edit profile to add one.';
  document.getElementById('my-goal').textContent = p.publicInfo?.goal ? `Looking for: ${p.publicInfo.goal}` : '';
  document.getElementById('my-city').textContent = p.publicInfo?.city || '—';
  document.getElementById('my-phone').textContent = p.phone || '—';
  document.getElementById('my-email-priv').textContent = p.email || '—';

  // Initials fallback
  const initials = document.getElementById('my-initials');
  const photo = document.getElementById('my-photo');
  if (p.publicInfo?.photo) {
    photo.src = p.publicInfo.photo;
    photo.style.display = '';
    initials.style.display = 'none';
  } else {
    photo.style.display = 'none';
    initials.textContent = (p.name || '?').charAt(0).toUpperCase();
    initials.style.display = '';
  }

  // Keywords
  document.getElementById('my-keywords').innerHTML =
    (p.keywords || []).map(k => `<span class="chip">${k}</span>`).join('');

  // Socials
  const social = p.publicInfo?.social || {};
  document.getElementById('my-socials').innerHTML =
    Object.values(social).length
      ? Object.values(social).map(url => `<a href="https://${url}" target="_blank">${url}</a>`).join('')
      : '<span class="text-muted">—</span>';
}