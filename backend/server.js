const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

// ✅ تفعيل الـ CORS لقبول الطلبات من رابط Vercel الخاص بكِ
app.use(cors()); 
app.use(express.json());

// 1. الاتصال بقاعدة البيانات الجديدة
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => console.error('❌ Database Error:', err.message));

// 2. تعريف المسارات (تأكدي من مطابقة الأسماء لملفاتك)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));