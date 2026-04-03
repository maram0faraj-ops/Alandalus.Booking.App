// backend/server.js
require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// استدعاء المسارات
app.use('/api/auth', require('./routes/authRoutes')); 
app.use('/api/bookings', require('./routes/bookingRoutes'));

// الربط والمنفذ لـ Render
// backend/server.js

// تغيير هذا السطر ليقرأ من إعدادات Render أولاً
const MONGODB_URI = process.env.MONGO_URI || "mongodb+srv://admin:Alandalus2026@cluster0.szhmu2u.mongodb.net/?appName=Cluster0";

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ تم الاتصال بنجاح بقاعدة البيانات الجديدة');
        app.listen(PORT, () => {
            console.log(`🚀 الخادم يعمل على المنفذ: ${PORT}`);
        });
    })

mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => console.error('❌ DB Error:', err.message));