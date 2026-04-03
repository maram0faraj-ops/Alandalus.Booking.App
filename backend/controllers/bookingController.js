// backend/controllers/bookingController.js
const Booking = require('../models/Booking');
const User = require('../models/User');

exports.createBooking = async (req, res) => {
    try {
        const { 
            facility, section, stage, activityName, date, duration, 
            contactPhone, contactEmail, bookingType 
        } = req.body;

        // 1. التحقق من البيانات الأساسية لضمان عدم الانهيار
        if (!facility || !date || !activityName || !contactPhone) {
            return res.status(400).json({ message: 'يرجى إكمال البيانات الأساسية (القاعة، التاريخ، الفعالية، والجوال).' });
        }

        // 2. إنشاء الحجز في قاعدة البيانات فوراً
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

        // 3. منطقة الإشعارات (محمية بـ try-catch مستقلة لمنع خطأ 500)
        try {
            // هنا يمكنكِ لاحقاً تفعيل خدمات الإيميل والواتساب
            console.log('✅ تم حفظ الحجز بنجاح، جاري معالجة الإشعارات صامتاً...');
        } catch (notifyErr) {
            console.error('⚠️ فشل إرسال الإشعارات ولكن الحجز تم حفظه:', notifyErr.message);
        }

        // 4. الرد بالنجاح للمتصفح
        res.status(201).json({ 
            message: 'تم إرسال طلب الحجز بنجاح!',
            booking: savedBooking 
        });

    } catch (err) {
        console.error('❌ خطأ داخلي في السيرفر:', err.message);
        res.status(500).json({ message: 'حدث خطأ داخلي في السيرفر، يرجى مراجعة سجلات Render.' });
    }
};

// بقية الدوال (getMyBookings, getAllBookings, cancelBooking) تظل كما هي لديكِ
exports.getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ bookedBy: req.user.id }).sort({ date: -1 });
        res.json(bookings);
    } catch (err) { res.status(500).send('Server Error'); }
};

exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find().populate('bookedBy', 'username email').sort({ date: -1 });
        res.json(bookings);
    } catch (err) { res.status(500).send('Server Error'); }
};

exports.cancelBooking = async (req, res) => {
    try {
        await Booking.findByIdAndDelete(req.params.id);
        res.json({ message: 'تم إلغاء الحجز بنجاح.' });
    } catch (err) { res.status(500).send('Server Error'); }
};