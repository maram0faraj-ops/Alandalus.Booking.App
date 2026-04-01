// backend/server.js
require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const reportRoutes = require('./routes/reportRoutes'); 
const app = express();

// ----------------------------------------------------
// Middleware
// ----------------------------------------------------
app.use(express.json()); 

// ✅ إعداد CORS مرن (يسمح بالروابط الديناميكية)
app.use(cors({
    origin: function (origin, callback) {
        // السماح للطلبات التي ليس لها مصدر (مثل تطبيقات الجوال أو Postman)
        if (!origin) return callback(null, true);
        
        // السماح بالعمل على الجهاز المحلي
        if (origin.startsWith('http://localhost')) {
            return callback(null, true);
        }

        // السماح بأي رابط ينتهي بـ vercel.app (لضمان عمل جميع الروابط التجريبية والرئيسية)
        if (origin.endsWith('.vercel.app')) {
            return callback(null, true);
        }

        // إذا لم يتحقق أي شرط، نرفض الطلب
        const msg = 'سياسة CORS لا تسمح لهذا الموقع بالاتصال بالسيرفر.';
        return callback(new Error(msg), false);
    },
    credentials: true 
}));

// ----------------------------------------------------
// الاتصال بقاعدة البيانات
// ----------------------------------------------------
const PORT = process.env.PORT || 5000;
const MONGODB_URI = "mongodb+srv://maram0faraj:NewPass2050@cluster0.xpf2rmx.mongodb.net/?appName=Cluster0";

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ تم الاتصال بنجاح بـ MongoDB');
        app.listen(PORT, () => {
            console.log(`🚀 الخادم يعمل على المنفذ: ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ فشل الاتصال بقاعدة البيانات:', err.message);
        process.exit(1); 
    });

// ----------------------------------------------------
// المسارات (Routes)
// ----------------------------------------------------

app.get('/', (req, res) => {
    res.json({ message: 'Andalus Booking API is running successfully!' });
});

app.use('/api/auth', authRoutes); 
app.use('/api/bookings', bookingRoutes);
app.use('/api/reports', reportRoutes);