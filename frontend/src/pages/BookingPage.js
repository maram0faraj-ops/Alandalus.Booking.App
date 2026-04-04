import React, { useState, useMemo } from 'react';
import { Container, Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/ar-sa'; 

// إعدادات اللغة العربية والوقت
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
        section: 'بنات', 
        stage: 'الابتدائي', 
        bookingType: 'داخلي', 
        datePart: availableDates[0].value, 
        timePart: '08:00', 
        activityName: '', 
        duration: 1, 
        contactPhone: '', 
        contactEmail: '' 
    });

    const [error, setError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setShowSuccess(false);
        const token = localStorage.getItem('token');
        
        try {
            const payload = { 
                ...formData, 
                date: new Date(`${formData.datePart}T${formData.timePart}`),
                chairsNeeded: 0,
                tablesNeeded: 0
            };
            
            await axios.post(`${API_URL}/bookings`, payload, {
                headers: { 
                    'x-auth-token': token, 
                    'Content-Type': 'application/json' 
                },
            });
            
            setShowSuccess(true);
            window.scrollTo(0, 0);
        } catch (err) {
            setError(err.response?.data?.message || 'حدث خطأ في الاتصال، يرجى المحاولة لاحقاً');
        }
    };

    return (
        <Container className="mt-4 mb-5">
            <Card className="shadow-lg p-4 border-0 rounded-4">
                {error && <Alert variant="danger" className="text-center fw-bold">{error}</Alert>}
                {showSuccess && <Alert variant="success" className="text-center fw-bold">✅ تم إرسال طلب الحجز بنجاح!</Alert>}
                
                <Form onSubmit={handleSubmit}>
                    <Row className="g-3">
                        {/* ✅ تم إضافة text-end لكل label لضبط المحاذاة من اليمين */}
                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold w-100 text-end">نوع الحجز</Form.Label>
                                <Form.Select 
                                    className="text-end"
                                    value={formData.bookingType} 
                                    onChange={(e) => setFormData({...formData, bookingType: e.target.value})}
                                >
                                    <option value="داخلي">داخلي (فعالية مدرسية)</option>
                                    <option value="خارجي">خارجي (جهة خارجية)</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold w-100 text-end">القسم</Form.Label>
                                <Form.Select className="text-end" value={formData.section} onChange={(e) => setFormData({...formData, section: e.target.value})}>
                                    <option value="بنات">بنات</option>
                                    <option value="بنين">بنين</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold w-100 text-end">المرحلة</Form.Label>
                                <Form.Select className="text-end" value={formData.stage} onChange={(e) => setFormData({...formData, stage: e.target.value})}>
                                    <option value="رياض أطفال">رياض أطفال</option>
                                    <option value="الطفولة المبكرة">الطفولة المبكرة</option>
                                    <option value="الابتدائي">الابتدائي</option>
                                    <option value="المتوسط">المتوسط</option>
                                    <option value="الثانوي">الثانوي</option>
                                    <option value="الإدارة العامة">الإدارة العامة</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold w-100 text-end">القاعة</Form.Label>
                                <Form.Select className="text-end" value={formData.facility} onChange={(e) => setFormData({...formData, facility: e.target.value})}>
                                    {['المسرح', 'مصادر التعلم', 'قاعة بلنسية', 'الصالة الرياضية بنات', 'الصالة الرياضية بنين'].map(f => <option key={f} value={f}>{f}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold w-100 text-end">اسم الفعالية</Form.Label>
                                <Form.Control className="text-end" required type="text" value={formData.activityName} onChange={(e) => setFormData({...formData, activityName: e.target.value})} placeholder="ورشة عمل، مجلس أمهات..." />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold w-100 text-end">التاريخ المتاح (خلال 60 يوم)</Form.Label>
                                <Form.Select className="text-end" value={formData.datePart} onChange={(e) => setFormData({...formData, datePart: e.target.value})}>
                                    {availableDates.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold w-100 text-end">وقت البدء</Form.Label>
                                <Form.Control className="text-end" type="time" value={formData.timePart} onChange={(e) => setFormData({...formData, timePart: e.target.value})} />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold w-100 text-end">المدة (ساعات)</Form.Label>
                                <Form.Control className="text-end" type="number" min="1" max="8" value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold w-100 text-end">الجوال (للتواصل)</Form.Label>
                                <Form.Control className="text-end" required type="tel" value={formData.contactPhone} onChange={(e) => setFormData({...formData, contactPhone: e.target.value})} placeholder="05xxxxxxxx" />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold w-100 text-end">البريد الإلكتروني</Form.Label>
                                <Form.Control className="text-end" required type="email" value={formData.contactEmail} onChange={(e) => setFormData({...formData, contactEmail: e.target.value})} placeholder="email@as.edu.sa" />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Button variant="primary" size="lg" type="submit" className="w-100 mt-4 fw-bold shadow-sm">إرسال طلب الحجز</Button>
                </Form>
            </Card>
        </Container>
    );
};

export default BookingPage;