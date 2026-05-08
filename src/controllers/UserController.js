const UserService = require('../services/UserService');
const CreateUserDTO = require('../dtos/CreateUserDTO');
const UpdateProfileDTO = require('../dtos/UpdateProfileDTO');
const ViewProfileDTO = require('../dtos/ViewProfileDTO');
const ViewFullProfileDTO = require('../dtos/ViewFullProfileDTO');

class UserController {
    async create(req, res) {
        try {
            const dto = new CreateUserDTO(req.body);
            const user = await UserService.create({ ...dto, name: req.body.name });
            res.status(201).json(new ViewFullProfileDTO(user));
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getAll(req, res) {
        try {
            const excludeId = req.query.exclude;
            const users = await UserService.getAll(excludeId);
            
            const response = users.map(u => new ViewProfileDTO(u));
            res.json(response);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Не вдалося отримати список користувачів" });
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
            res.json({ message: "Користувача успішно видалено" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new UserController();