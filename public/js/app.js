/*
  ═══════════════════════════════════════════════════════
  app.js  —  View routing + DOM logic

  This file:
    1. Reads the URL hash  (#browse, #profile, etc.)
       and shows the correct <section>.
    2. Fetches data via window.API  (defined in api.js).
    3. Renders that data into the DOM.
    4. Wires up form submissions and button clicks.

  It never talks to the backend directly —
  all API calls go through window.API.
  ═══════════════════════════════════════════════════════
*/

'use strict';


/*
  ─────────────────────────────────────────────────
  STATE
  Simple in-memory state. No framework needed.
  ─────────────────────────────────────────────────
*/
const state = {
  currentUserId: null,   // set after login
  openProfileId: null,   // set when clicking a profile card
};


/*
  ═══════════════════════════════════════════════════════
  ROUTER
  Maps URL hash strings to page section IDs.
  ═══════════════════════════════════════════════════════
*/

// All page section IDs (must match <section id="page-…"> in index.html)
const PAGES = ['browse', 'profile', 'my-profile', 'edit-profile', 'invitations', 'register', 'login'];

/*
  Show the page that matches the current URL hash.
  Called on page load and every time the hash changes.
*/
function router() {
  const hash = location.hash.replace('#', '') || 'browse';

  // Hide all pages, then show only the matching one
  PAGES.forEach(id => {
    const section = document.getElementById('page-' + id);
    if (section) section.classList.remove('page-active');
  });

  const active = document.getElementById('page-' + hash);
  if (active) active.classList.add('page-active');

  // Highlight the matching sidebar link
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.page === hash);
  });

  // Load data for the page that just became visible
  onPageEnter(hash);
}

/*
  Called every time a page becomes visible.
  Triggers the right data-loading function per page.
*/
function onPageEnter(pageId) {
  switch (pageId) {
    case 'browse':       loadBrowsePage();       break;
    case 'profile':      loadProfilePage();      break;
    case 'my-profile':   loadMyProfilePage();    break;
    case 'edit-profile': loadEditProfilePage();  break;
    case 'invitations':  loadInvitationsPage();  break;
  }
}

// Listen for hash changes (user clicks a sidebar link or browser back/forward)
window.addEventListener('hashchange', router);

// Run on first load
router();


/*
  ═══════════════════════════════════════════════════════
  PAGE: BROWSE
  ═══════════════════════════════════════════════════════
*/

async function loadBrowsePage() {
  const grid  = document.getElementById('profiles-grid');
  const empty = document.getElementById('browse-empty');

  // Show loading spinner
  grid.innerHTML = `
    <div style="text-align: center; padding: 40px;">
      <div class="spinner"></div>
      <p class="text-muted" style="margin-top: 12px;">Loading profiles…</p>
    </div>`;

  try {
    const profiles = await API.getProfiles();   // → ViewProfileDTO[]
    renderProfiles(profiles);
  } catch (err) {
    grid.innerHTML = `<p class="text-muted" style="text-align: center; padding: 40px; color: var(--danger);">Failed to load profiles: ${err.message}</p>`;
  }

  // Keyword filter — filters the already-rendered cards client-side
  const searchInput = document.getElementById('browse-search');
  const searchClear = document.querySelector('.search-clear');

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      const value = this.value.trim().toLowerCase();
      filterProfiles(value);
      // Show/hide clear button based on input value
      if (searchClear) {
        searchClear.hidden = !this.value;
      }
    });
  }

  // Clear button functionality
  if (searchClear) {
    searchClear.addEventListener('click', function () {
      searchInput.value = '';
      searchInput.focus();
      filterProfiles('');
      this.hidden = true;
    });
  }
}

