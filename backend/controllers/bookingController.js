// backend/controllers/bookingController.js

const Booking = require('../models/Booking');
const User = require('../models/User'); 
const sendBookingConfirmation = require('../utils/emailService'); 

// ----------------------------------------------------
// 1. إنشاء حجز جديد (POST /api/bookings)
// ----------------------------------------------------
exports.createBooking = async (req, res) => {
    const { 
        facility, bookingType, date, duration, activityName, 
        section, stage, 
        chairsNeeded, tablesNeeded, 
    } = req.body;
    
    const bookedBy = req.user.id; 

    // التحقق الأساسي
    if (!facility || !date || !duration || !bookingType || !section || !stage || !activityName) {
        return res.status(400).json({ message: 'الرجاء توفير جميع الحقول المطلوبة للحجز.' });
    }

    try {
        // تحويل المدة إلى رقم لضمان دقة الحسابات
        const durationNum = parseFloat(duration); 
        
        // حساب وقت بداية ونهاية الحجز الجديد بالميلي ثانية
        const newStart = new Date(date).getTime();
        const newEnd = newStart + (durationNum * 60 * 60 * 1000);

        // ----------------------------------------------------
        // منطق التحقق من التداخل (تم تحسينه)
        // ----------------------------------------------------
        
        // 1. جلب جميع الحجوزات الخاصة بنفس القاعة فقط
        const existingBookings = await Booking.find({ facility: facility });

        // 2. فحص التداخل يدوياً بدقة عالية
        const hasConflict = existingBookings.some(booking => {
            // تجاهل الحجز إذا كان ملغياً (اختياري حسب تصميمك)
            // if (booking.status === 'cancelled') return false;

            const existingStart = new Date(booking.date).getTime();
            const existingDuration = parseFloat(booking.duration);
            const existingEnd = existingStart + (existingDuration * 60 * 60 * 1000);

            // معادلة كشف التداخل: (بداية أ < نهاية ب) و (نهاية أ > بداية ب)
            return (existingStart < newEnd && existingEnd > newStart);
        });

        if (hasConflict) {
            return res.status(409).json({ 
                message: `عذراً، يوجد حجز آخر في هذا الوقت في قاعة ${facility}. يرجى اختيار وقت آخر.` 
            });
        }
        
        // ********* إنشاء الحجز *********
        const newBooking = new Booking({
            facility,
            bookingType,
            date, // سيتم حفظ التاريخ والوقت معاً
            duration: durationNum,
            activityName,
            section, 
            stage,   
            chairsNeeded, 
            tablesNeeded, 
            bookedBy,
        });

        const booking = await newBooking.save();
        
        // إرسال البريد
        try {
            const user = await User.findById(bookedBy);
            if (user && user.email) {
                sendBookingConfirmation(user.email, booking, user.username);
            }
        } catch (emailError) {
            console.error('FAILED TO SEND EMAIL:', emailError);
        }

        res.status(201).json({ 
            message: 'تم الحجز بنجاح.',
            booking
        });

    } catch (err) {
        console.error('SERVER ERROR:', err);
        res.status(500).send('حدث خطأ أثناء إنشاء الحجز.');
    }
};

// ----------------------------------------------------
// 2. جلب حجوزات المستخدم الحالي
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

// التصدير
module.exports = {
    createBooking: exports.createBooking,
    getMyBookings: exports.getMyBookings,
    cancelBooking: exports.cancelBooking,
    getAllBookings: exports.getAllBookings,
};