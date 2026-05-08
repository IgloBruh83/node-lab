const UserService = require('../services/UserService');
const ViewFullProfileDTO = require('../dtos/ViewFullProfileDTO');

class AuthController {
    async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ message: "Email та пароль обов'язкові" });
            }

            const user = await UserService.findByEmail(email);

            if (!user || user.password !== password) {
                return res.status(401).json({ message: "Невірний email або пароль" });
            }

            res.json(new ViewFullProfileDTO(user));
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new AuthController();