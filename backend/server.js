// backend/server.js
require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const reportRoutes = require('./routes/reportRoutes'); 
const app = express();

app.use(express.json()); 

// إعداد CORS للسماح بالاتصال من Vercel و Render
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || origin.startsWith('http://localhost') || origin.endsWith('.vercel.app') || origin.endsWith('.onrender.com')) {
            return callback(null, true);
        }
        return callback(new Error('CORS policy restriction'), false);
    },
    credentials: true 
}));

// --- تحديث هام لربط المنافذ في Render ---
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGO_URI || "mongodb+srv://maram0faraj:NewPass2050@cluster0.xpf2rmx.mongodb.net/?appName=Cluster0";

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        // يجب الاستماع لـ 0.0.0.0 ليتمكن Render من توجيه الترافيك
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server running on port: ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ DB Connection Error:', err.message);
        process.exit(1); 
    });

app.use('/api/auth', authRoutes); 
app.use('/api/bookings', bookingRoutes);
app.use('/api/reports', reportRoutes);