/*
  Render an array of ViewProfileDTO objects as cards in the grid.
*/
function renderProfiles(profiles) {
  const grid  = document.getElementById('profiles-grid');
  const empty = document.getElementById('browse-empty');

  if (!profiles.length) {
    grid.innerHTML = '';
    empty.hidden = false;
    return;
  }

  empty.hidden = true;
  grid.innerHTML = profiles.map(p => {
    // Keywords rendered as small chips
    const chips = (p.keywords || [])
      .map(k => `<span class="chip">${k}</span>`)
      .join('');

    return `
      <article class="profile-card" data-profile-id="${p.id}">
        <div class="profile-card-photo">
          <img
            src="${p.publicInfo?.photo || ''}"
            alt="${p.name}"
            onerror="this.style.display='none'"
          />
        </div>
        <div class="profile-card-body">
          <div class="profile-card-name">${p.name}, ${p.age}</div>
          <div class="profile-card-meta">
            ${p.gender} · ${p.publicInfo?.city || ''}
          </div>
          <div class="chip-list">${chips}</div>
        </div>
      </article>
    `;
  }).join('');
}

/*
  Client-side keyword filter.
  Hides cards that don't contain the search term
  in their name, city, or keywords.
*/
function filterProfiles(term) {
  const cards = document.querySelectorAll('.profile-card');
  let anyVisible = false;

  cards.forEach(card => {
    const text = card.textContent.toLowerCase();
    const match = !term || text.includes(term);
    card.style.display = match ? '' : 'none';
    if (match) anyVisible = true;
  });

  document.getElementById('browse-empty').hidden = anyVisible;
}

/*
  Click on a profile card → open that profile's detail page.
*/
document.getElementById('profiles-grid').addEventListener('click', e => {
  const card = e.target.closest('.profile-card');
  if (!card) return;
  state.openProfileId = Number(card.dataset.profileId);
  location.hash = 'profile';
});


/*
  ═══════════════════════════════════════════════════════
  PAGE: FULL PROFILE
  ═══════════════════════════════════════════════════════
*/

async function loadProfilePage() {
  if (!state.openProfileId) {
    location.hash = 'browse';
    return;
  }

  // Show loading state
  const nameEl = document.getElementById('prof-name');
  nameEl.innerHTML = '<div class="spinner" style="display: inline-block; margin-right: 8px;"></div>Loading profile…';

  try {
    const p = await API.getProfileById(state.openProfileId);  // → ViewFullProfileDTO
    renderFullProfile(p);
  } catch (err) {
    nameEl.textContent = 'Error: ' + err.message;
  }
}

/*
  Fill all profile fields from a ViewFullProfileDTO object.
*/
function renderFullProfile(p) {
  // Header
  document.getElementById('prof-name').textContent    = `${p.name}, ${p.age}`;
  document.getElementById('prof-sub').textContent     = `${p.gender} · ${p.publicInfo?.city || ''}`;
  document.getElementById('prof-goal').textContent    = p.publicInfo?.goal ? `Looking for: ${p.publicInfo.goal}` : '';
  document.getElementById('prof-initials').textContent = p.name.charAt(0).toUpperCase();

  const photo = document.getElementById('prof-photo');
  if (p.publicInfo?.photo) {
    photo.src = p.publicInfo.photo;
    photo.style.display = '';
    document.getElementById('prof-initials').style.display = 'none';
  } else {
    photo.style.display = 'none';
    document.getElementById('prof-initials').style.display = '';
  }

  // Keywords
  document.getElementById('prof-keywords').innerHTML =
    (p.keywords || []).map(k => `<span class="chip">${k}</span>`).join('');

  // Bio
  document.getElementById('prof-bio').textContent = p.publicInfo?.bio || 'No bio yet.';

  // Social links
  const social = p.publicInfo?.social || {};
  document.getElementById('prof-socials').innerHTML =
    Object.values(social)
      .map(url => `<a href="https://${url}" target="_blank" rel="noopener">${url}</a>`)
      .join('');

  // Private info — only show if the backend returned it (mutual match)
  const hasPrivate = p.phone || p.email;
  const privateBlock = document.getElementById('prof-private');
  if (hasPrivate) {
    privateBlock.hidden = false;
    document.getElementById('prof-phone').textContent = p.phone || '—';
    document.getElementById('prof-email').textContent = p.email || '—';
  } else {
    privateBlock.hidden = true;
  }

  // Set the hidden toId in the invitation form
  document.getElementById('inv-to-id').value = p.id;
}

