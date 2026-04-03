// backend/controllers/bookingController.js
const Booking = require('../models/Booking');

// ----------------------------------------------------
// 1. إنشاء حجز جديد (POST /api/bookings)
// ----------------------------------------------------
exports.createBooking = async (req, res) => {
    try {
        const { 
            facility, section, stage, activityName, date, duration, 
            contactPhone, contactEmail, bookingType 
        } = req.body;

        // التحقق من البيانات الأساسية
        if (!facility || !date || !activityName || !contactPhone) {
            return res.status(400).json({ 
                message: 'يرجى إكمال البيانات الأساسية (القاعة، التاريخ، الفعالية، والجوال).' 
            });
        }

        // إنشاء الحجز وربطه بصاحب الحساب المسجل
        const newBooking = new Booking({
            facility,
            section: section || 'بنات',
            stage: stage || 'الابتدائي',
            activityName,
            date,
            duration: duration || 1,
            bookingType: bookingType || 'داخلي',
            contactPhone,
            contactEmail,
            bookedBy: req.user.id
        });

        const savedBooking = await newBooking.save();

        // ✅ تم تعطيل الإشعارات مؤقتاً لكسر حلقة خطأ 500
        console.log('✅ تم حفظ الحجز بنجاح في قاعدة البيانات.');

        res.status(201).json({ 
            message: 'تم إرسال طلب الحجز بنجاح!',
            booking: savedBooking 
        });

    } catch (err) {
        console.error('❌ Server Error:', err.message);
        res.status(500).json({ message: 'فشل السيرفر في معالجة الطلب، تأكد من اتصال قاعدة البيانات.' });
    }
};

// ----------------------------------------------------
// 2. جلب حجوزاتي الشخصية
// ----------------------------------------------------
exports.getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ bookedBy: req.user.id }).sort({ date: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// ----------------------------------------------------
// 3. جلب جميع الحجوزات (للمسؤول)
// ----------------------------------------------------
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find().populate('bookedBy', 'username email').sort({ date: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// ----------------------------------------------------
// 4. إلغاء حجز
// ----------------------------------------------------
exports.cancelBooking = async (req, res) => {
    try {
        await Booking.findByIdAndDelete(req.params.id);
        res.json({ message: 'تم إلغاء الحجز بنجاح.' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};