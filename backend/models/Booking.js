// backend/models/Booking.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    facility: {
        type: String,
        required: true,
        // تأكدي من مطابقة هذه الأسماء لما في القائمة المنسدلة في الواجهة
    },
    date: {
        type: Date,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    activityName: {
        type: String,
        required: true
    },
    section: {
        type: String,
        required: true // يقبل "بنين" أو "بنات"
    },
    stage: {
        type: String,
        required: true // يقبل أي نص للمرحلة لمنع أخطاء الـ Validation
    },
    contactPhone: {
        type: String,
        required: true 
    },
    contactEmail: {
        type: String,
        required: true 
    },
    bookingType: {
        type: String,
        default: 'داخلي' // جعلناه اختيارياً لتسهيل الحفظ
    },
    bookedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'cancelled'],
        default: 'pending'
    }
}, { timestamps: true }); // يضيف تاريخ الإنشاء والتحديث تلقائياً

module.exports = mongoose.model('Booking', bookingSchema);