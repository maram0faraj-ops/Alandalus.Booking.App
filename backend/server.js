// backend/server.js
require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// ✅ 1. تفعيل هذا السطر (إزالة // من البداية)
const authRoutes = require('./routes/authRoutes');

const bookingRoutes = require('./routes/bookingRoutes');
const reportRoutes = require('./routes/reportRoutes'); 
const app = express();

app.use(express.json()); 

const allowedOrigins = ['http://localhost:3000', 'https://your-frontend-app.vercel.app']; 
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true); 
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'سياسة CORS لا تسمح بهذا الأصل.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    }
}));

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

app.get('/', (req, res) => {
    res.json({ message: 'Andalus Booking API is running successfully!' });
});

// ✅ 2. تفعيل هذا السطر أيضاً (إزالة // من البداية)
app.use('/api/auth', authRoutes); 

app.use('/api/bookings', bookingRoutes);
app.use('/api/reports', reportRoutes);