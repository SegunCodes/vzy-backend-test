const userService = require('../services/UserService');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

class UserController {
  async register(req, res) {
    const { username, password } = req.body;

    try {
        // Check if the username already exists
        const existingUser = await userService.getUserByUsername(username);
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }
        // Create a new user account
        await userService.registerUser(username, password);
        // Generate access token
        const accessToken = jwt.sign({ username }, process.env.JWT_SECRET_KEY, { expiresIn: '1m' });
      res.json({ accessToken });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error registering user' });
    }
  }

  async login(req, res) {
    const { username, password } = req.body;

    try {
      // Check if the username exists
      const user = await userService.getUserByUsername(username);
      if (!user) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }
      
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      const accessToken = jwt.sign({ username }, process.env.JWT_SECRET_KEY, { expiresIn: '1m' });
      res.json({ accessToken });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error during login' });
    }
  }

  async updateStatus(req, res) {
    const { userId, status } = req.body;

    try {
      await userService.updateUserStatus(userId, status);
      res.json({ message: 'User status updated' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error updating user status' });
    }
  }
}

module.exports = new UserController();
