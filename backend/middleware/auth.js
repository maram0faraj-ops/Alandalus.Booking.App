// backend/middleware/auth.js

const jwt = require('jsonwebtoken');

function auth(req, res, next) {
    // 1. جلب الرمز من الترويسة
    const token = req.header('x-auth-token'); 

    // 2. التحقق من وجود الرمز
    if (!token) {
        return res.status(401).json({ message: 'لا يوجد رمز، تم رفض الوصول.' });
    }

    try {
        // 3. التحقق من صحة الرمز
        // 🛠️ التعديل هنا: إضافة || "secretToken" لتطابق ملف authController
        // هذا يضمن العمل حتى لو لم يتم ضبط المتغير في Render
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretToken");
        
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ message: 'الرمز غير صالح أو منتهي الصلاحية.' });
    }
};

module.exports = auth;