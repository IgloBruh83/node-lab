class ViewProfileDTO {
    constructor(user) {
        this.id = user.id;
        this.name = user.name;
        this.age = user.age;
        this.gender = user.gender;
        
        this.publicInfo = user.publicInfo ? {
            photo: user.publicInfo.photo,
            city: user.publicInfo.city,
            goal: user.publicInfo.goal,
            bio: user.publicInfo.bio
        } : {};

        const tags = user.Keywords || user.keywords || [];
        this.keywords = tags.map(k => k.value || k);
    }
}

module.exports = ViewProfileDTO;