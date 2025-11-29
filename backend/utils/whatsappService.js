// backend/utils/whatsappService.js
const twilio = require('twilio');

const sendWhatsappNotification = async (userPhone, bookingDetails, userName) => {
    // التحقق من وجود إعدادات Twilio في ملف .env
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromPhone = process.env.TWILIO_PHONE_NUMBER; // رقم واتساب Twilio (عادة يبدأ بـ whatsapp:+1415...)

    if (!accountSid || !authToken || !fromPhone) {
        console.warn('⚠️ WhatsApp service skipped: Missing Twilio credentials in .env');
        return;
    }

    const client = new twilio(accountSid, authToken);

    try {
        const message = `
مرحباً ${userName} 👋
تم استلام طلب حجزك بنجاح!
📌 *التفاصيل:*
- القاعة: ${bookingDetails.facility}
- التاريخ: ${new Date(bookingDetails.date).toLocaleDateString('ar-EG')}
- النشاط: ${bookingDetails.activityName}

سنقوم بمراجعة الطلب والرد عليك قريباً.
تحياتنا، مدارس الأندلس
        `;

        await client.messages.create({
            body: message,
            from: `whatsapp:${fromPhone}`, // مثال: 'whatsapp:+14155238886'
            to: `whatsapp:${userPhone}`     // يجب أن يكون الرقم بصيغة دولية مثال: '+966500000000'
        });

        console.log(`📱 WhatsApp message sent successfully to ${userPhone}`);
    } catch (error) {
        console.error('❌ WhatsApp sending failed:', error.message);
    }
};

module.exports = sendWhatsappNotification;