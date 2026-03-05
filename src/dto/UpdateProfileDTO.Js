class UpdateProfileDTO {
    /**
     * @param {Object} data
     * @param {string} [data.name]
     * @param {number|string} [data.age]
     * @param {string} [data.gender]
     * @param {string} [data.city]
     * @param {string} [data.goal]
     * @param {string} [data.bio]
     * @param {string} [data.photo]
     * @param {string} [data.phone]
     * @param {string} [data.email]
     * @param {Object} [data.social]
     * @param {string|string[]} [data.keywords]
     */
    constructor(data) {
        this.name = data.name;
        this.age = data.age ? Number(data.age) : undefined;
        this.gender = data.gender;

        this.publicInfo = {
            city: data.city,
            goal: data.goal,
            bio: data.bio,
            photo: data.photo
        };

        this.privateInfo = {
            phone: data.phone,
            email: data.email,
            social: data.social || {}
        };

        this.keywords = Array.isArray(data.keywords)
            ? data.keywords
            : (data.keywords ? data.keywords.split(',').map(s => s.trim()).filter(s => s !== "") : []);
    }
}

module.exports = UpdateProfileDTO;