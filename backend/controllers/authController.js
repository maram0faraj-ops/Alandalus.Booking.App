// backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// ----------------------------------------------------
// تسجيل الدخول (Login)
// ----------------------------------------------------
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // التحقق من وجود المستخدم
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' });
        }

        // التحقق من كلمة المرور
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' });
        }

        // إنشاء التوكن
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || "secretToken",
            { expiresIn: '5d' },
            (err, token) => {
                if (err) throw err;
                res.json({ 
                    token, 
                    user: { 
                        id: user.id, 
                        username: user.username, 
                        email: user.email, 
                        role: user.role,
                        phone: user.phone 
                    } 
                });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// ----------------------------------------------------
// تسجيل حساب جديد (Register)
// ----------------------------------------------------
exports.register = async (req, res) => {
    const { username, email, password, phone } = req.body;

    try {
        // 1. التحقق مما إذا كان البريد مسجلاً مسبقاً
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'هذا البريد الإلكتروني مسجل مسبقاً.' });
        }

        // 2. إنشاء كائن المستخدم الجديد
        user = new User({
            username,
            email,
            password,
            phone, // نحفظ رقم الهاتف لإشعارات الواتساب
            role: 'User' // الدور الافتراضي هو مستخدم عادي
        });

        // 3. تشفير كلمة المرور
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // 4. حفظ المستخدم في قاعدة البيانات
        await user.save();

        // 5. إنشاء توكن (لتسجيل الدخول مباشرة بعد التسجيل)
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || "secretToken",
            { expiresIn: '5d' },
            (err, token) => {
                if (err) throw err;
                res.status(201).json({ 
                    token, 
                    message: "تم إنشاء الحساب بنجاح",
                    user: { 
                        id: user.id, 
                        username: user.username, 
                        email: user.email, 
                        role: user.role 
                    } 
                });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error in Register');
    }
};