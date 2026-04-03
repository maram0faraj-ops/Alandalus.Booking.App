import React, { useState, useMemo } from 'react';
import { Container, Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/ar-sa'; 

moment.locale('ar-sa'); 
const API_URL = process.env.REACT_APP_API_URL || 'https://alandalus-booking-app.onrender.com/api';

const BookingPage = () => {
    const availableDates = useMemo(() => {
        const days = [];
        for (let i = 0; i < 60; i++) { 
            const d = moment().add(i, 'days');
            days.push({ value: d.clone().locale('en').format('YYYY-MM-DD'), label: d.format('dddd - DD/MM/YYYY') });
        }
        return days;
    }, []);

    const [formData, setFormData] = useState({
        facility: 'المسرح', 
        section: 'بنات', // الحقل الجديد المضاف
        stage: 'ابتدائي', 
        datePart: availableDates[0].value, 
        timePart: '08:00', 
        activityName: '', 
        duration: 1, 
        bookingType: 'داخلي', 
        contactPhone: '', 
        contactEmail: '' 
    });

    const [error, setError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const token = localStorage.getItem('token');
        try {
            const payload = { 
                ...formData, 
                date: new Date(`${formData.datePart}T${formData.timePart}`) 
            };
            await axios.post(`${API_URL}/bookings`, payload, {
                headers: { 'x-auth-token': token, 'Content-Type': 'application/json' },
            });
            setShowSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'حدث خطأ في الاتصال');
        }
    };

    return (
        <Container className="mt-4">
            <Card className="shadow-lg p-4 border-0 rounded-4">
                <h3 className="text-center text-primary fw-bold mb-4">نموذج حجز قاعة جديدة - مدارس الأندلس</h3>
                {error && <Alert variant="danger" className="text-center">{error}</Alert>}
                {showSuccess && <Alert variant="success" className="text-center">✅ تم الحجز بنجاح!</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Row className="g-3">
                        {/* ✅ إضافة القسم والمرحلة جنباً إلى جنب */}
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">القسم</Form.Label>
                                <Form.Select value={formData.section} onChange={(e) => setFormData({...formData, section: e.target.value})}>
                                    <option value="بنات">بنات</option>
                                    <option value="بنين">بنين</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">المرحلة</Form.Label>
                                <Form.Select value={formData.stage} onChange={(e) => setFormData({...formData, stage: e.target.value})}>
                                    {['تمهيدي', 'ابتدائي', 'متوسط', 'ثانوي', 'إداري'].map(s => <option key={s} value={s}>{s}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">القاعة</Form.Label>
                                <Form.Select value={formData.facility} onChange={(e) => setFormData({...formData, facility: e.target.value})}>
                                    {['المسرح', 'مصادر التعلم', 'قاعة بلنسية', 'الصالة الرياضية بنات', 'الصالة الرياضية بنين'].map(f => <option key={f} value={f}>{f}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">اسم الفعالية</Form.Label>
                                <Form.Control required type="text" value={formData.activityName} onChange={(e) => setFormData({...formData, activityName: e.target.value})} placeholder="ورشة عمل..." />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">التاريخ المتاح</Form.Label>
                                <Form.Select value={formData.datePart} onChange={(e) => setFormData({...formData, datePart: e.target.value})}>
                                    {availableDates.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">وقت البدء</Form.Label>
                                <Form.Control type="time" value={formData.timePart} onChange={(e) => setFormData({...formData, timePart: e.target.value})} />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">المدة (ساعات)</Form.Label>
                                <Form.Control type="number" min="1" max="8" value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">الجوال (مطلوب للتأكيد)</Form.Label>
                                <Form.Control required type="tel" value={formData.contactPhone} onChange={(e) => setFormData({...formData, contactPhone: e.target.value})} placeholder="05xxxxxxxx" />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">البريد الإلكتروني</Form.Label>
                                <Form.Control required type="email" value={formData.contactEmail} onChange={(e) => setFormData({...formData, contactEmail: e.target.value})} placeholder="email@example.com" />
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