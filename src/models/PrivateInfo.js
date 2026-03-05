class PrivateInfo {
    /**
     * @param {Object} data
     * @param {string} data.phone
     * @param {string} data.email
     * @param {Object} data.social
     */
    constructor({ phone, email, social = {} }) {
        this.phone = phone;
        this.email = email;
        this.social = social;
    }
}

module.exports = PrivateInfo;