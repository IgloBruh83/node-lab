const API_BASE = '/api';

window.API = {
    async _fetch(url, options = {}) {
        const res = await fetch(`${API_BASE}${url}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || data.message || 'Помилка сервера');
        }

        return data;
    },

    // === АВТОРИЗАЦІЯ (AUTH) ===
    async login(credentials) {
        return this._fetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    },

    // Реєстрація
    async register(userData) {
        return this._fetch('/users', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },

    // === КОРИСТУВАЧІ (USER CRUD) ===

    async getUsers(excludeId) {
        const url = excludeId ? `/users?exclude=${excludeId}` : '/users';
        return this._fetch(url);
    },

    async getUserById(id, viewerId) {
        const url = (viewerId !== undefined) 
            ? `/users/${id}?viewerId=${viewerId}` 
            : `/users/${id}`;
            
        return this._fetch(url);
    },

    async updateUser(id, updateData) {
        return this._fetch(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });
    },

    async deleteUser(id) {
        return this._fetch(`/users/${id}`, {
            method: 'DELETE'
        });
    },

    // === ЗАПРОШЕННЯ (INVITATIONS) ===

    async sendInvitation(invitationData) {
        return this._fetch('/invitations', {
            method: 'POST',
            body: JSON.stringify(invitationData)
        });
    },

    async getUserInvitations(userId) {
        return this._fetch(`/invitations/user/${userId}`);
    },

    async updateInvitationStatus(id, status) {
        return this._fetch(`/invitations/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
    },

    async cancelInvitation(id) {
        return this._fetch(`/invitations/${id}`, {
            method: 'DELETE'
        });
    }
};