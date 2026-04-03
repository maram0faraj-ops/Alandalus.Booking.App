const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// تحميل متغيرات البيئة من ملف .env (للتطوير المحلي) أو من Render (عند النشر)
dotenv.config();

const app = express();

// الإعدادات الوسيطة (Middleware)
app.use(cors());
app.use(express.json());

// الربط بقاعدة بيانات MongoDB Atlas باستخدام المتغير MONGO_URI
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
    console.error('❌ خطأ: لم يتم العثور على متغير MONGO_URI في إعدادات البيئة (Environment Variables).');
    process.exit(1);
}

mongoose.connect(mongoURI)
    .then(() => console.log('✅ تم الاتصال بنجاح بقاعدة بيانات MongoDB Atlas - مدارس الأندلس'))
    .catch(err => {
        console.error('❌ فشل الاتصال بقاعدة البيانات:');
        console.error('السبب المحتمل: خطأ في اسم المستخدم أو كلمة المرور أو إعدادات Network Access.');
        console.error(err.message);
    });

// تعريف المسارات (Routes)
// ملاحظة: تأكدي من استيراد ملفات المسارات الخاصة بمشروعك هنا
// مثال: app.use('/api/bookings', require('./routes/bookingRoutes'));

// تشغيل السيرفر على المنفذ المحدد من Render أو 5000 محلياً
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 السيرفر يعمل الآن بنجاح على المنفذ: ${PORT}`);
    console.log('جاهز لاستقبال طلبات حجز القاعات...');
});

// التعامل مع الأخطاء غير المتوقعة لمنع انهيار السيرفر
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});