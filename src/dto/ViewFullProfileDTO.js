const ViewProfileDTO = require('./ViewProfileDTO');

class ViewFullProfileDTO extends ViewProfileDTO {
    /**
     * @param {Object} data
     * @param {number} data.id
     * @param {string} data.name
     * @param {number} data.age
     * @param {string} data.gender
     * @param {Object} data.publicInfo
     * @param {Array} [data.keywords]
     * @param {Object} [data.privateInfo]
     * @param {string} [data.privateInfo.phone]
     * @param {string} [data.privateInfo.email]
     * @param {Object} [data.privateInfo.social]
     */
    constructor(data) {
        super(data);

        const privateInfo = data.privateInfo || {};
        this.phone = privateInfo.phone;
        this.email = privateInfo.email;
        this.social = privateInfo.social || {};
    }
}

module.exports = ViewFullProfileDTO;