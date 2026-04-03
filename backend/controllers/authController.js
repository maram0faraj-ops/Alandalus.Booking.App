// backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// ----------------------------------------------------
// 1. تسجيل الدخول (Login)
// ----------------------------------------------------
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // التحقق من وجود المستخدم في قاعدة بيانات الأندلس
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' });
        }

        // التحقق من تطابق كلمة المرور المشفرة
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' });
        }

        // إنشاء التوكن (Token) مع تحديد الدور (Admin/User)
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        // استخدام السر البرمجي من إعدادات Render
        jwt.sign(
            payload,
            process.env.JWT_SECRET || "AlandalusSecret2026", 
            { expiresIn: '7d' }, // زيادة المدة لراحة المعلمين
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
        console.error('❌ Login Error:', err.message);
        res.status(500).send('حدث خطأ في الخادم أثناء تسجيل الدخول.');
    }
};

// ----------------------------------------------------
// 2. تسجيل حساب جديد (Register)
// ----------------------------------------------------
exports.register = async (req, res) => {
    const { username, email, password, phone } = req.body;

    try {
        // التحقق من البيانات المدخلة لمنع الأخطاء الداخلية
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'يرجى إكمال جميع الحقول المطلوبة.' });
        }

        // 1. التأكد من أن البريد غير مسجل مسبقاً
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'هذا البريد الإلكتروني مسجل مسبقاً في نظام الأندلس.' });
        }

        // 2. إنشاء كائن المستخدم الجديد
        user = new User({
            username,
            email,
            password,
            phone, 
            role: 'User' 
        });

        // 3. تشفير كلمة المرور (Salt & Hash) لضمان الأمان
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // 4. حفظ المستخدم في MongoDB Atlas
        await user.save();

        // 5. إنشاء توكن للدخول الفوري بعد التسجيل
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || "AlandalusSecret2026",
            { expiresIn: '7d' },
            (err, token) => {
                if (err) throw err;
                res.status(201).json({ 
                    token, 
                    message: "تم إنشاء حسابك في مدارس الأندلس بنجاح",
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
        console.error('❌ Register Error:', err.message);
        res.status(500).json({ message: 'فشل إنشاء الحساب، تأكد من إعدادات السيرفر وقاعدة البيانات.' });
    }
};