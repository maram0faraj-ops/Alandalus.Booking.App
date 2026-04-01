// backend/server.js
require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// استيراد المسارات
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const reportRoutes = require('./routes/reportRoutes'); 

const app = express();

// إعدادات CORS للسماح بالاتصال من Vercel و Render
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || origin.startsWith('http://localhost') || origin.endsWith('.vercel.app') || origin.endsWith('.onrender.com')) {
            return callback(null, true);
        }
        return callback(new Error('CORS policy restriction'), false);
    },
    credentials: true 
}));

app.use(express.json()); 

// --- إعدادات المنفذ والرابط لـ Render و MongoDB ---
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGO_URI || "mongodb+srv://maram0faraj:NewPass2050@cluster0.xpf2rmx.mongodb.net/AlandalusDB?retryWrites=true&w=majority";

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB Atlas Successfully');
        // الاستماع لـ 0.0.0.0 ضروري لمنصة Render لاكتشاف المنفذ
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server is live on port: ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ Critical Error: DB Connection Failed.');
        console.error('Reason:', err.message); // لعرض سبب الفشل في سجلات Render
        process.exit(1); 
    });

// المسارات
app.use('/api/auth', authRoutes); 
app.use('/api/bookings', bookingRoutes);
app.use('/api/reports', reportRoutes);

app.get('/', (req, res) => res.json({ message: "API is working!" }));