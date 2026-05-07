// public/js/api.js
const API_URL = '/api';

window.API = {
    async register(email, password) {
        const res = await fetch(`${API_URL}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        return res.json();
    },

    async getProfiles() {
        const res = await fetch(`${API_URL}/users`); 
        if (!res.ok) {
            console.error("Не вдалося завантажити список користувачів");
            return [];
        }
        return res.json();
    },

    async getProfileById(id) {
        const res = await fetch(`${API_URL}/users/profile/${id}`);
        return res.json();
    },

    async updateProfile(id, profileData) {
        const res = await fetch(`${API_URL}/users/profile/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profileData)
        });
        return res.json();
    },

    async sendInvitation(toId) {
        const res = await fetch(`${API_URL}/invitations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ toId })
        });
        return res.json();
    },

    async getMyInvitations() {
        const res = await fetch(`${API_URL}/invitations/my`);
        return res.json();
    }
};