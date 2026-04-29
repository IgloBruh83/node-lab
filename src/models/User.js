
class User {
    /**
     * @param {Object} data
     * @param {number} data.id
     * @param {string} data.email
     * @param {string} data.password
     * @param {string} data.name
     * @param {number} data.age
     * @param {string} data.gender
     * @param {Object} data.publicInfo
     * @param {Object} data.privateInfo
     * @param {Array} data.keywords
     */
    constructor({ id, email, password, name, age, gender, publicInfo, privateInfo, keywords }) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.name = name;
        this.age = age;
        this.gender = gender;
        this.publicInfo = publicInfo || {}; 
        this.privateInfo = privateInfo || {};
        this.keywords = keywords || [];
    }
}

module.exports = User;