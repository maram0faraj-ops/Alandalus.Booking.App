const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    // لتحديد صلاحيات المستخدم
    role: {
        type: String,
        enum: ['User', 'Admin'], // عادي أو مسؤول
        default: 'User'
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    whatsappNumber: {
        type: String,
        required: false 
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);