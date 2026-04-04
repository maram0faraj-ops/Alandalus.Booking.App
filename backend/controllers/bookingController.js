const Booking = require('../models/Booking');
const User = require('../models/User');

// ----------------------------------------------------
// 1. إنشاء حجز جديد مع فحص التداخل (POST /api/bookings)
// ----------------------------------------------------
exports.createBooking = async (req, res) => {
    try {
        const { 
            facility, section, stage, activityName, date, duration, 
            contactPhone, contactEmail, bookingType 
        } = req.body;

        // التحقق من الحقول الأساسية
        if (!facility || !date || !activityName || !contactPhone) {
            return res.status(400).json({ message: 'يرجى إكمال البيانات الأساسية.' });
        }

        // --- نظام منع التداخل الزمني ---
        const newStart = new Date(date).getTime();
        const durationNum = parseFloat(duration) || 1;
        const newEnd = newStart + (durationNum * 60 * 60 * 1000);

        // جلب الحجوزات الحالية لنفس القاعة (فقط النشطة)
        const existingBookings = await Booking.find({ 
            facility: facility,
            status: { $in: ['pending', 'approved'] } 
        }).populate('bookedBy', 'username');

        // البحث عن أي تداخل مع الحجوزات الموجودة
        const conflict = existingBookings.find(booking => {
            const existingStart = new Date(booking.date).getTime();
            const existingEnd = existingStart + (parseFloat(booking.duration) * 60 * 60 * 1000);
            
            // إذا كان وقت البداية أو النهاية يتقاطع مع حجز آخر
            return (newStart < existingEnd && newEnd > existingStart);
        });

        if (conflict) {
            return res.status(409).json({ 
                message: `عذراً، القاعة محجوزة بالفعل في هذا التوقيت باسم (${conflict.bookedBy?.username || 'مستخدم آخر'}).` 
            });
        }
        // ---------------------------------------------------------

        // إنشاء الحجز الجديد في حال عدم وجود تداخل
        const newBooking = new Booking({
            facility,
            section: section || 'بنات',
            stage: stage || 'الابتدائي',
            activityName,
            date,
            duration: durationNum,
            bookingType: bookingType || 'داخلي',
            contactPhone,
            contactEmail,
            bookedBy: req.user.id
        });

        const savedBooking = await newBooking.save();

        res.status(201).json({ 
            message: 'تم إرسال طلب الحجز بنجاح!',
            booking: savedBooking 
        });

    } catch (err) {
        console.error('❌ Server Error:', err.message);
        res.status(500).json({ message: 'حدث خطأ في السيرفر أثناء معالجة الحجز.' });
    }
};

// ----------------------------------------------------
// 2. جلب الحجوزات الشخصية
// ----------------------------------------------------
exports.getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ bookedBy: req.user.id }).sort({ date: -1 });
        res.json(bookings);
    } catch (err) { res.status(500).send('Server Error'); }
};

// ----------------------------------------------------
// 3. جلب كافة الحجوزات للمسؤول
// ----------------------------------------------------
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find().populate('bookedBy', 'username email').sort({ date: -1 });
        res.json(bookings);
    } catch (err) { res.status(500).send('Server Error'); }
};

// ----------------------------------------------------
// 4. إلغاء الحجز
// ----------------------------------------------------
exports.cancelBooking = async (req, res) => {
    try {
        await Booking.findByIdAndDelete(req.params.id);
        res.json({ message: 'تم إلغاء الحجز بنجاح.' });
    } catch (err) { res.status(500).send('Server Error'); }
};