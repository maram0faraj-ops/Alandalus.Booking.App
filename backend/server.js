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
const PORT = process.env.PORT || 10000;
const MONGODB_URI = process.env.MONGO_URI || "mongodb+srv://maram0faraj:NewPass2050@cluster0.xpf2rmx.mongodb.net/AlandalusDB?retryWrites=true&w=majority";

// تشغيل السيرفر فوراً لضمان Port Binding
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server active on port: ${PORT}`);
});

mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => console.error('❌ DB Error:', err.message));