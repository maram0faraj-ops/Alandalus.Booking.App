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

    // ... (نفس دوال الوقت والتاريخ السابقة) ...
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

    // ---------------------------------------------------------
    // دالة إرسال الإيميل (مع تنبيهات)
    // ---------------------------------------------------------
    const sendEmailNotification = (bookingData, bookingId) => {
        // تنبيه بأن المحاولة بدأت
        console.log("جاري محاولة إرسال الإيميل...");

        const templateParams = {
            to_name: "مدير النظام", 
            facility_name: bookingData.facility,
            booking_date: `${bookingData.datePart} - الساعة ${bookingData.timePart}`,
            email: bookingData.contactEmail, 
            booking_id: bookingId 
        };

        emailjs.send(
            'service_fy2kk0l',      // Service ID (من صورتك)
            'template_sh4ienl',     // Template ID
            templateParams,
            'ELWHlKKgEaqg3GZzD'     // ⚠️ تأكدي من نسخ هذا الرمز بدقة من الموقع مرة أخرى
        )
        .then((response) => {
             console.log('✅ تم الإرسال!', response);
             alert(`تم إرسال الإيميل بنجاح إلى: ${bookingData.contactEmail}`);
        }, (err) => {
             console.error('❌ فشل الإرسال', err);
             // هذا التنبيه سيخبرك بالضبط ما هي المشكلة
             alert(`فشل إرسال الإيميل! \nالسبب: ${JSON.stringify(err.text || err)}`);
        });
    };

    // زر تجربة الإيميل فقط (دون حجز)
    const testEmailOnly = () => {
        if(!formData.contactEmail) {
            alert("الرجاء كتابة إيميل في خانة البريد الإلكتروني بالأسفل لتجربة الإرسال");
            return;
        }
        sendEmailNotification(formData, "تجربة-123");
    };
    // ---------------------------------------------------------

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        const token = localStorage.getItem('token');
        if (!token) {
            setError('الرجاء تسجيل الدخول أولاً لإجراء الحجز.');
            return;
        }

        try {
            const dateTimeString = `${formData.datePart}T${formData.timePart}`;
            const fullDate = new Date(dateTimeString);

            if (isNaN(fullDate.getTime())) {
                setError("تنسيق التاريخ أو الوقت غير صالح.");
                return;
            }

            const payload = { ...formData, date: fullDate }; // اختصار للبيانات

            const res = await axios.post(`${API_URL}/bookings`, payload, {
                headers: { 'x-auth-token': token, 'Content-Type': 'application/json' },
            });

            setMessage(`تم الحجز بنجاح! رقم الحجز: ${res.data.booking._id}.`);
            
            // إرسال الإيميل بعد نجاح الحجز
            sendEmailNotification(formData, res.data.booking._id);

            setError('');
            setTimeout(() => { navigate('/'); }, 3000);

        } catch (err) {
            console.error('Booking error:', err.response);
            const serverMsg = err.response?.data?.message;
            if (serverMsg) setError(`فشل الحجز: ${serverMsg}`);
            else setError('حدث خطأ أثناء الحجز');
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
                </div>
                
                {/* زر التجربة المضاف */}
                <div className="text-center mb-3">
                    <Button variant="warning" onClick={testEmailOnly} type="button">
                        📧 تجربة إرسال إيميل فقط (للاختبار)
                    </Button>
                </div>

                {message && <Alert variant="success">{message}</Alert>}
                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                    {/* ... (نفس محتوى الفورم الخاص بك تماماً - انسخيه هنا) ... */}
                    {/* سأضع الأسطر المهمة فقط للاختصار، لكن ابقي على تصميمك كما هو */}
                    <Row className="g-3">
                        <Col md={6}>
                           {/* ... حقول القاعة ... */}
                           <Card className="p-3 border-0 bg-light h-100">
                                <Form.Group className="mb-3" controlId="facility">
                                    <Form.Label style={labelStyle}>القاعة / المرفق</Form.Label>
                                    <Form.Select name="facility" value={formData.facility} onChange={handleChange} style={inputStyle}>
                                        {facilities.map(f => <option key={f} value={f}>{f}</option>)}
                                    </Form.Select>
                                </Form.Group>
                                {/* ... تأكدي من نسخ باقي حقول العمود الأيمن من كودك السابق ... */}
                                <Row>
                                    <Col>
                                        <Form.Group className="mb-3"><Form.Label style={labelStyle}>تاريخ الحجز</Form.Label><Form.Select name="datePart" value={formData.datePart} onChange={handleChange} style={inputStyle}>{availableDates.map((d, idx) => (<option key={idx} value={d.value}>{d.label}</option>))}</Form.Select></Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group className="mb-3"><Form.Label style={labelStyle}>وقت البدء</Form.Label><Form.Control type="time" name="timePart" value={formData.timePart} onChange={handleChange} required style={inputStyle} /></Form.Group>
                                    </Col>
                                </Row>
                           </Card>
                        </Col>
                        <Col md={6}>
                            {/* ... حقول النشاط ... */}
                            <Card className="p-3 border-0 bg-light h-100">
                                <Form.Group className="mb-3"><Form.Label style={labelStyle}>اسم الفعالية</Form.Label><Form.Control type="text" name="activityName" value={formData.activityName} onChange={handleChange} required style={inputStyle} /></Form.Group>
                                <Form.Group className="mb-3"><Form.Label style={labelStyle}>المدة</Form.Label><Form.Control type="number" name="duration" value={formData.duration} onChange={handleChange} required style={inputStyle} /></Form.Group>
                                {/* ... انسخي باقي حقول العمود الأيسر ... */}
                            </Card>
                        </Col>
                    </Row>

                    <div className="mt-4 p-3 rounded" style={{ backgroundColor: 'rgba(0, 31, 63, 0.05)' }}>
                        <h5 className="text-primary fw-bold mb-3">بيانات التواصل</h5>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label style={labelStyle}>رقم الجوال</Form.Label>
                                    <Form.Control type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleChange} required style={inputStyle} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label style={labelStyle}>البريد الإلكتروني</Form.Label>
                                    <Form.Control type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} required style={inputStyle} />
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>

                    <div className="d-grid gap-2 mt-4">
                        <Button variant="success" size="lg" type="submit" className="fw-bold text-white shadow-sm">إرسال طلب الحجز</Button>
                    </div>
                </Form>
            </Card>
        </Container>
    );
};

export default BookingPage;