const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    generatedUrl: { type: String, default: null } // To store the URL later
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);