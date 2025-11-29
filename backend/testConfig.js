// backend/testConfig.js
require('dotenv').config();
const nodemailer = require('nodemailer');
const twilio = require('twilio');

async function testServices() {
    console.log("🔄 جاري اختبار الخدمات...");

    // 1. اختبار متغيرات البيئة
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error("❌ خطأ: بيانات البريد الإلكتروني ناقصة في ملف .env");
        return;
    }
    console.log("✅ تم قراءة متغيرات البيئة.");

    // 2. اختبار البريد الإلكتروني
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
        console.log("⏳ جاري محاولة الاتصال بـ Gmail...");
        await transporter.verify();
        console.log("✅ نجاح! إعدادات البريد الإلكتروني صحيحة والاتصال بـ Gmail ناجح.");
    } catch (error) {
        console.error("❌ فشل الاتصال بـ Gmail. السبب:");
        console.error(error.message);
        console.log("💡 نصيح: تأكد من استخدام 'App Password' وليس كلمة المرور العادية.");
    }

    // 3. اختبار إعدادات Twilio (اختياري)
    if (process.env.TWILIO_ACCOUNT_SID) {
        try {
            const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
            console.log("⏳ جاري التحقق من حساب Twilio...");
            await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
            console.log("✅ نجاح! إعدادات Twilio صحيحة.");
        } catch (error) {
            console.error("❌ فشل الاتصال بـ Twilio:");
            console.error(error.message);
        }
    } else {
        console.log("⚠️ تم تخطي اختبار Twilio لعدم وجود إعدادات في .env");
    }
}

testServices();