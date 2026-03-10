// backend/utils/emailService.js

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail', // يمكن استخدام أي خدمة SMTP أخرى
    auth: {
        user: process.env.EMAIL_USER, // بريد التطبيق من .env
        pass: process.env.EMAIL_PASS  // كلمة مرور التطبيق أو App Password من .env
    }
});

/**
 * دالة لإرسال تأكيد الحجز عبر البريد الإلكتروني
 * @param {string} recipientEmail - بريد المستخدم
 * @param {object} booking - بيانات الحجز
 * @param {string} username - اسم المستخدم
 */
const sendBookingConfirmation = async (recipientEmail, booking, username) => {
    
    // تنسيق التاريخ والوقت
    const bookingDate = new Date(booking.date).toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const bookingTime = booking.duration; 

    // بناء نص الرسالة
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: recipientEmail,
        subject: `✅ تأكيد حجز قاعة: ${booking.facility} - مدارس الأندلس`,
        html: `
            <div style="direction: rtl; text-align: right; font-family: Tahoma, Geneva, sans-serif; border: 1px solid #ccc; padding: 20px;">
                <h2 style="color: #007bff;">تأكيد نجاح حجز مرفق</h2>
                <p>عزيزي/عزيزتي **${username}**،</p>
                <p>يسرنا تأكيد حجزك في مدارس الأندلس الأهلية بجدة - فرع الزهراء.</p>
                
                <hr style="border-top: 1px solid #eee;">
                
                <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd; width: 30%; font-weight: bold;">رقم الحجز:</td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${booking._id}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">المرفق المحجوز:</td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;">**${booking.facility}**</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">التاريخ:</td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${bookingDate}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">مدة الفعالية:</td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${bookingTime}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">الفعالية:</td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${booking.activityName}</td>
                    </tr>
                </table>

                <p style="margin-top: 20px; font-size: 12px; color: #666;">يرجى مراجعة إدارة المدرسة في حال وجود أي استفسارات.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ تم إرسال تأكيد الحجز إلى: ${recipientEmail}`);
    } catch (error) {
        console.error(`❌ فشل إرسال البريد الإلكتروني إلى ${recipientEmail}:`, error);
    }
};

module.exports = sendBookingConfirmation;