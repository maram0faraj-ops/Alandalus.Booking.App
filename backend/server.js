// backend/server.js
require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const reportRoutes = require('./routes/reportRoutes'); 

const app = express();

app.use(cors());
app.use(express.json());

// الرابط والمنفذ
const PORT = process.env.PORT || 10000; // Render غالباً ما يستخدم 10000
const MONGODB_URI = process.env.MONGO_URI || "mongodb+srv://maram0faraj:NewPass2050@cluster0.xpf2rmx.mongodb.net/AlandalusDB?retryWrites=true&w=majority";

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB Atlas Successfully');
        // تعديل جوهري: الاستماع لـ 0.0.0.0 ضروري لاكتشاف المنفذ في Render
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server is live and scanning on port: ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ Critical Error: DB Connection Failed.');
        console.error('Reason:', err.message); // لعرض تفاصيل الـ IP Whitelist
        process.exit(1); 
    });

app.use('/api/auth', authRoutes); 
app.use('/api/bookings', bookingRoutes);
app.use('/api/reports', reportRoutes);

app.get('/', (req, res) => res.json({ status: "API is Running" }));