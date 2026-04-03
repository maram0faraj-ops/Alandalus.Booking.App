// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // 1. الحصول على الرمز من الهيدر (x-auth-token)
    const token = req.header('x-auth-token');

    // 2. التحقق إذا لم يكن هناك رمز
    if (!token) {
        return res.status(401).json({ message: 'لا يوجد رمز، تم رفض الوصول.' });
    }

    // 3. التحقق من صحة الرمز باستخدام نفس السر الموحد
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "AlandalusSecret2026");
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ message: 'انتهت جلسة الدخول، يرجى تسجيل الدخول مرة أخرى.' });
    }
};