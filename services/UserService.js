const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const saltRounds = 10;

class UserService {

    async getUserByUsername(username) {
        return User.findOne({ username });
    }
    async registerUser(username, password) {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
    }

    async updateUserStatus(userId, status) {
        // Update user status in the database
        await User.findByIdAndUpdate(userId, { status });
    }
}

module.exports = new UserService();
