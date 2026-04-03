// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();
const app = express();

// تفعيل CORS للسماح بالطلبات الخارجية من Vercel إلى Render
app.use(cors()); 
app.use(express.json());

// 1. الاتصال بقاعدة البيانات (المحدثة في منطقة أمريكا)
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
    console.error('❌ خطأ: لم يتم ضبط متغير MONGO_URI في إعدادات Render.');
    process.exit(1);
}

mongoose.connect(mongoURI)
    .then(() => console.log('✅ Connected to MongoDB Atlas - Alandalus System'))
    .catch(err => console.error('❌ Database Connection Error:', err.message));

// 2. تعريف المسارات (مطابقة تماماً لأسماء ملفاتك المرفقة)
const authRoutes = require('./routes/authRoutes'); 
const bookingRoutes = require('./routes/bookingRoutes');
const reportRoutes = require('./routes/reportRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reports', reportRoutes);

// 3. خدمة الملفات الثابتة (في حال وجود Frontend داخل نفس المشروع)
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/build')));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../frontend', 'build', 'index.html'));
    });
}

// 4. تشغيل السيرفر على المنفذ المحدد من Render
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is running on port: ${PORT}`);
});