// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const User = require('../models/User');

// 1. مسار تسجيل الدخول (POST /api/auth/login)
router.post('/login', authController.login);

// 2. ✅ مسار إنشاء حساب جديد (POST /api/auth/register) - (تمت إضافته)
router.post('/register', authController.register);

// 3. مسار لجلب بيانات المستخدم الحالي (GET /api/auth)
// مفيد لـ React لكي يتذكر المستخدم عند تحديث الصفحة
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;