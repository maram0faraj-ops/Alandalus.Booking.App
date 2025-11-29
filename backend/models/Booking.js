const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    facility: {
        type: String,
        required: true,
        enum: ['المسرح', 'مصادر التعلم', 'قاعة بلنسية', 'الصالة الرياضية بنات', 'الصالة الرياضية بنين']
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
        required: true,
        enum: ['بنين', 'بنات']
    },
    stage: {
        type: String,
        required: true,
        // ✅ قائمة موسعة لتقبل جميع الصيغ المحتملة وتمنع أخطاء التحقق
        enum: [
            'رياض الأطفال', 'رياض أطفال', 
            'طفولة مبكرة', 
            'ابتدائي', 'المرحلة الابتدائية',
            'متوسط', 'المرحلة المتوسطة',
            'ثانوي', 'المرحلة الثانوية',
            'إشراف تعليمي', 
            'إدارة عامة'
        ]
    },
    // ✅ حقول التواصل الجديدة (إجبارية)
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
        required: true,
        enum: ['داخلي', 'خارجي']
    },
    externalEntityName: {
        type: String,
        // مطلوب فقط إذا كان النوع خارجي
        required: function() { return this.bookingType === 'خارجي'; }
    },
    chairsNeeded: {
        type: Number,
        default: 0
    },
    tablesNeeded: {
        type: Number,
        default: 0
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
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Booking', bookingSchema);