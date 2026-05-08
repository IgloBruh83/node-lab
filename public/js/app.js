document.addEventListener('DOMContentLoaded', () => {
    const state = {
        user: JSON.parse(localStorage.getItem('user')) || null,
        profiles: [],
        currentProfile: null,
        invitations: []
    };

    // --- Routing ---
    const routes = {
        '#browse': () => renderBrowse(),
        '#profile': (p) => renderProfileDetails(p),
        '#my-profile': () => renderMyProfile(),
        '#edit-profile': () => renderEditProfile(),
        '#invitations': () => renderInvitations(),
        '#login': () => showPage('page-login'),
        '#register': () => showPage('page-register')
    };

    function navigate() {
        const hash = window.location.hash || '#browse';
        
        if (!state.user && hash !== '#register' && hash !== '#login') {
            window.location.hash = '#login';
            return;
        }
        
        const [page, query] = hash.split('?');
        if (routes[page]) {
            routes[page](new URLSearchParams(query));
        }
    }

    window.addEventListener('hashchange', navigate);

    let currentPage = 1;
    let searchQuery = "";

    async function renderBrowse() {
        showPage('page-browse');
        const grid = document.getElementById('profiles-grid');
        const pagination = document.getElementById('browse-pagination');
        
        try {
            const data = await window.API.getUsers({
                exclude: state.user.id,
                page: currentPage,
                q: searchQuery,
                limit: 6
            });

            state.profiles = data.users;
            grid.innerHTML = '';

            if (state.profiles.length === 0) {
                document.getElementById('browse-empty').hidden = false;
                pagination.style.display = 'none';
                return;
            }

            document.getElementById('browse-empty').hidden = true;
            pagination.style.display = 'flex';

            // --- ГЕНЕРАЦІЯ КАРТОК ---
            state.profiles.forEach(p => {
                const tpl = document.getElementById('tpl-profile-card').content.cloneNode(true);
                const card = tpl.querySelector('.profile-card');
                
                card.onclick = () => { 
                    window.location.hash = `#profile?id=${p.id}`; 
                };

                const img = card.querySelector('.card-avatar img');
                const spanInitials = card.querySelector('.card-avatar span');
                
                if (p.publicInfo?.photo) {
                    img.src = p.publicInfo.photo;
                    img.alt = p.name;
                    spanInitials.style.display = 'none';
                } else {
                    img.style.display = 'none';
                    spanInitials.textContent = p.name ? p.name[0].toUpperCase() : '?';
                }

                card.querySelector('.name').textContent = `${p.name}, ${p.age || '?'}`;
                card.querySelector('.meta').textContent = p.publicInfo?.city || 'Місто не вказано';

                const kwContainer = card.querySelector('.keywords');
                kwContainer.innerHTML = '';
                (p.keywords || []).slice(0, 3).forEach(word => {
                    const chip = document.createElement('span');
                    chip.className = 'chip';
                    chip.textContent = word;
                    kwContainer.appendChild(chip);
                });

                grid.appendChild(tpl);
            });
            // --- ОНОВЛЕННЯ ПАГІНАЦІЇ ---
            document.getElementById('page-info').textContent = `Page ${data.currentPage} of ${data.totalPages}`;
            
            const btnPrev = document.getElementById('btn-prev-page');
            const btnNext = document.getElementById('btn-next-page');

            btnPrev.disabled = data.currentPage <= 1;
            btnNext.disabled = data.currentPage >= data.totalPages;

            btnPrev.onclick = () => { if (currentPage > 1) { currentPage--; renderBrowse(); } };
            btnNext.onclick = () => { if (currentPage < data.totalPages) { currentPage++; renderBrowse(); } };

        } catch (e) {
            alert("Помилка завантаження: " + e.message);
        }
    }

    document.getElementById('browse-search').oninput = (e) => {
        searchQuery = e.target.value;
        currentPage = 1;
        renderBrowse();
    };

    async function renderProfileDetails(params) {
        showPage('page-profile');
        
        const id = params.get('id');
        if (!id) {
            window.location.hash = '#browse';
            return;
        }

        try {
            const p = await window.API.getUserById(id, state.user.id);
            
            // --- ЗАПОВНЕННЯ ВІЗУАЛУ ---

            document.getElementById('prof-name').textContent = p.name;
            document.getElementById('prof-sub').textContent = 
                `${p.age || '?'} років, ${p.gender || 'Стать не вказана'} • ${p.publicInfo?.city || 'Місто не вказано'}`;

            const img = document.getElementById('prof-photo');
            const initials = document.getElementById('prof-initials');
            
            if (p.publicInfo?.photo) {
                img.src = p.publicInfo.photo;
                img.style.display = 'block';
                initials.style.display = 'none';
            } else {
                img.style.display = 'none';
                initials.style.display = 'block';
                initials.textContent = p.name ? p.name[0].toUpperCase() : '?';
            }

            const kwList = document.getElementById('prof-keywords');
            kwList.innerHTML = '';
            if (p.keywords && p.keywords.length > 0) {
                p.keywords.forEach(word => {
                    const span = document.createElement('span');
                    span.className = 'chip';
                    span.textContent = word;
                    kwList.appendChild(span);
                });
            }

            document.getElementById('prof-bio').textContent = p.publicInfo?.bio || 'Користувач ще не додав опис.';
            document.getElementById('prof-goal').textContent = p.publicInfo?.goal ? `Мета: ${p.publicInfo.goal}` : '';

            // 7. Приватна інформація (показується бекендом тільки якщо є MATCH)
            const privateBox = document.getElementById('prof-private');
            if (p.phone || p.privateEmail) {
                privateBox.hidden = false;
                document.getElementById('prof-phone').textContent = p.phone || '—';
                document.getElementById('prof-email').textContent = p.privateEmail || '—';
            } else {
                privateBox.hidden = true;
            }

            // --- ЛОГІКА КНОПКИ ЗАПРОШЕННЯ ---

            const sendBtn = document.getElementById('btn-send-invitation');
            
            const newBtn = sendBtn.cloneNode(true);
            sendBtn.parentNode.replaceChild(newBtn, sendBtn);

            if (p.outgoingInvitation) {
                newBtn.textContent = 'Cancel invitation';
                newBtn.className = 'btn-ghost';
                newBtn.style.color = 'var(--danger)';
                newBtn.style.borderColor = 'var(--danger)';

                newBtn.onclick = async () => {
                    if (confirm('Ви впевнені, що хочете скасувати цей запит?')) {
                        try {
                            await window.API.cancelInvitation(p.outgoingInvitation.id);
                            renderProfileDetails(params);
                        } catch (err) {
                            alert("Не вдалося скасувати: " + err.message);
                        }
                    }
                };
            } else {
                newBtn.textContent = 'Send invitation';
                newBtn.className = 'btn-primary';
                newBtn.style.color = '';
                newBtn.style.borderColor = '';

                newBtn.onclick = async () => {
                    try {
                        await window.API.sendInvitation({ fromId: state.user.id, toId: p.id });
                        renderProfileDetails(params);
                    } catch (err) {
                        alert("Помилка надсилання: " + err.message);
                    }
                };
            }

            document.getElementById('btn-back-to-browse').onclick = () => {
                window.location.hash = '#browse';
            };

        } catch (e) {
            console.error(e);
            alert("Помилка: " + e.message);
            window.location.hash = '#browse';
        }
    }

    async function renderMyProfile() {
        showPage('page-my-profile');
        try {
            const p = await window.API.getUserById(state.user.id, state.user.id);
            
            document.getElementById('my-name').textContent = p.name;
            
            const subText = `${p.age || '?'} років, ${p.gender || 'Стать не вказана'} • ${p.publicInfo?.city || 'Місто не вказано'}`;
            document.getElementById('my-sub').textContent = subText;

            const img = document.getElementById('my-photo');
            const initials = document.getElementById('my-initials');
            
            if (p.publicInfo?.photo) {
                img.src = p.publicInfo.photo;
                img.style.display = 'block';
                initials.style.display = 'none';
            } else {
                img.style.display = 'none';
                initials.style.display = 'block';
                initials.textContent = p.name ? p.name[0].toUpperCase() : '?';
            }

            const kwList = document.getElementById('my-keywords');
            kwList.innerHTML = '';
            if (p.keywords && p.keywords.length > 0) {
                p.keywords.forEach(word => {
                    const span = document.createElement('span');
                    span.className = 'chip';
                    span.textContent = word;
                    kwList.appendChild(span);
                });
            }

            document.getElementById('my-bio').textContent = p.publicInfo?.bio || 'Ви ще не додали опис про себе.';
            document.getElementById('my-goal-text').textContent = p.publicInfo?.goal ? `Мета: ${p.publicInfo.goal}` : '';

            document.getElementById('my-phone').textContent = p.phone || '—';
            document.getElementById('my-email-priv').textContent = p.privateEmail || '—';

        } catch (e) { 
            console.error(e);
            alert("Помилка завантаження вашого профілю: " + e.message); 
        }
    }

    async function renderEditProfile() {
    showPage('page-edit-profile');
    const form = document.getElementById('form-update-profile');
    
    try {
        const p = await window.API.getUserById(state.user.id, state.user.id);
        
        document.getElementById('edit-name').value = p.name || '';
        document.getElementById('edit-age').value = p.age || '';
        document.getElementById('edit-gender').value = p.gender || '';
        document.getElementById('edit-city').value = p.publicInfo?.city || '';
        document.getElementById('edit-goal').value = p.publicInfo?.goal || '';
        document.getElementById('edit-bio').value = p.publicInfo?.bio || '';
        document.getElementById('edit-photo').value = p.publicInfo?.photo || '';
        document.getElementById('edit-phone').value = p.phone || '';
        document.getElementById('edit-email-priv').value = p.privateEmail || '';
        
        if (p.keywords) {
            document.getElementById('edit-keywords').value = p.keywords.join(', ');
        }
    } catch (e) {
        alert("Помилка завантаження даних: " + e.message);
    }
}

    let activeInvTab = 'received'; 

    async function renderInvitations() {
        showPage('page-invitations');
        const list = document.getElementById('inv-list');
        list.innerHTML = '<p class="text-muted">Завантаження...</p>';

        const tabs = document.querySelectorAll('.tabs .tab');
        tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === activeInvTab);
            tab.onclick = () => {
                activeInvTab = tab.dataset.tab;
                renderInvitations();
            };
        });

        try {
            const invs = await window.API.getUserInvitations(state.user.id);
            list.innerHTML = '';

            const filtered = invs.filter(inv => {
                const myId = Number(state.user.id);
                if (activeInvTab === 'received') {
                    return Number(inv.toId) === myId;
                } else {
                    return Number(inv.fromId) === myId;
                }
            });

            if (filtered.length === 0) {
                list.innerHTML = `<p class="text-muted">У вас поки немає ${activeInvTab === 'received' ? 'отриманих' : 'відправлених'} запитів.</p>`;
                return;
            }

            filtered.forEach(inv => {
                const tpl = document.getElementById('tpl-invitation').content.cloneNode(true);
                
                const targetName = activeInvTab === 'received' ? inv.senderName : inv.receiverName;
                const targetAge = activeInvTab === 'received' ? inv.senderAge : inv.receiverAge;
                const targetId = activeInvTab === 'received' ? inv.fromId : inv.toId;

                const link = tpl.querySelector('.inv-link');
                if (link) {
                    link.href = `#profile?id=${targetId}`;
                    link.querySelector('.inv-user-name').textContent = `${targetName || 'Unknown'}, ${targetAge || '?'}`;
                }

                const statusLabel = tpl.querySelector('.inv-status-label');
                if (statusLabel) {
                    statusLabel.textContent = inv.status;
                    statusLabel.className = `inv-status-label status-${inv.status}`;
                }

                const actions = tpl.querySelector('.inv-actions');
                const btnAccept = tpl.querySelector('.btn-accept');
                const btnReject = tpl.querySelector('.btn-reject');
                const btnCancel = tpl.querySelector('.btn-cancel');

                if (activeInvTab === 'received') {
                    if (btnCancel) btnCancel.remove();
                    if (inv.status === 'pending') {
                        btnAccept.onclick = () => updateInv(inv.id, 'accepted');
                        btnReject.onclick = () => updateInv(inv.id, 'rejected');
                    } else if (actions) {
                        actions.remove();
                    }
                } else {
                    if (btnAccept) btnAccept.remove();
                    if (btnReject) btnReject.remove();
                    if (btnCancel) {
                        btnCancel.onclick = async () => {
                            if (confirm('Скасувати цей запит?')) {
                                await window.API.cancelInvitation(inv.id);
                                renderInvitations();
                            }
                        };
                    }
                }

                list.appendChild(tpl);
            });
        } catch (e) { 
            console.error(e);
            list.innerHTML = `<p class="text-danger">Помилка: ${e.message}</p>`;
        }
    }

    async function updateInv(id, status) {
        try {
            await window.API.updateInvitationStatus(id, status);
            renderInvitations();
        } catch (e) { alert(e.message); }
    }

    // --- UI Helpers ---
    function showPage(id) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('page-active'));
        const target = document.getElementById(id);
        if (target) {
            target.classList.add('page-active');
        }
        
        const isAuthPage = id === 'page-login' || id === 'page-register';
        document.getElementById('sidebar').hidden = isAuthPage;
        document.getElementById('topbar-user').hidden = isAuthPage;

        if (state.user) {
            document.getElementById('topbar-username').textContent = state.user.name;
        }
    }

    // --- Forms ---

    document.getElementById('form-login').onsubmit = async (e) => {
        e.preventDefault();
        const credentials = {
            email: e.target.email.value,
            password: e.target.password.value
        };

        try {
            const user = await window.API.login(credentials);
            state.user = user;
            localStorage.setItem('user', JSON.stringify(user));
            window.location.hash = '#browse';
        } catch (err) {
            alert("Помилка входу: " + err.message);
        }
    };

    document.getElementById('form-register').onsubmit = async (e) => {
        e.preventDefault();
        const userData = {
            name: e.target.username.value,
            email: e.target.email.value,
            password: e.target.password.value
        };

        try {
            await window.API.register(userData);
            alert("Реєстрація успішна! Тепер ви можете увійти.");
            window.location.hash = '#login';
        } catch (err) {
            alert("Помилка реєстрації: " + err.message);
        }
    };

    const updateForm = document.getElementById('form-update-profile');
    if (updateForm) {
        updateForm.onsubmit = async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());

            try {
                const updatedUser = await window.API.updateUser(state.user.id, data);
                
                state.user = updatedUser;
                localStorage.setItem('user', JSON.stringify(updatedUser));
                
                alert("Зміни збережено успішно!");
                window.location.hash = '#my-profile';
            } catch (err) {
                console.error(err);
                alert("Не вдалося зберегти зміни: " + err.message);
            }
        };
    }

    document.getElementById('btn-logout').onclick = () => {
        localStorage.removeItem('user');
        state.user = null;
        window.location.hash = '#login';
    };

    navigate();
});