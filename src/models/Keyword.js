class Keyword {
    /**
     * @param {Object} data
     * @param {number} data.id
     * @param {string} data.value
     */
    constructor({ id, value }) {
        this.id = id;
        this.value = value;
    }
}

module.exports = Keyword;