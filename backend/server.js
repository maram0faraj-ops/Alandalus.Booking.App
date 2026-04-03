// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// 1. الربط بقاعدة البيانات (المحدثة في أمريكا)
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
    console.error('❌ خطأ: لم يتم ضبط MONGO_URI في إعدادات Render.');
    process.exit(1);
}

mongoose.connect(mongoURI)
    .then(() => console.log('✅ Connected to MongoDB Atlas - Alandalus System'))
    .catch(err => console.error('❌ Database Connection Error:', err.message));

// 2. تصحيح استدعاء المسارات (مطابقة لأسماء ملفاتك الحالية)
const authRoutes = require('./routes/authRoutes');     // كان الخطأ هنا
const bookingRoutes = require('./routes/bookingRoutes'); // مطابقة لاسم الملف المرفق
const reportRoutes = require('./routes/reportRoutes');   // إضافة مسار التقارير

app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reports', reportRoutes);

// 3. تأكيد تشغيل الدوال الأساسية
console.log('✅ تم تحميل جميع المسارات (Auth, Bookings, Reports) بنجاح');

// 4. خدمة الملفات الثابتة (Frontend)
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/build')));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../frontend', 'build', 'index.html'));
    });
}

// 5. تشغيل السيرفر
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚀 السيرفر يعمل الآن بنجاح على المنفذ: ${PORT}`);
});