// Back button on the profile page
document.getElementById('btn-back-to-browse').addEventListener('click', () => {
  location.hash = 'browse';
});


/*
  ═══════════════════════════════════════════════════════
  PAGE: MY PROFILE
  ═══════════════════════════════════════════════════════
*/

async function loadMyProfilePage() {
  // Show loading state
  const nameEl = document.getElementById('my-name');
  nameEl.innerHTML = '<div class="spinner" style="display: inline-block; margin-right: 8px;"></div>Loading…';

  try {
    const p = await API.getMyProfile(); // → ViewFullProfileDTO
    renderMyProfile(p);
  } catch (err) {
    nameEl.textContent = 'Error: ' + err.message;
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


/*
  ═══════════════════════════════════════════════════════
  PAGE: EDIT PROFILE
  ═══════════════════════════════════════════════════════
*/

async function loadEditProfilePage() {
  // Show loading state
  const titleEl = document.querySelector('#page-edit-profile .page-header h1');
  const originalTitle = titleEl.textContent;
  titleEl.innerHTML = '<div class="spinner" style="display: inline-block; margin-right: 8px;"></div>Loading profile…';

  try {
    const p = await API.getMyProfile();   // → ViewFullProfileDTO
    prefillEditForm(p);
    titleEl.textContent = originalTitle;
  } catch (err) {
    console.error('Could not load profile for editing:', err);
    titleEl.textContent = originalTitle;
    showToast('Could not load profile data', 'error');
  }
}

/*
  Pre-fill the edit form with the current user's existing data.
*/
function prefillEditForm(p) {
  document.getElementById('edit-name').value       = p.name       || '';
  document.getElementById('edit-age').value        = p.age        || '';
  document.getElementById('edit-gender').value     = p.gender     || '';
  document.getElementById('edit-city').value       = p.publicInfo?.city  || '';
  document.getElementById('edit-goal').value       = p.publicInfo?.goal  || '';
  document.getElementById('edit-bio').value        = p.publicInfo?.bio   || '';
  document.getElementById('edit-photo').value      = p.publicInfo?.photo || '';
  document.getElementById('edit-phone').value      = p.phone      || '';
  document.getElementById('edit-email-priv').value = p.email      || '';

  // Social: stored as an object, show as comma-separated values
  const social = p.publicInfo?.social || {};
  document.getElementById('edit-social').value = Object.values(social).join(', ');

  // Keywords: stored as array, show as comma-separated string
  document.getElementById('edit-keywords').value = (p.keywords || []).join(', ');

  // Update photo preview
  updateImagePreview(p.publicInfo?.photo, 'photo-preview', null, p.name);
}

// Cancel → go back to browse without saving
document.getElementById('btn-cancel-edit').addEventListener('click', () => {
  location.hash = 'browse';
});


/*
  ═══════════════════════════════════════════════════════
  PAGE: INVITATIONS
  ═══════════════════════════════════════════════════════
*/

async function loadInvitationsPage() {
  // Show loading state
  const titleEl = document.querySelector('#page-invitations .page-header h1');
  const originalTitle = titleEl.textContent;
  titleEl.innerHTML = '<div class="spinner" style="display: inline-block; margin-right: 8px;"></div>Loading…';

  try {
    const [received, sent] = await Promise.all([
      API.getReceivedInvitations(),   // → ViewInvitationDTO[]
      API.getSentInvitations(),       // → ViewInvitationDTO[]
    ]);
    renderInvitations('received', received);
    renderInvitations('sent', sent);
    updateInvBadge(received);
    titleEl.textContent = originalTitle;
  } catch (err) {
    console.error('Could not load invitations:', err);
    titleEl.textContent = originalTitle;
    showToast('Could not load invitations', 'error');
  }
}

/*
  Render a list of ViewInvitationDTO objects.
  listType: 'received' | 'sent'
*/
function renderInvitations(listType, items) {
  const container = document.getElementById('inv-list-' + listType);

  if (!items.length) {
    container.innerHTML = `
      <div class="empty-state">
        <p class="empty-icon">◉</p>
        <p>No ${listType} invitations yet.</p>
        <p class="text-muted" style="font-size: 13px; margin-top: 8px;">
          ${listType === 'received' ? 'When someone sends you an invitation, it will appear here.' : 'Invitations you send will appear here once accepted or declined.'}
        </p>
      </div>`;
    return;
  }

  container.innerHTML = items.map(inv => {
    const statusBadge = badgeForStatus(inv.status);

    // Accept/Decline buttons only shown for received pending invitations
    const actions = (listType === 'received' && inv.status === 'pending')
      ? `<div class="inv-item-actions">
           <button class="btn-primary btn-sm"  data-action="accepted" data-inv-id="${inv.id}">Accept</button>
           <button class="btn-ghost   btn-sm"  data-action="declined" data-inv-id="${inv.id}">Decline</button>
         </div>`
      : '';

    return `
      <div class="inv-item">
        <div>
          <div class="inv-item-name">${inv.senderName}</div>
          <div class="inv-item-meta">${statusBadge}</div>
        </div>
        ${actions}
      </div>`;
  }).join('');
}

/*
  Returns a badge HTML string for an invitation status.
*/
function badgeForStatus(status) {
  const map = {
    pending:  '<span class="badge badge-accent">pending</span>',
    accepted: '<span class="badge badge-success">accepted</span>',
    declined: '<span class="badge badge-danger">declined</span>',
  };
  return map[status] || `<span class="badge badge-muted">${status}</span>`;
}

/*
  Update the sidebar badge to show how many invitations are pending.
*/
function updateInvBadge(receivedList) {
  const pending = receivedList.filter(i => i.status === 'pending').length;
  const badge = document.getElementById('inv-badge');
  if (pending > 0) {
    badge.textContent = pending;
    badge.hidden = false;
  } else {
    badge.hidden = true;
  }
}

// Invitation list click — accept or decline
document.getElementById('inv-list-received').addEventListener('click', async e => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;

  const invId  = Number(btn.dataset.invId);
  const status = btn.dataset.action;   // 'accepted' or 'declined'

  const actionText = status === 'accepted' ? 'accept' : 'decline';
  const confirmed = await showConfirm(
    'Confirm Action',
    `Are you sure you want to ${actionText} this invitation?`
  );

  if (!confirmed) return;

  try {
    await API.updateInvitationStatus(invId, status);
    showToast(`Invitation ${actionText}ed!`, 'success');
    loadInvitationsPage();   // re-render the list
  } catch (err) {
    showToast('Could not update invitation: ' + err.message, 'error');
  }
});

// Tab switching: Received ↔ Sent
document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');

    const tab = btn.dataset.tab;
    document.getElementById('inv-list-received').hidden = (tab !== 'received');
    document.getElementById('inv-list-sent').hidden     = (tab !== 'sent');
  });
});


