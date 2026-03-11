// frontend/src/pages/BookingPage.js

import React, { useState, useEffect, useMemo } from 'react'; // إضافة useMemo لتحسين الأداء
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

    // --- تحسين الأداء: حساب قائمة الـ 60 يوماً مرة واحدة فقط عند التحميل ---
    const availableDates = useMemo(() => {
        const days = [];
        for (let i = 0; i < 60; i++) { 
            const d = moment().add(i, 'days');
            days.push({
                value: d.clone().locale('en').format('YYYY-MM-DD'), 
                label: d.format('dddd - DD/MM/YYYY'), 
                dayName: d.format('dddd')
            });
        }
        return days;
    }, []); // لن يتم إعادة الحساب إلا إذا تغيرت الصفحة بالكامل

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

    const [error, setError] = useState('');
    const [dayOfWeek, setDayOfWeek] = useState(availableDates[0].dayName);
    const [whatsappLink, setWhatsappLink] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false); // حالة لمنع النقر المتكرر

    useEffect(() => {
        const selected = availableDates.find(d => d.value === formData.datePart);
        if (selected) {
            setDayOfWeek(selected.dayName);
        }
    }, [formData.datePart, availableDates]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const sendEmailNotification = (bookingData, bookingId) => {
        const templateParams = {
            to_name: "مدير النظام", 
            facility_name: bookingData.facility,
            booking_date: `${bookingData.datePart} - الساعة ${bookingData.timePart}`,
            email: bookingData.contactEmail, 
            booking_id: bookingId 
        };

        emailjs.send('service_fy2kk0l', 'template_sh4ienl', templateParams, 'ELWHlKKgEaqg3GZzD')
        .catch(err => console.error('❌ Email Notification Error:', err));
    };

    const openWhatsApp = (bookingData, bookingId) => {
        let phone = bookingData.contactPhone.replace(/[^0-9]/g, '');
        if (phone.startsWith('05')) phone = '966' + phone.substring(1);
        else if (phone.startsWith('5')) phone = '966' + phone;
        else if (!phone.startsWith('966')) phone = '966' + phone;

        const text = `*✅ تأكيد حجز - مدارس الأندلس*\nرقم الحجز: ${bookingId}\nالمرفق: ${bookingData.facility}\nالتاريخ: ${bookingData.datePart}`.trim();
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
        setWhatsappLink(url);
        window.open(url, '_blank');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true); // بدء حالة التحميل

        const token = localStorage.getItem('token');
        if (!token) {
            alert('عفواً، انتهت جلستك. يرجى تسجيل الدخول مرة أخرى.');
            setIsSubmitting(false);
            return;
        }

        try {
            const dateTimeString = `${formData.datePart}T${formData.timePart}`;
            const payload = { ...formData, date: new Date(dateTimeString) };

            const res = await axios.post(`${API_URL}/bookings`, payload, {
                headers: { 'x-auth-token': token, 'Content-Type': 'application/json' },
            });

            const bookingId = res.data.booking._id;
            setShowSuccess(true);
            sendEmailNotification(formData, bookingId);
            setTimeout(() => openWhatsApp(formData, bookingId), 800);

        } catch (err) {
            if (err.response && err.response.status === 409) {
                const ov = err.response.data.details;
                setError(`❌ القاعة محجوزة مسبقاً بواسطة: ${ov.reserverName}\nالتاريخ: ${ov.date} لمدة ${ov.duration} ساعة`); // عرض تفاصيل التداخل
            } else {
                setError(err.response?.data?.message || 'فشل الاتصال بالخادم');
            }
        } finally {
            setIsSubmitting(false); // إنهاء حالة التحميل
        }
    };

    const labelStyle = { fontWeight: 'bold', color: '#003366', fontSize: '0.9rem' };

    return (
        <Container className="mt-4 mb-5 animate-in">
            <Card className="shadow-lg p-4 border-0 rounded-4">
                <div className="text-center mb-4">
                    <h2 className="fw-bold text-primary">نموذج حجز قاعة جديدة</h2>
                    <p className="text-muted small">يمكنك الآن الحجز المسبق لمدة تصل إلى شهرين (60 يوماً)</p>
                </div>
                
                {showSuccess && (
                    <Alert variant="success" className="text-center fade-in">
                        <h4 className="fw-bold">✅ تم الحجز بنجاح!</h4>
                        <Button variant="success" className="mt-2" onClick={() => window.open(whatsappLink, '_blank')}>📱 فتح الواتساب يدوياً</Button>
                        <hr /><Button variant="link" onClick={() => navigate('/')}>العودة للرئيسية</Button>
                    </Alert>
                )}

                {error && <Alert variant="danger" style={{ whiteSpace: 'pre-line' }}>{error}</Alert>}

                {!showSuccess && (
                <Form onSubmit={handleSubmit}>
                    <Row className="g-3">
                        <Col md={6}>
                            <Card className="p-3 border-0 bg-light shadow-sm">
                                <h6 className="text-danger fw-bold mb-3">🕒 التوقيت والمكان</h6>
                                <Form.Group className="mb-2">
                                    <Form.Label style={labelStyle}>القاعة</Form.Label>
                                    <Form.Select name="facility" value={formData.facility} onChange={handleChange}>
                                        {facilities.map(f => <option key={f} value={f}>{f}</option>)}
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-2">
                                    <Form.Label style={labelStyle}>التاريخ (متاح لـ 60 يوماً)</Form.Label>
                                    <Form.Select name="datePart" value={formData.datePart} onChange={handleChange}>
                                        {availableDates.map((d, idx) => (<option key={idx} value={d.value}>{d.label}</option>))}
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-2">
                                    <Form.Label style={labelStyle}>وقت البدء</Form.Label>
                                    <Form.Control type="time" name="timePart" value={formData.timePart} onChange={handleChange} required />
                                </Form.Group>
                            </Card>
                        </Col>
                        <Col md={6}>
                            <Card className="p-3 border-0 bg-light shadow-sm">
                                <h6 className="text-danger fw-bold mb-3">📝 تفاصيل النشاط</h6>
                                <Form.Group className="mb-2">
                                    <Form.Label style={labelStyle}>اسم النشاط</Form.Label>
                                    <Form.Control type="text" name="activityName" value={formData.activityName} onChange={handleChange} required placeholder="مثال: حفل تكريم" />
                                </Form.Group>
                                <Form.Group className="mb-2">
                                    <Form.Label style={labelStyle}>المدة (ساعة)</Form.Label>
                                    <Form.Control type="number" name="duration" value={formData.duration} onChange={handleChange} min="1" max="12" step="0.5" required />
                                </Form.Group>
                                <Form.Group className="mb-2">
                                    <Form.Label style={labelStyle}>المرحلة</Form.Label>
                                    <Form.Select name="stage" value={formData.stage} onChange={handleChange}>
                                        {stages.map(s => <option key={s} value={s}>{s}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Card>
                        </Col>
                    </Row>

                    <div className="mt-4 p-3 border rounded-3 bg-white">
                        <h6 className="text-primary fw-bold">📞 بيانات التواصل والاستلام</h6>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-2">
                                    <Form.Label style={labelStyle}>الجوال</Form.Label>
                                    <Form.Control type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleChange} placeholder="05xxxxxxxx" required />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-2">
                                    <Form.Label style={labelStyle}>البريد</Form.Label>
                                    <Form.Control type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} required />
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>

                    <Button variant="primary" size="lg" type="submit" className="w-100 mt-4 fw-bold shadow" disabled={isSubmitting}>
                        {isSubmitting ? 'جاري معالجة الطلب...' : 'إرسال طلب الحجز'}
                    </Button>
                </Form>
                )}
            </Card>
        </Container>
    );
};

export default BookingPage;