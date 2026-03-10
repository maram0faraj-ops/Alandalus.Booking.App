// backend/controllers/bookingController.js

const Booking = require('../models/Booking');
const User = require('../models/User'); 
const { sendBookingConfirmation } = require('../utils/emailService'); // تم تحديث الاستدعاء ليتناسب مع export الجديد
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
            contactPhone, contactEmail 
        } = req.body;
        
        const bookedBy = req.user.id; 

        // 1. التحقق من الحقول المطلوبة
        if (!facility || !date || !duration || !bookingType || !section || !stage || !activityName || !contactPhone || !contactEmail) {
            return res.status(400).json({ message: 'الرجاء توفير جميع الحقول المطلوبة بما فيها بيانات التواصل.' });
        }

        // --- 2. التحقق من أن التاريخ ضمن نطاق شهرين (60 يوماً) [محدّث] ---
        const bookingDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0); 

        const maxAllowedDate = new Date();
        maxAllowedDate.setDate(today.getDate() + 60); // تمديد الفترة لشهرين

        if (bookingDate < today || bookingDate > maxAllowedDate) {
            return res.status(400).json({ 
                message: 'خطأ: فترة الحجز المسموحة هي خلال شهرين (60 يوماً) من اليوم فقط.' 
            });
        }

        const durationNum = parseFloat(duration); 
        const newStart = bookingDate.getTime();
        const newEnd = newStart + (durationNum * 60 * 60 * 1000);

        // --- 3. التحقق من التداخل وجلب تفاصيل الحاجز القديم [محدّث] ---
        const existingBookings = await Booking.find({ facility: facility }).populate('bookedBy', 'username');
        
        // البحث عن الحجز المتداخل
        const conflict = existingBookings.find(booking => {
            if (booking.status === 'cancelled' || booking.status === 'rejected') return false;
            const existingStart = new Date(booking.date).getTime();
            const existingDuration = parseFloat(booking.duration);
            const existingEnd = existingStart + (existingDuration * 60 * 60 * 1000);
            return (newStart < existingEnd && newEnd > existingStart);
        });

        if (conflict) {
            // إرجاع تفاصيل الحجز المتداخل ليتم عرضها في الواجهة الأمامية
            return res.status(409).json({ 
                message: `عذراً، يوجد حجز آخر في هذا الوقت في قاعة ${facility}.`,
                details: {
                    reserverName: conflict.bookedBy ? conflict.bookedBy.username : "غير معروف",
                    date: new Date(conflict.date).toLocaleDateString('ar-EG'),
                    duration: conflict.duration,
                    activity: conflict.activityName
                }
            });
        }
        
        // --- 4. إنشاء الحجز ---
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
            contactPhone, 
            contactEmail  
        });

        const booking = await newBooking.save();
        
        // --- 5. إرسال الإشعارات (تفعيل خاصية الرد المباشر) [محدّث] ---
        (async () => {
            try {
                const user = await User.findById(bookedBy);
                const recipientName = user ? user.username : "المستخدم";

                // إرسال البريد مع تمرير contactEmail كمرجع للرد (Reply-To)
                if (contactEmail) {
                    await sendBookingConfirmation({
                        booking,
                        reserverEmail: contactEmail, 
                        reserverName: recipientName
                    });
                }
                
                if (contactPhone) await sendWhatsappNotification(contactPhone, booking, recipientName);
            } catch (notifyError) {
                console.error('⚠️ Notification Warning:', notifyError.message);
            }
        })();

        res.status(201).json({ 
            message: 'تم الحجز بنجاح لفترة الشهرين القادمة.',
            booking
        });

    } catch (err) {
        console.error('❌ SERVER ERROR:', err);
        res.status(500).send(`حدث خطأ أثناء إنشاء الحجز: ${err.message}`);
    }
};

// ----------------------------------------------------
// (باقي الدوال تبقى كما هي)
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