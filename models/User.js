const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  password: String, // plain text for now
  role: { type: String, default: 'user' }
});

module.exports = mongoose.model('User', userSchema);
