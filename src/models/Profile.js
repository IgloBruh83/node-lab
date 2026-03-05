const PublicInfo = require('./PublicInfo');
const PrivateInfo = require('./PrivateInfo');
const Keyword = require('./Keyword');

class Profile {
    /**
     * @param {Object} data
     * @param {number} data.id
     * @param {string} data.name
     * @param {number} data.age
     * @param {string} data.gender
     * @param {PublicInfo} data.publicInfo
     * @param {PrivateInfo} data.privateInfo
     * @param {Keyword[]} data.keywords
     */
    constructor({ id, name, age, gender, publicInfo, privateInfo, keywords }) {
        this.id = id;
        this.name = name;
        this.age = age;
        this.gender = gender;
        this.publicInfo = publicInfo;
        this.privateInfo = privateInfo;
        this.keywords = keywords;
    }
}

module.exports = Profile;