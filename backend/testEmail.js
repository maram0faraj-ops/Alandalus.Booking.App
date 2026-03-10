require('dotenv').config(); // تأكد من وجود ملف .env في نفس المجلد أو المسار الصحيح
const nodemailer = require('nodemailer');

async function testEmail() {
    console.log("جاري اختبار إعدادات البريد الإلكتروني (Outlook)...");
    
    // التحقق من تحميل المتغيرات
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error("❌ خطأ: بيانات اعتماد البريد الإلكتروني مفقودة في ملف .env");
        console.error("تأكد من تعريف EMAIL_USER و EMAIL_PASS في ملف .env");
        return;
    }

    console.log(`المستخدم الحالي: ${process.env.EMAIL_USER}`);

    // إعدادات النقل الخاصة بـ Outlook / Office 365
    const transporter = nodemailer.createTransport({
        host: "smtp.office365.com", // خادم Outlook
        port: 587,                  // المنفذ القياسي لـ Outlook
        secure: false,              // false للمنفذ 587 (يستخدم STARTTLS)
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            ciphers: 'SSLv3' // قد يساعد في حل مشاكل التوافق
        }
    });

    try {
        await transporter.verify();
        console.log("✅ إعدادات Outlook صحيحة! جاهز لإرسال الرسائل.");
    } catch (error) {
        console.error("❌ فشل إعداد البريد الإلكتروني:", error.message);
        console.log("👉 نصيحة: تأكد من أن كلمة المرور في ملف .env هي كلمة مرور حساب Outlook الخاص بك.");
        console.log("إذا كنت تستخدم المصادقة الثنائية (2FA) على Outlook، قد تحتاج لإنشاء كلمة مرور للتطبيقات.");
    }
}

testEmail();