/*
  ═══════════════════════════════════════════════════════
  FORM: SEND INVITATION
  ═══════════════════════════════════════════════════════
*/

document.getElementById('form-send-invitation').addEventListener('submit', async e => {
  e.preventDefault();

  const toId = Number(document.getElementById('inv-to-id').value);
  if (!toId) return;

  const confirmed = await showConfirm(
    'Send Invitation',
    'Are you sure you want to send an invitation to this person?'
  );

  if (!confirmed) return;

  try {
    // CreateInvitationDTO { fromId, toId }
    // fromId comes from state.currentUserId (set after login)
    await API.createInvitation({ fromId: state.currentUserId, toId });
    showToast('Invitation sent successfully!', 'success');
  } catch (err) {
    showToast('Could not send invitation: ' + err.message, 'error');
  }
});


/*
  ═══════════════════════════════════════════════════════
  FORM: EDIT PROFILE  (UpdateProfileDTO)
  ═══════════════════════════════════════════════════════
*/

document.getElementById('form-update-profile').addEventListener('submit', async e => {
  e.preventDefault();
  const fd = new FormData(e.target);

  // Collect all form fields into a flat object.
  // api.js → updateMyProfile() shapes them into UpdateProfileDTO.
  const data = {
    name:     fd.get('name'),
    age:      fd.get('age'),
    gender:   fd.get('gender'),
    city:     fd.get('city'),
    goal:     fd.get('goal'),
    bio:      fd.get('bio'),
    photo:    fd.get('photo'),
    phone:    fd.get('phone'),
    email:    fd.get('email'),
    social:   fd.get('social'),
    keywords: fd.get('keywords'),
  };

  // Basic validation
  const nameField = document.getElementById('edit-name');
  const emailField = document.getElementById('edit-email-priv');
  const photoField = document.getElementById('edit-photo');

  const nameError = validateField(nameField, data.name, { required: true });
  const emailError = validateField(emailField, data.email, { email: true });
  const photoError = validateField(photoField, data.photo, { url: true });

  if (nameError || emailError || photoError) {
    showToast('Please fix the errors above', 'error');
    return;
  }

  try {
    await API.updateMyProfile(data);
    showToast('Profile saved successfully!', 'success');
    location.hash = 'my-profile';
  } catch (err) {
    showToast('Could not save profile: ' + err.message, 'error');
  }
});

