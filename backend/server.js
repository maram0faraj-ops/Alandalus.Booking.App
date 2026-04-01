// backend/server.js
require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// --- حل مشكلة Render الأهم: الاستماع للمنفذ أولاً ---
const PORT = process.env.PORT || 10000;
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server listening on port ${PORT}`);
});

// الرابط من متغيرات البيئة
const MONGODB_URI = process.env.MONGO_URI || "mongodb+srv://maram0faraj:NewPass2050@cluster0.xpf2rmx.mongodb.net/AlandalusDB?retryWrites=true&w=majority";

mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch((err) => {
        console.error('❌ DB Connection Error:', err.message);
        // لا نغلق السيرفر هنا لنسمح لـ Render باكتشاف المنفذ المفتوح
    });

app.use('/api/auth', require('./routes/authRoutes')); 
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

app.get('/', (req, res) => res.json({ status: "Online" }));