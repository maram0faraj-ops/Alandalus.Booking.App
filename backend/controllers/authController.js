// backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// ----------------------------------------------------
// 1. تسجيل حساب جديد (Register)
// ----------------------------------------------------
exports.register = async (req, res) => {
    // استلام البيانات مع دعم كلا التسميتين (name و username) لحل مشكلة الحقول المطلوبة
    const { username, name, email, password, phone } = req.body;
    
    // اختيار الاسم المتوفر لضمان عدم بقاء الحقل فارغاً
    const finalUsername = username || name; 

    try {
        // التحقق من وجود البيانات الأساسية لمنع خطأ 400
        if (!finalUsername || !email || !password) {
            return res.status(400).json({ 
                message: 'يرجى إكمال جميع الحقول المطلوبة (الاسم، البريد، كلمة المرور).' 
            });
        }

        // 1. التأكد من أن البريد غير مسجل مسبقاً
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'هذا البريد الإلكتروني مسجل مسبقاً في النظام.' });
        }

        // 2. إنشاء كائن المستخدم الجديد
        user = new User({
            username: finalUsername,
            email,
            password,
            phone,
            role: 'User' 
        });

        // 3. تشفير كلمة المرور لضمان الأمان
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // 4. حفظ المستخدم في MongoDB Atlas
        await user.save();

        // 5. إنشاء توكن (Token) للدخول الفوري
        const payload = {
            user: { id: user.id, role: user.role }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || "AlandalusSecret2026",
            { expiresIn: '7d' },
            (err, token) => {
                if (err) throw err;
                res.status(201).json({ 
                    token, 
                    message: "تم إنشاء حسابك بنجاح في نظام مدارس الأندلس",
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
        res.status(500).json({ message: 'فشل إنشاء الحساب، يرجى المحاولة لاحقاً.' });
    }
};

// ----------------------------------------------------
// 2. تسجيل الدخول (Login)
// ----------------------------------------------------
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' });
        }

        const payload = {
            user: { id: user.id, role: user.role }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || "AlandalusSecret2026",
            { expiresIn: '7d' },
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
        res.status(500).send('Server Error');
    }
};