// Photo URL preview
document.getElementById('edit-photo').addEventListener('input', function() {
  const name = document.getElementById('edit-name').value || '';
  updateImagePreview(this.value, 'photo-preview', null, name);
});


/*
  ═══════════════════════════════════════════════════════
  FORM: REGISTER  (CreateUserDTO)
  ═══════════════════════════════════════════════════════
*/

document.getElementById('form-register').addEventListener('submit', async e => {
  e.preventDefault();
  const fd = new FormData(e.target);

  const email = fd.get('email');
  const password = fd.get('password');

  // Validate fields
  const emailField = document.getElementById('reg-email');
  const passwordField = document.getElementById('reg-password');

  const emailError = validateField(emailField, email, { required: true, email: true });
  const passwordError = validateField(passwordField, password, { required: true, minLength: 8 });

  if (emailError || passwordError) {
    return;
  }

  try {
    // CreateUserDTO { email, password }
    const user = await API.createUser({
      email:    email,
      password: password,
    });
    state.currentUserId = user.id;
    document.getElementById('topbar-username').textContent = user.email;
    showToast('Account created successfully!', 'success');
    location.hash = 'edit-profile';   // fill in your profile after registering
  } catch (err) {
    showToast('Registration failed: ' + err.message, 'error');
  }
});


/*
  ═══════════════════════════════════════════════════════
  FORM: LOGIN
  ═══════════════════════════════════════════════════════
*/

document.getElementById('form-login').addEventListener('submit', async e => {
  e.preventDefault();
  const fd = new FormData(e.target);

  const email = fd.get('email');
  const password = fd.get('password');

  // Validate fields
  const emailField = document.getElementById('login-email');
  const passwordField = document.getElementById('login-password');

  const emailError = validateField(emailField, email, { required: true, email: true });
  const passwordError = validateField(passwordField, password, { required: true });

  if (emailError || passwordError) {
    return;
  }

  try {
    const result = await API.login({
      email:    email,
      password: password,
    });
    state.currentUserId = result.userId;
    document.getElementById('topbar-username').textContent = email;
    showToast('Welcome back!', 'success');
    location.hash = 'browse';
  } catch (err) {
    showToast('Login failed: ' + err.message, 'error');
  }
});


/*
  ═══════════════════════════════════════════════════════
  TOPBAR: LOGOUT
  ═══════════════════════════════════════════════════════
*/

