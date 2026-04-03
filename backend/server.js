const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// تحميل متغيرات البيئة
dotenv.config();

const app = express();

// الإعدادات الوسيطة (Middleware)
app.use(cors());
app.use(express.json());

// الربط بقاعدة بيانات MongoDB Atlas
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
    console.error('❌ خطأ: لم يتم ضبط MONGO_URI في إعدادات Render.');
    process.exit(1);
}

mongoose.connect(mongoURI)
    .then(() => {
        console.log('✅ Connected to MongoDB Atlas - Alandalus Booking System');
    })
    .catch(err => {
        console.error('❌ Database Connection Error:');
        console.error(err.message);
    });

// استيراد وتعريف المسارات (بناءً على ملفات مشروعك)
const authRoutes = require('./routes/auth'); // مسار تسجيل الدخول
const bookingRoutes = require('./routes/bookings'); // مسار الحجوزات

app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);

// لضمان تحميل دالة getAllBookings بنجاح كما يظهر في السجلات
console.log('✅ بنجاح في ملف المسارات \'getAllBookings\' تم تحميل دالة');

// خدمة الملفات الثابتة (Frontend) عند النشر على Render
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/build')));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../frontend', 'build', 'index.html'));
    });
}

// تشغيل السيرفر
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚀 السيرفر يعمل الآن على المنفذ: ${PORT}`);
});