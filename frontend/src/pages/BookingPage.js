// frontend/src/pages/BookingPage.js

import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import 'moment/locale/ar-sa'; 
import '../custom.css'; 
import emailjs from '@emailjs/browser'; 

moment.locale('ar-sa'); 

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const facilities = ['المسرح', 'مصادر التعلم', 'قاعة بلنسية', 'الصالة الرياضية بنات', 'الصالة الرياضية بنين'];
const sections = ['بنين', 'بنات'];
const stages = ['رياض الأطفال', 'طفولة مبكرة', 'ابتدائي', 'متوسط', 'ثانوي', 'إشراف تعليمي', 'إدارة عامة'];
const bookingTypes = ['داخلي', 'خارجي'];

const BookingPage = () => {
    const navigate = useNavigate();

    const getNextDays = () => {
        const days = [];
        for (let i = 0; i < 14; i++) { 
            const d = moment().add(i, 'days');
            days.push({
                value: d.clone().locale('en').format('YYYY-MM-DD'), 
                label: d.format('dddd - DD/MM/YYYY'), 
                dayName: d.format('dddd')
            });
        }
        return days;
    };

    const availableDates = getNextDays();

    const [formData, setFormData] = useState({
        facility: facilities[0],
        datePart: availableDates[0].value, 
        timePart: '08:00', 
        activityName: '',
        duration: 1, 
        section: sections[0], 
        stage: stages[0],     
        bookingType: bookingTypes[0],
        externalEntityName: '',
        chairsNeeded: 0,
        tablesNeeded: 0,
        contactPhone: '',
        contactEmail: ''
    });

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [dayOfWeek, setDayOfWeek] = useState(availableDates[0].dayName);
    const [whatsappLink, setWhatsappLink] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        const selected = availableDates.find(d => d.value === formData.datePart);
        if (selected) {
            setDayOfWeek(selected.dayName);
        }
    }, [formData.datePart]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // --- 1. دالة إرسال الإيميل ---
    const sendEmailNotification = (bookingData, bookingId) => {
        const templateParams = {
            to_name: "مدير النظام", 
            facility_name: bookingData.facility,
            booking_date: `${bookingData.datePart} - الساعة ${bookingData.timePart}`,
            email: bookingData.contactEmail, 
            booking_id: bookingId 
        };

        emailjs.send(
            'service_fy2kk0l',    // Service ID
            'template_sh4ienl',   // Template ID
            templateParams,
            'ELWHlKKgEaqg3GZzD'   // Public Key (الحرف الصغير L)
        )
        .then(() => {
             console.log('✅ تم إرسال الإيميل بنجاح');
             // alert("تم إرسال الإيميل بنجاح إلى بريدك"); // يمكنك تفعيل هذا للتأكد
        })
        .catch((err) => {
             console.error('❌ فشل إرسال الإيميل', err);
             alert("تنبيه: تم الحجز ولكن فشل إرسال الإيميل. تأكد من صحة البريد.");
        });
    };

    // --- 2. دالة فتح الواتساب ---
    const openWhatsApp = (bookingData, bookingId) => {
        // تنظيف رقم الجوال من أي رموز غير رقمية
        let phone = bookingData.contactPhone.replace(/[^0-9]/g, '');
        
        // معالجة صيغ الرقم السعودي
        if (phone.startsWith('05')) {
            phone = '966' + phone.substring(1); // تحويل 05xxxx إلى 9665xxxx
        } else if (phone.startsWith('5')) {
            phone = '966' + phone;
        } else if (!phone.startsWith('966')) {
            // إذا لم يبدأ بـ 966 ولم يكن 05، نفترض أنه 966 ونضيفها احتياطاً
             phone = '966' + phone;
        }

        const text = `
*✅ تأكيد حجز - مدارس الأندلس*
---------------------------
رقم الحجز: ${bookingId}
المرفق: ${bookingData.facility}
التاريخ: ${bookingData.datePart}
الوقت: ${bookingData.timePart}
النشاط: ${bookingData.activityName}
---------------------------
(رسالة تلقائية للتوثيق)
        `.trim();

        const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
        setWhatsappLink(url);

        // محاولة الفتح التلقائي
        const win = window.open(url, '_blank');
        
        if (!win || win.closed || typeof win.closed == 'undefined') {
            // إذا فشل الفتح التلقائي (بسبب مانع الإعلانات)، نظهر الزر
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setShowSuccess(false);

        const token = localStorage.getItem('token');
        if (!token) {
            alert('عفواً، انتهت جلستك. يرجى تسجيل الدخول مرة أخرى.');
            return;
        }

        // تنبيه مبدئي للتأكد أن الزر يعمل
        // alert("جاري إرسال الطلب للسيرفر..."); 

        try {
            const dateTimeString = `${formData.datePart}T${formData.timePart}`;
            const fullDate = new Date(dateTimeString);

            if (isNaN(fullDate.getTime())) {
                alert("تنسيق التاريخ غير صحيح");
                return;
            }

            const payload = { ...formData, date: fullDate };

            // 1. إرسال للسيرفر
            const res = await axios.post(`${API_URL}/bookings`, payload, {
                headers: { 'x-auth-token': token, 'Content-Type': 'application/json' },
            });

            // إذا وصلنا هنا، يعني الحجز نجح
            const bookingId = res.data.booking._id;
            // alert(`تم الحجز بنجاح! رقم الحجز: ${bookingId}`);

            setShowSuccess(true); // إظهار رسالة النجاح الخضراء

            // 2. إرسال الإيميل
            sendEmailNotification(formData, bookingId);

            // 3. فتح الواتساب
            setTimeout(() => {
                const opened = openWhatsApp(formData, bookingId);
                if (!opened) {
                    alert("تم الحجز ✅\n\nلكن المتصفح منع فتح الواتساب تلقائياً.\nالرجاء الضغط على الزر الأخضر الظاهر في الشاشة لإرسال الرسالة.");
                }
            }, 1000);

            // تفريغ النموذج (اختياري)
            // setFormData({ ...formData, activityName: '', contactPhone: '', contactEmail: '' });

        } catch (err) {
            console.error('Booking error:', err.response);
            const serverMsg = err.response?.data?.message || 'فشل الاتصال بالخادم';
            
            // إظهار الخطأ بوضوح
            alert(`❌ فشل الحجز!\nالسبب: ${serverMsg}`);
            setError(serverMsg);
        }
    };

    const isExternal = formData.bookingType === 'خارجي';
    const inputStyle = { backgroundColor: '#f1f3f5', border: 'none', padding: '10px', borderRadius: '5px' };
    const labelStyle = { fontWeight: 'bold', color: 'var(--navy-blue)', fontSize: '0.9rem', marginBottom: '5px' };

    return (
        <Container className="mt-4 mb-5">
            <Card className="shadow-lg p-4 border-0" style={{ borderRadius: '15px' }}>
                <div className="text-center mb-4">
                    <h2 className="fw-bold text-primary">نموذج حجز قاعة جديدة</h2>
                    <p className="text-muted">يرجى تعبئة البيانات بدقة لضمان اعتماد الحجز</p>
                </div>
                
                {/* رسالة نجاح كبيرة وواضحة */}
                {showSuccess && (
                    <Alert variant="success" className="text-center p-4">
                        <h4 className="fw-bold">✅ تم الحجز بنجاح!</h4>
                        <p>تم إرسال تفاصيل الحجز إلى بريدك الإلكتروني.</p>
                        
                        {whatsappLink && (
                            <div className="mt-3">
                                <p className="mb-2 fw-bold text-dark">هل لم يفتح الواتساب تلقائياً؟ اضغط هنا:</p>
                                <a 
                                    href={whatsappLink} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="btn btn-success fw-bold px-4 py-2"
                                    style={{ fontSize: '1.1rem' }}
                                >
                                    📱 فتح الواتساب وتأكيد الحجز
                                </a>
                            </div>
                        )}
                        <hr />
                        <Button variant="outline-success" size="sm" onClick={() => navigate('/')}>
                            العودة للصفحة الرئيسية
                        </Button>
                    </Alert>
                )}

                {error && <Alert variant="danger">{error}</Alert>}

                {/* إخفاء النموذج عند النجاح لمنع التكرار */}
                {!showSuccess && (
                <Form onSubmit={handleSubmit}>
                    <Row className="g-3">
                        <Col md={6}>
                            <Card className="p-3 border-0 bg-light h-100">
                                <h5 className="text-pink fw-bold mb-3">بيانات القاعة والتوقيت</h5>
                                <Form.Group className="mb-3" controlId="facility">
                                    <Form.Label style={labelStyle}>القاعة / المرفق</Form.Label>
                                    <Form.Select name="facility" value={formData.facility} onChange={handleChange} style={inputStyle}>
                                        {facilities.map(f => <option key={f} value={f}>{f}</option>)}
                                    </Form.Select>
                                </Form.Group>
                                <Row>
                                    <Col>
                                        <Form.Group className="mb-3">
                                            <Form.Label style={labelStyle}>تاريخ الحجز</Form.Label>
                                            <Form.Select name="datePart" value={formData.datePart} onChange={handleChange} style={inputStyle}>
                                                {availableDates.map((d, idx) => (<option key={idx} value={d.value}>{d.label}</option>))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group className="mb-3">
                                            <Form.Label style={labelStyle}>وقت البدء</Form.Label>
                                            <Form.Control type="time" name="timePart" value={formData.timePart} onChange={handleChange} required style={inputStyle} />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Form.Group className="mb-3">
                                    <Form.Label style={{...labelStyle, color: '#6c757d'}}>اليوم المحدد</Form.Label>
                                    <Form.Control type="text" value={dayOfWeek} disabled style={{...inputStyle, backgroundColor: '#e9ecef'}} />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="section">
                                    <Form.Label style={labelStyle}>القسم</Form.Label>
                                    <Form.Select name="section" value={formData.section} onChange={handleChange} style={inputStyle}>
                                        {sections.map(s => <option key={s} value={s}>{s}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Card>
                        </Col>

                        <Col md={6}>
                            <Card className="p-3 border-0 bg-light h-100">
                                <h5 className="text-pink fw-bold mb-3">تفاصيل النشاط والتواصل</h5>
                                <Form.Group className="mb-3">
                                    <Form.Label style={labelStyle}>اسم الفعالية/النشاط</Form.Label>
                                    <Form.Control type="text" name="activityName" value={formData.activityName} onChange={handleChange} required placeholder="مثال: حفل تخرج" style={inputStyle} />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label style={labelStyle}>المدة (بالساعات)</Form.Label>
                                    <Form.Control type="number" name="duration" value={formData.duration} onChange={handleChange} min="1" max="12" step="0.5" required style={inputStyle} />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label style={labelStyle}>المرحلة</Form.Label>
                                    <Form.Select name="stage" value={formData.stage} onChange={handleChange} style={inputStyle}>
                                        {stages.map(s => <option key={s} value={s}>{s}</option>)}
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label style={labelStyle}>نوع الحجز</Form.Label>
                                    <Form.Select name="bookingType" value={formData.bookingType} onChange={handleChange} style={inputStyle}>
                                        {bookingTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                    </Form.Select>
                                </Form.Group>
                                {isExternal && (
                                    <Form.Group className="mb-3">
                                        <Form.Label style={labelStyle}>اسم الجهة الخارجية</Form.Label>
                                        <Form.Control type="text" name="externalEntityName" value={formData.externalEntityName} onChange={handleChange} required style={inputStyle} />
                                    </Form.Group>
                                )}
                                <Row>
                                    <Col>
                                        <Form.Group className="mb-3">
                                            <Form.Label style={labelStyle}>عدد الكراسي</Form.Label>
                                            <Form.Control type="number" name="chairsNeeded" value={formData.chairsNeeded} onChange={handleChange} min="0" style={inputStyle} />
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group className="mb-3">
                                            <Form.Label style={labelStyle}>عدد الطاولات</Form.Label>
                                            <Form.Control type="number" name="tablesNeeded" value={formData.tablesNeeded} onChange={handleChange} min="0" disabled={formData.facility === 'المسرح'} style={inputStyle} />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                    </Row>

                    <div className="mt-4 p-3 rounded" style={{ backgroundColor: 'rgba(0, 31, 63, 0.05)' }}>
                        <h5 className="text-primary fw-bold mb-3">بيانات التواصل (لتأكيد الحجز)</h5>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId="contactPhone">
                                    <Form.Label style={labelStyle}>رقم الجوال (لإشعار الواتساب) <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleChange} placeholder="05xxxxxxxx" required style={{...inputStyle, backgroundColor: '#fff'}} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId="contactEmail">
                                    <Form.Label style={labelStyle}>البريد الإلكتروني <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} placeholder="name@example.com" required style={{...inputStyle, backgroundColor: '#fff'}} />
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>

                    <div className="d-grid gap-2 mt-4">
                        <Button variant="success" size="lg" type="submit" className="fw-bold text-white shadow-sm" style={{ padding: '12px' }}>
                            إرسال طلب الحجز
                        </Button>
                    </div>
                </Form>
                )}
            </Card>
        </Container>
    );
};

export default BookingPage;