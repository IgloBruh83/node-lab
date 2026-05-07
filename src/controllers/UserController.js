const CreateUserDTO = require('../dtos/CreateUserDTO');
const UpdateProfileDTO = require('../dtos/UpdateProfileDTO');
const ViewProfileDTO = require('../dtos/ViewProfileDTO');
const ViewFullProfileDTO = require('../dtos/ViewFullProfileDTO');

const UserService = require('../services/UserService');

class UserController {
    async register(req, res) {
        try {
            const userData = new CreateUserDTO(req.body);
            
            const newUser = await UserService.createUser(userData);
            res.status(201).json({ message: "Користувача створено", id: newUser.id });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async updateProfile(req, res) {
        try {
            const updateData = new UpdateProfileDTO(req.body);
            
            const updatedUser = await UserService.updateUser(req.params.id, updateData);
            res.json({ message: "Профіль оновлено", data: updatedUser });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getProfile(req, res) {
        try {
            const user = await UserService.findById(req.params.id);
            
            res.json(new ViewFullProfileDTO(user)); 
        } catch (error) {
            res.status(404).json({ error: "Профіль не знайдено" });
        }

        
    }

    async getAllUsers(req, res) {
    try {
        const users = await UserService.getAllUsers();
        
        const userDtos = users.map(user => new ViewProfileDTO(user));
        
        res.json(userDtos);
    } catch (error) {
        console.error("Помилка контролера при отриманні списку:", error);
        res.status(500).json({ error: "Не вдалося отримати список користувачів" });
    }
}
}

module.exports = new UserController();