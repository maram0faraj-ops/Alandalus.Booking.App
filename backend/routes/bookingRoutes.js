// backend/routes/bookingRoutes.js

const express = require('express');
const router = express.Router();

// استيراد middleware المصادقة
const auth = require('../middleware/auth'); 

// استيراد المتحكم
const bookingController = require('../controllers/bookingController'); 

// ==================================================================
// 🛠️ فحص التشخيص (Debugging Check)
// سيظهر هذا التنبيه في الـ Console عند تشغيل السيرفر إذا كانت الدالة ناقصة
// ==================================================================
if (!bookingController.getAllBookings) {
    console.error("❌ خطأ فادح: الدالة 'getAllBookings' غير موجودة في bookingController!");
    console.error("➡️  تأكد من أنك قمت بحفظ ملف bookingController.js وأنك قمت بتصدير الدالة في آخره.");
} else {
    console.log("✅ تم تحميل دالة 'getAllBookings' بنجاح في ملف المسارات.");
}
// ==================================================================


// ----------------------------------------------------
// 1. جلب جميع الحجوزات (GET /api/bookings)
// هذا هو المسار المسؤول عن عرض التقويم
// ----------------------------------------------------
router.get(
    '/', 
    auth, 
    bookingController.getAllBookings 
);

// ----------------------------------------------------
// 2. إنشاء حجز جديد (POST /api/bookings)
// ----------------------------------------------------
router.post(
    '/', 
    auth, 
    bookingController.createBooking
);

// ----------------------------------------------------
// 3. جلب حجوزات المستخدم الحالي (GET /api/bookings/my-bookings)
// ----------------------------------------------------
router.get(
    '/my-bookings', 
    auth, 
    bookingController.getMyBookings
);

// ----------------------------------------------------
// 4. إلغاء حجز محدد (DELETE /api/bookings/:id)
// ----------------------------------------------------
router.delete(
    '/:id', 
    auth, 
    bookingController.cancelBooking
);


module.exports = router;