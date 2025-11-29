// backend/controllers/bookingController.js

const Booking = require('../models/Booking');
const User = require('../models/User'); 
const sendBookingConfirmation = require('../utils/emailService'); 
const sendWhatsappNotification = require('../utils/whatsappService');

// ----------------------------------------------------
// 1. إنشاء حجز جديد (POST /api/bookings)
// ----------------------------------------------------
exports.createBooking = async (req, res) => {
    try {
        const { 
            facility, bookingType, date, duration, activityName, 
            section, stage, 
            chairsNeeded, tablesNeeded, 
            externalEntityName,
            // ✅ استقبال الحقول الجديدة ضروري جداً
            contactPhone, contactEmail 
        } = req.body;
        
        const bookedBy = req.user.id; 

        // التحقق من الحقول المطلوبة (تمت إضافة التحقق من بيانات التواصل)
        if (!facility || !date || !duration || !bookingType || !section || !stage || !activityName || !contactPhone || !contactEmail) {
            return res.status(400).json({ message: 'الرجاء توفير جميع الحقول المطلوبة بما فيها بيانات التواصل.' });
        }

        const durationNum = parseFloat(duration); 
        const newStart = new Date(date).getTime();
        const newEnd = newStart + (durationNum * 60 * 60 * 1000);

        // --- التحقق من التداخل ---
        const existingBookings = await Booking.find({ facility: facility });
        const hasConflict = existingBookings.some(booking => {
            if (booking.status === 'cancelled' || booking.status === 'rejected') return false;
            const existingStart = new Date(booking.date).getTime();
            const existingDuration = parseFloat(booking.duration);
            const existingEnd = existingStart + (existingDuration * 60 * 60 * 1000);
            return (newStart < existingEnd && newEnd > existingStart);
        });

        if (hasConflict) {
            return res.status(409).json({ 
                message: `عذراً، يوجد حجز آخر في هذا الوقت في قاعة ${facility}.` 
            });
        }
        
        // --- إنشاء الحجز ---
        const newBooking = new Booking({
            facility,
            bookingType,
            date, 
            duration: durationNum,
            activityName,
            section, 
            stage,   
            externalEntityName,
            chairsNeeded, 
            tablesNeeded, 
            bookedBy,
            // ✅ تمرير البيانات للحفظ في قاعدة البيانات
            contactPhone, 
            contactEmail  
        });

        const booking = await newBooking.save();
        
        // --- إرسال الإشعارات ---
        /*(async () => {
            try {
                const user = await User.findById(bookedBy);
                const recipientName = user ? user.username : "المستخدم";

                if (contactEmail) await sendBookingConfirmation(contactEmail, booking, recipientName);
                if (contactPhone) await sendWhatsappNotification(contactPhone, booking, recipientName);
            } catch (notifyError) {
                console.error('⚠️ Notification Warning:', notifyError.message);
            }
        })(); */

        res.status(201).json({ 
            message: 'تم الحجز بنجاح.',
            booking
        });

    } catch (err) {
        console.error('❌ SERVER ERROR:', err);
        res.status(500).send(`حدث خطأ أثناء إنشاء الحجز: ${err.message}`);
    }
};

// ----------------------------------------------------
// 2. جلب حجوزات المستخدم
// ----------------------------------------------------
exports.getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ bookedBy: req.user.id })
            .populate('bookedBy', 'username email')
            .sort({ date: -1 }); 
        res.json(bookings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// ----------------------------------------------------
// 3. إلغاء الحجز
// ----------------------------------------------------
exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'الحجز غير موجود.' });

        if (booking.bookedBy.toString() !== req.user.id && req.user.role !== 'Admin') {
            return res.status(401).json({ message: 'غير مصرح لك بإلغاء هذا الحجز.' });
        }

        await Booking.findByIdAndDelete(req.params.id);
        res.json({ message: 'تم إلغاء الحجز بنجاح.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// ----------------------------------------------------
// 4. جلب جميع الحجوزات (للتقويم)
// ----------------------------------------------------
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('bookedBy', 'username email')
            .sort({ date: -1 });
        res.json(bookings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// ----------------------------------------------------
// 5. جلب إحصائيات التقارير (جديد)
// ----------------------------------------------------
exports.getBookingStats = async (req, res) => {
    try {
        const totalBookings = await Booking.countDocuments();
        const pendingBookings = await Booking.countDocuments({ status: 'pending' });
        const approvedBookings = await Booking.countDocuments({ status: 'approved' });
        const rejectedBookings = await Booking.countDocuments({ status: 'rejected' });
        
        const bookingsByFacility = await Booking.aggregate([
            { $group: { _id: "$facility", count: { $sum: 1 } } }
        ]);

        res.json({
            total: totalBookings,
            pending: pendingBookings,
            approved: approvedBookings,
            rejected: rejectedBookings,
            byFacility: bookingsByFacility
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error in Stats');
    }
};

module.exports = {
    createBooking: exports.createBooking,
    getMyBookings: exports.getMyBookings,
    cancelBooking: exports.cancelBooking,
    getAllBookings: exports.getAllBookings,
    getBookingStats: exports.getBookingStats
};