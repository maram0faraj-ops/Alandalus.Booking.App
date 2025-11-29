// backend/routes/reportRoutes.js

const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

const auth = require('../middleware/auth'); // لفك تشفير الرمز والحصول على req.user
// لا نحتاج لاستيراد admin هنا، لأننا نتحقق من الدور يدوياً (للتوافق مع ملفك الحالي)

// ----------------------------------------------------
// (A) المسار المخصص للواجهة الأمامية لعرض الجدول كاملاً: GET /api/reports/all-bookings
// ----------------------------------------------------
router.get(
    '/all-bookings', 
    auth, 
    async (req, res) => {
        // التحقق اليدوي من الدور (يضمن أن المستخدم مسؤول)
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'ليس لديك صلاحية الوصول، مطلوب دور المسؤول.' });
        }
        
        try {
            // جلب جميع الحجوزات مع معلومات المستخدم الذي حجزها
            const bookings = await Booking.find()
                .populate('bookedBy', 'username role') 
                .sort({ date: 1 }); 

            res.json(bookings);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('فشل خادم داخلي عند جلب تقارير جميع الحجوزات.');
        }
    }
);

// ----------------------------------------------------
// (B) تقرير أكثر القاعات حجزاً: GET /api/reports/facility
// ----------------------------------------------------
router.get('/facility', auth, async (req, res) => {
    if (req.user.role !== 'Admin') {
        return res.status(403).json({ message: 'ليس لديك صلاحية الوصول، مطلوب دور المسؤول.' });
    }
    
    try {
        const report = await Booking.aggregate([
            { $group: { _id: '$facility', totalBookings: { $sum: 1 } } },
            { $sort: { totalBookings: -1 } }
        ]);
        res.json(report);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('خطأ في الخادم أثناء جلب تقارير القاعات.');
    }
});

// ----------------------------------------------------
// (C) تقرير أكثر المستخدمين حجزاً: GET /api/reports/users
// ----------------------------------------------------
router.get('/users', auth, async (req, res) => {
    if (req.user.role !== 'Admin') {
        return res.status(403).json({ message: 'ليس لديك صلاحية الوصول، مطلوب دور المسؤول.' });
    }
    
    try {
        const report = await Booking.aggregate([
            { $group: { _id: '$bookedBy', totalBookings: { $sum: 1 } } },
            { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'userInfo' } },
            { $unwind: '$userInfo' },
            { $project: { _id: 0, username: '$userInfo.username', email: '$userInfo.email', totalBookings: 1 } },
            { $sort: { totalBookings: -1 } }
        ]);
        res.json(report);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('خطأ في الخادم أثناء جلب تقارير المستخدمين.');
    }
});

// ----------------------------------------------------
// (D) تقرير أكثر الأيام طلباً للحجز: GET /api/reports/days
// ----------------------------------------------------
router.get('/days', auth, async (req, res) => {
    if (req.user.role !== 'Admin') {
        return res.status(403).json({ message: 'ليس لديك صلاحية الوصول، مطلوب دور المسؤول.' });
    }
    
    try {
        const report = await Booking.aggregate([
            { $group: { _id: { $dayOfWeek: '$date' }, totalBookings: { $sum: 1 } } },
            { $project: {
                _id: 0,
                dayOfWeekNum: '$_id',
                dayOfWeekName: {
                    $switch: {
                        branches: [
                            { case: { $eq: ['$_id', 1] }, then: 'الأحد' },
                            { case: { $eq: ['$_id', 2] }, then: 'الإثنين' },
                            { case: { $eq: ['$_id', 3] }, then: 'الثلاثاء' },
                            { case: { $eq: ['$_id', 4] }, then: 'الأربعاء' },
                            { case: { $eq: ['$_id', 5] }, then: 'الخميس' },
                            { case: { $eq: ['$_id', 6] }, then: 'الجمعة' },
                            { case: { $eq: ['$_id', 7] }, then: 'السبت' },
                        ],
                        default: 'غير محدد'
                    }
                },
                totalBookings: 1
            }},
            { $sort: { totalBookings: -1 } }
        ]);
        res.json(report);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('خطأ في الخادم أثناء جلب تقارير الأيام.');
    }
});

module.exports = router;