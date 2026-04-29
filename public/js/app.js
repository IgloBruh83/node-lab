// public/js/app.js

const state = {
    currentUserId: 777, // За замовчуванням використовуємо ID з твоєї заглушки
    profiles: []
};

// ─── РОУТЕР ──────────────────────────────────────────
async function router() {
    const hash = window.location.hash || '#browse';
    const sections = document.querySelectorAll('.page');
    sections.forEach(s => s.classList.remove('page-active'));

    if (hash === '#browse') {
        renderPage('page-browse', loadBrowse);
    } else if (hash.startsWith('#profile/')) {
        const id = hash.split('/')[1];
        renderPage('page-profile', () => loadProfileDetail(id));
    } else if (hash === '#my-profile') {
        renderPage('page-my-profile', loadMyProfile);
    } else if (hash === '#edit-profile') {
        renderPage('page-edit-profile', prepareEditForm);
    } else if (hash === '#invitations') {
        renderPage('page-invitations', loadInvitations);
    } else {
        document.getElementById(`page-${hash.replace('#', '')}`)?.classList.add('page-active');
    }
}

function renderPage(id, loadFn) {
    document.getElementById(id).classList.add('page-active');
    if (loadFn) loadFn();
}

// ─── ЛОГІКА ЗАВАНТАЖЕННЯ ДАНИХ ────────────────────────

async function loadBrowse() {
    const grid = document.getElementById('profiles-grid');
    grid.innerHTML = '<p>Завантаження...</p>';
    const profiles = await window.API.getProfiles();
    
    grid.innerHTML = profiles.map(p => `
        <div class="card profile-card" onclick="location.hash='#profile/${p.id}'">
            <img src="${p.publicInfo?.photo || ''}" class="card-img" onerror="this.src='https://via.placeholder.com/150'">
            <div class="card-body">
                <h3>${p.name}, ${p.age}</h3>
                <p class="text-muted">${p.publicInfo?.city || 'Невідомо'}</p>
                <div class="chip-list">
                    ${p.keywords.map(k => `<span class="chip">${k}</span>`).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

async function loadProfileDetail(id) {
    const p = await window.API.getProfileById(id);
    
    document.getElementById('prof-name').textContent = `${p.name}, ${p.age}`;
    document.getElementById('prof-photo').src = p.publicInfo?.photo || '';
    document.getElementById('prof-sub').textContent = `${p.gender} · ${p.publicInfo?.city}`;
    document.getElementById('prof-bio').textContent = p.publicInfo?.bio;
    document.getElementById('prof-goal').textContent = p.publicInfo?.goal;
    document.getElementById('inv-to-id').value = p.id;
    
    const kwContainer = document.getElementById('prof-keywords');
    kwContainer.innerHTML = p.keywords.map(k => `<span class="chip">${k}</span>`).join('');

    // Показуємо приватну інфу, якщо вона є (для матчів)
    const priv = document.getElementById('prof-private');
    if (p.phone || p.email) {
        priv.hidden = false;
        document.getElementById('prof-phone').textContent = p.phone;
        document.getElementById('prof-email').textContent = p.email;
    } else {
        priv.hidden = true;
    }
}

async function loadMyProfile() {
    const p = await window.API.getProfileById(state.currentUserId);
    document.getElementById('my-name').textContent = p.name;
    document.getElementById('my-photo').src = p.publicInfo?.photo || '';
    document.getElementById('my-sub').textContent = `${p.age} років · ${p.gender}`;
    document.getElementById('my-city').textContent = p.publicInfo?.city;
    document.getElementById('my-bio').textContent = p.publicInfo?.bio;
    document.getElementById('my-phone').textContent = p.phone || '—';
    document.getElementById('my-email-priv').textContent = p.email || '—';
}

async function prepareEditForm() {
    const p = await window.API.getProfileById(state.currentUserId);
    const form = document.getElementById('form-update-profile');
    
    form['name'].value = p.name;
    form['age'].value = p.age;
    form['gender'].value = p.gender;
    form['city'].value = p.publicInfo?.city;
    form['goal'].value = p.publicInfo?.goal;
    form['bio'].value = p.publicInfo?.bio;
    form['photo'].value = p.publicInfo?.photo;
    form['phone'].value = p.phone;
    form['email'].value = p.email;
    form['keywords'].value = p.keywords.join(', ');
}

async function loadInvitations() {
    const list = await window.API.getMyInvitations(); // Отримуємо дані з заглушки InvitationService
    const container = document.getElementById('inv-list-received');
    
    container.innerHTML = list.map(inv => `
        <div class="card" style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <strong>${inv.senderName}</strong>
                <p class="text-muted" style="font-size: 13px;">Статус: ${inv.status}</p>
            </div>
            ${inv.status === 'pending' ? '<button class="btn-primary btn-sm">Прийняти</button>' : ''}
        </div>
    `).join('');
}

// ─── ОБРОБКА ПОДІЙ ───────────────────────────────────

document.getElementById('form-update-profile').onsubmit = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    await window.API.updateProfile(state.currentUserId, data);
    alert('Профіль оновлено!');
    location.hash = '#my-profile';
};

document.getElementById('form-send-invitation').onsubmit = async (e) => {
    e.preventDefault();
    const toId = document.getElementById('inv-to-id').value;
    const res = await window.API.sendInvitation(toId);
    if (res.error) alert(res.error);
    else alert('Запит надіслано!');
};

document.getElementById('btn-theme').onclick = () => {
    document.body.classList.toggle('dark-theme');
};

document.getElementById('btn-back-to-browse').onclick = () => {
    location.hash = '#browse';
};

// Ініціалізація
window.addEventListener('hashchange', router);
window.onload = router;