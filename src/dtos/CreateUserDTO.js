class CreateUserDTO {
    /**
     * @param {Object} param0
     * @param {string} param0.email
     * @param {string} param0.password 
     */
    constructor({ email, password }) {
        this.email = email;
        this.password = password;
    }
}

module.exports = CreateUserDTO;