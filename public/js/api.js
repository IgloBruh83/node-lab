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

    getUsers: async (params = {}) => {
        const query = new URLSearchParams(params).toString();
        const res = await fetch(`/api/users?${query}`);
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Failed to fetch users");
        }
        return res.json();
    },

    getUserById: async (id, viewerId) => {
        const res = await fetch(`/api/users/${id}?viewerId=${viewerId}`);
        return res.json();
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