document.getElementById('btn-logout').addEventListener('click', async () => {
  await API.logout();
  state.currentUserId = null;
  document.getElementById('topbar-username').textContent = '—';
  location.hash = 'login';
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
  iconMoon.hidden = (theme === 'light');
  iconSun.hidden = (theme === 'dark');
  if (theme === 'light') {
    // Spin the sun when switching to light theme
    iconSun.style.transition = 'transform 0.5s ease';
    iconSun.style.transform = 'rotate(360deg)';
    setTimeout(() => {
      iconSun.style.transform = '';
    }, 500);
  }
  localStorage.setItem('theme', theme);
}

btnTheme.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

applyTheme(localStorage.getItem('theme') || 'dark');


/*
  ═══════════════════════════════════════════════════════
  UTILITY FUNCTIONS
  ═══════════════════════════════════════════════════════
*/

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {string} type - 'success', 'error', or 'info'
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">×</button>
  `;

  container.appendChild(toast);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (toast.parentElement) {
      toast.remove();
    }
  }, 5000);
}

/**
 * Show a confirmation dialog
 * @param {string} title - Dialog title
 * @param {string} message - Dialog message
 * @returns {Promise<boolean>} - Resolves to true if confirmed, false if cancelled
 */
function showConfirm(title, message) {
  return new Promise((resolve) => {
    const dialog = document.getElementById('confirm-dialog');
    const titleEl = document.getElementById('confirm-title');
    const messageEl = document.getElementById('confirm-message');
    const cancelBtn = document.getElementById('confirm-cancel');
    const okBtn = document.getElementById('confirm-ok');

    titleEl.textContent = title;
    messageEl.textContent = message;
    dialog.hidden = false;

    const cleanup = () => {
      dialog.hidden = true;
      cancelBtn.onclick = null;
      okBtn.onclick = null;
    };

    cancelBtn.onclick = () => {
      cleanup();
      resolve(false);
    };

    okBtn.onclick = () => {
      cleanup();
      resolve(true);
    };
  });
}

/**
 * Validate a form field
 * @param {HTMLElement} field - The field element
 * @param {string} value - The value to validate
 * @param {Object} rules - Validation rules
 * @returns {string|null} - Error message or null if valid
 */
function validateField(field, value, rules = {}) {
  const errorEl = field.querySelector('.field-error') || field.parentElement.querySelector('.field-error');

  // Clear previous error
  field.classList.remove('error');
  if (errorEl) errorEl.style.display = 'none';

  // Required check
  if (rules.required && (!value || value.trim() === '')) {
    showFieldError(field, 'This field is required');
    return 'This field is required';
  }

  // Email validation
  if (rules.email && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      showFieldError(field, 'Please enter a valid email address');
      return 'Invalid email';
    }
  }

  // Min length
  if (rules.minLength && value && value.length < rules.minLength) {
    showFieldError(field, `Minimum ${rules.minLength} characters required`);
    return `Too short`;
  }

  // URL validation
  if (rules.url && value) {
    try {
      new URL(value);
    } catch {
      showFieldError(field, 'Please enter a valid URL');
      return 'Invalid URL';
    }
  }

  return null;
}

/**
 * Show field error
 * @param {HTMLElement} field - The field element
 * @param {string} message - Error message
 */
function showFieldError(field, message) {
  field.classList.add('error');
  const errorEl = field.parentElement.querySelector('.field-error');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = 'block';
  }
}

/**
 * Update image preview
 * @param {string} url - Image URL
 * @param {string} previewId - ID of preview element
 * @param {string} initialsId - ID of initials element
 * @param {string} name - Name for initials fallback
 */
function updateImagePreview(url, previewId, initialsId, name = '') {
  const preview = document.getElementById(previewId);
  const initials = document.getElementById(initialsId);

  if (url && url.trim()) {
    preview.innerHTML = `<img src="${url}" alt="Preview" onerror="this.parentElement.innerHTML='<span class=preview-initials>${name.charAt(0).toUpperCase()}</span>'" />`;
    if (initials) initials.style.display = 'none';
  } else {
    preview.innerHTML = `<span class="preview-initials">${name.charAt(0).toUpperCase() || '?'}</span>`;
    if (initials) initials.style.display = '';
  }
}
