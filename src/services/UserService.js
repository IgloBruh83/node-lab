
class UserService {
    async createUser(userData) {
        // ЗАГЛУШКА
        console.log("DB: Збереження нового користувача...", userData.email);
        
        return {
            id: 777, // ЗАГЛУШКА
            ...userData
        };
    }

    async updateUser(userId, updateData) {
        // ЗАГЛУШКА
        console.log(`DB: Оновлення запису з ID: ${userId}`);

        return {
            id: userId,
            ...updateData
        };
    }

    async findById(userId) {
        // ЗАГЛУШКА
        return {
            id: Number(userId),
            name: "Balbec",
            age: 28,
            gender: "male",
            publicInfo: {
                city: "Kyiv",
                goal: "Searching for a coding partner",
                bio: "I am a software developer who loves sports. Looking for someone to play tennis with and discuss JavaScript.",
                photo: "https://example.com/photo.jpg"
            },
            privateInfo: {
                phone: "+380991234567",
                email: "balbec@example.com",
                social: { telegram: "@balbec_dev", instagram: "@balbec_sport" }
            },
            keywords: [
                { value: "tennis" }, 
                { value: "javascript" }, 
                "node.js"
            ]
        };
    }
}

module.exports = new UserService();