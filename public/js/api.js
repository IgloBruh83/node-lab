// public/js/api.js
const API_URL = '/api';

window.API = {
    // Реєстрація (використовує CreateUserDTO на бекенді)
    async register(email, password) {
        const res = await fetch(`${API_URL}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        return res.json();
    },

    // Отримання списку профілів (для сторінки Browse)
    async getProfiles() {
        // Оскільки у нас ще немає окремого маршруту для списку, 
        // імітуємо отримання масиву на основі даних сервісу
        const res = await fetch(`${API_URL}/users/profile/777`); 
        const user = await res.json();
        return [user];
    },

    // Отримання одного профілю (використовує ViewFullProfileDTO або ViewProfileDTO)
    async getProfileById(id) {
        const res = await fetch(`${API_URL}/users/profile/${id}`);
        return res.json();
    },

    // Оновлення профілю (використовує UpdateProfileDTO)
    async updateProfile(id, profileData) {
        const res = await fetch(`${API_URL}/users/profile/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profileData)
        });
        return res.json();
    },

    // Відправка запиту (використовує CreateInvitationDTO)
    async sendInvitation(toId) {
        const res = await fetch(`${API_URL}/invitations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ toId })
        });
        return res.json();
    },

    // Отримання списку запрошень (використовує ViewInvitationDTO)
    async getMyInvitations() {
        const res = await fetch(`${API_URL}/invitations/my`);
        return res.json();
    }
};