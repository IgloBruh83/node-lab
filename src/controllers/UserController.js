const UserService = require('../services/UserService');
const ViewProfileDTO = require('../dtos/ViewProfileDTO');
const ViewFullProfileDTO = require('../dtos/ViewFullProfileDTO');
const UpdateProfileDTO = require('../dtos/UpdateProfileDTO');

class UserController {
    async create(req, res) {
        try {
            const user = await UserService.create(req.body);
            res.status(201).json(new ViewFullProfileDTO(user));
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getAll(req, res) {
        try {
            const users = await UserService.getAll(req.query.exclude);
            res.json(users.map(u => new ViewProfileDTO(u)));
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getById(req, res) {
        try {
            const { id } = req.params;
            const viewerId = req.query.viewerId; 
            
            const user = await UserService.getById(id, viewerId);
            if (!user) return res.status(404).json({ message: "Користувача не знайдено" });
            
            res.json(new ViewFullProfileDTO(user));
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async update(req, res) {
        try {
            const dto = new UpdateProfileDTO(req.body);
            const updatedUser = await UserService.update(req.params.id, dto);
            
            res.json(new ViewFullProfileDTO(updatedUser));
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async delete(req, res) {
        try {
            await UserService.delete(req.params.id);
            res.json({ message: "Успішно видалено" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new UserController();