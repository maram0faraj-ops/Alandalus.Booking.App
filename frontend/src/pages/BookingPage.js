// frontend/src/pages/BookingPage.js
import React, { useState, useMemo } from 'react';
import { Container, Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/ar-sa'; 

moment.locale('ar-sa'); 
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const BookingPage = () => {
    const availableDates = useMemo(() => {
        const days = [];
        for (let i = 0; i < 60; i++) { // متاح لشهرين
            const d = moment().add(i, 'days');
            days.push({ value: d.clone().locale('en').format('YYYY-MM-DD'), label: d.format('dddd - DD/MM/YYYY') });
        }
        return days;
    }, []);

    const [formData, setFormData] = useState({
        facility: 'المسرح', section: 'بنين', datePart: availableDates[0].value, 
        timePart: '08:00', activityName: '', duration: 1, stage: 'ابتدائي',     
        bookingType: 'داخلي', chairsNeeded: 0, microphonesNeeded: 1,
        contactPhone: '', contactEmail: '' // حقول إجبارية
    });

    const [error, setError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const token = localStorage.getItem('token');
        try {
            const payload = { ...formData, date: new Date(`${formData.datePart}T${formData.timePart}`) };
            await axios.post(`${API_URL}/bookings`, payload, {
                headers: { 'x-auth-token': token, 'Content-Type': 'application/json' },
            });
            setShowSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'تأكد من تعبئة كافة الحقول المطلوبة');
        }
    };

    return (
        <Container className="mt-4">
            <Card className="shadow p-4 border-0 rounded-4">
                <h3 className="text-center text-primary fw-bold mb-4">نموذج حجز قاعة جديدة</h3>
                {error && <Alert variant="danger" className="text-center">{error}</Alert>}
                {showSuccess && <Alert variant="success" className="text-center">✅ تم الحجز بنجاح!</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Row className="g-3">
                        <Col md={6}>
                            <Form.Group className="mb-2">
                                <Form.Label className="small fw-bold">القاعة والتاريخ</Form.Label>
                                <Form.Select className="mb-2" name="facility" value={formData.facility} onChange={(e) => setFormData({...formData, facility: e.target.value})}>
                                    {['المسرح', 'مصادر التعلم', 'قاعة بلنسية', 'الصارة الرياضية'].map(f => <option key={f} value={f}>{f}</option>)}
                                </Form.Select>
                                <Form.Select name="datePart" value={formData.datePart} onChange={(e) => setFormData({...formData, datePart: e.target.value})}>
                                    {availableDates.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-2">
                                <Form.Label className="small fw-bold">بيانات التواصل</Form.Label>
                                <Form.Control className="mb-2" type="tel" placeholder="الجوال (مطلوب)" value={formData.contactPhone} onChange={(e) => setFormData({...formData, contactPhone: e.target.value})} required />
                                <Form.Control type="email" placeholder="البريد (مطلوب)" value={formData.contactEmail} onChange={(e) => setFormData({...formData, contactEmail: e.target.value})} required />
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