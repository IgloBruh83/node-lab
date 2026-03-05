class User {
    /**
     * @param {Object} data
     * @param {number} data.id
     * @param {string} data.email
     * @param {string} data.password
     * @param {number} data.profileId
     */
    constructor({ id, email, password, profileId }) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.profileId = profileId;
    }
}

module.exports = User;