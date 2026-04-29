const CreateUserDTO = require('../dtos/CreateUserDTO');
const UpdateProfileDTO = require('../dtos/UpdateProfileDTO');
const ViewProfileDTO = require('../dtos/ViewProfileDTO');
const ViewFullProfileDTO = require('../dtos/ViewFullProfileDTO');

// Гіпотетичний сервіс для роботи з базою даних
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
        
        // ТИМЧАСОВО
        res.json(new ViewFullProfileDTO(user)); 
    } catch (error) {
        res.status(404).json({ error: "Профіль не знайдено" });
    }
}
}

module.exports = new UserController();