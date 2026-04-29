class ViewProfileDTO {
    /**
     * @param {Object} data
     * @param {number} data.id
     * @param {string} data.name
     * @param {number} data.age
     * @param {string} data.gender
     * @param {Object} data.publicInfo
     * @param {Array} [data.keywords]
     */
    constructor({ id, name, age, gender, publicInfo, keywords = [] }) {
        this.id = id;
        this.name = name;
        this.age = age;
        this.gender = gender;
        this.publicInfo = publicInfo;
        this.keywords = keywords ? keywords.map(k => k.value || k) : [];
    }
}

module.exports = ViewProfileDTO;