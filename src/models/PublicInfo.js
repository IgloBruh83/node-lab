class PublicInfo {
    /**
     * @param {Object} data
     * @param {string} data.photo
     * @param {string} data.city
     * @param {string} data.goal
     * @param {string} data.bio
     */
    constructor({ photo, city, goal, bio }) {
        this.photo = photo;
        this.city = city;
        this.goal = goal;
        this.bio = bio;
    }
}

module.exports = PublicInfo;