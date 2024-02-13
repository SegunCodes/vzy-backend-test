const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  status: String, // 'paid' or 'unpaid'
});

const User = mongoose.model('User', userSchema);

module.exports = User;
