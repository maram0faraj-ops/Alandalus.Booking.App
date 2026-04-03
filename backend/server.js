// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();
const app = express();

// تفعيل CORS لضمان قبول الطلبات من Vercel
app.use(cors()); 
app.use(express.json());

// 1. الاتصال بقاعدة البيانات
const mongoURI = process.env.MONGO_URI;
if (mongoURI) {
    mongoose.connect(mongoURI)
        .then(() => console.log('✅ Connected to MongoDB Atlas - Alandalus System'))
        .catch(err => console.error('❌ Database Connection Error:', err.message));
}

// 2. تعريف المسارات (مطابقة لملفاتك)
const authRoutes = require('./routes/authRoutes'); 
const bookingRoutes = require('./routes/bookingRoutes');
const reportRoutes = require('./routes/reportRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reports', reportRoutes);

// 3. خدمة الملفات الثابتة - نسخة مبسطة لتجنب خطأ Status 1
if (process.env.NODE_ENV === 'production') {
    const frontendPath = path.join(__dirname, '../frontend/build');
    app.use(express.static(frontendPath));
    
    app.get('*', (req, res) => {
        res.sendFile(path.join(frontendPath, 'index.html'));
    });
}

// 4. تشغيل السيرفر
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is running on port: ${PORT}`);
});