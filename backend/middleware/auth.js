// backend/middleware/auth.js

const jwt = require('jsonwebtoken');

function auth(req, res, next) {
    const token = req.header('x-auth-token'); 
    if (!token) {
        return res.status(401).json({ message: 'لا يوجد رمز، تم رفض الوصول.' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ message: 'الرمز غير صالح.' });
    }
};

// 🛑 إزالة دالة admin بالكامل من هذا الملف (لتجنب التعارض)
// 🛑 التصدير الافتراضي: تصدير الدالة auth مباشرة
module.exports = auth;