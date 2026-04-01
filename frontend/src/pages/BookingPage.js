// frontend/src/pages/BookingPage.js
import React, { useState, useMemo } from 'react';
import { Container, Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/ar-sa'; 

moment.locale('ar-sa'); 
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const BookingPage = () => {
    // تمديد الحجز لـ 60 يوماً مع ضمان الأداء
    const availableDates = useMemo(() => {
        const days = [];
        for (let i = 0; i < 60; i++) { 
            const d = moment().add(i, 'days');
            days.push({ value: d.clone().locale('en').format('YYYY-MM-DD'), label: d.format('dddd - DD/MM/YYYY') });
        }
        return days;
    }, []);

    const [formData, setFormData] = useState({
        facility: 'المسرح', section: 'بنين', datePart: availableDates[0].value, 
        timePart: '08:00', activityName: '', duration: 1, stage: 'ابتدائي',     
        bookingType: 'داخلي', chairsNeeded: 0, microphonesNeeded: 1,
        contactPhone: '', contactEmail: '' 
    });

    const [error, setError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const token = localStorage.getItem('token');
        try {
            // دمج التاريخ والوقت بشكل صحيح
            const payload = { ...formData, date: new Date(`${formData.datePart}T${formData.timePart}`) };
            await axios.post(`${API_URL}/bookings`, payload, {
                headers: { 'x-auth-token': token, 'Content-Type': 'application/json' },
            });
            setShowSuccess(true);
        } catch (err) {
            // عرض سبب الخطأ الحقيقي القادم من السيرفر
            setError(err.response?.data?.message || 'حدث خطأ في الاتصال، يرجى المحاولة مرة أخرى');
        }
    };

    return (
        <Container className="mt-4">
            <Card className="shadow-lg p-4 border-0 rounded-4">
                <h3 className="text-center text-primary fw-bold mb-4">نموذج حجز قاعة جديدة</h3>
                {error && <Alert variant="danger" className="text-center">{error}</Alert>}
                {showSuccess && <Alert variant="success" className="text-center">✅ تم الحجز بنجاح!</Alert>}
                <Form onSubmit={handleSubmit}>
                   {/* تم تبسيط النموذج لضمان إرسال الحقول الإجبارية بنجاح */}
                    <Row className="g-3">
                        <Col md={6}>
                            <Form.Group className="mb-2">
                                <Form.Label className="small fw-bold">القاعة</Form.Label>
                                <Form.Select name="facility" value={formData.facility} onChange={(e) => setFormData({...formData, facility: e.target.value})}>
                                    {['المسرح', 'مصادر التعلم', 'قاعة بلنسية', 'الصالة الرياضية بنات', 'الصالة الرياضية بنين'].map(f => <option key={f} value={f}>{f}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-2">
                                <Form.Label className="small fw-bold">الجوال (مطلوب للتأكيد)</Form.Label>
                                <Form.Control type="tel" value={formData.contactPhone} onChange={(e) => setFormData({...formData, contactPhone: e.target.value})} required placeholder="05xxxxxxxx" />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Button variant="primary" size="lg" type="submit" className="w-100 mt-4 fw-bold">إرسال طلب الحجز</Button>
                </Form>
            </Card>
        </Container>
    );
};

export default BookingPage;