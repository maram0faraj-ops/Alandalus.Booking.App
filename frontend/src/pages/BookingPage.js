// frontend/src/pages/BookingPage.js

import React, { useState, useEffect, useMemo } from 'react';
import { Container, Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import 'moment/locale/ar-sa'; 

moment.locale('ar-sa'); 

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const facilities = ['المسرح', 'مصادر التعلم', 'قاعة بلنسية', 'الصالة الرياضية بنات', 'الصالة الرياضية بنين'];
const sections = ['بنين', 'بنات'];
const stages = ['رياض الأطفال', 'طفولة مبكرة', 'ابتدائي', 'متوسط', 'ثانوي', 'إشراف تعليمي', 'إدارة عامة'];
const bookingTypes = ['داخلي', 'خارجي'];

const BookingPage = () => {
    const navigate = useNavigate();

    const availableDates = useMemo(() => {
        const days = [];
        for (let i = 0; i < 60; i++) { 
            const d = moment().add(i, 'days');
            days.push({
                value: d.clone().locale('en').format('YYYY-MM-DD'), 
                label: d.format('dddd - DD/MM/YYYY')
            });
        }
        return days;
    }, []);

    const [formData, setFormData] = useState({
        facility: facilities[0],
        datePart: availableDates[0].value, 
        timePart: '08:00', 
        activityName: '',
        duration: 1, 
        section: sections[0], 
        stage: stages[0],     
        bookingType: bookingTypes[0],
        chairsNeeded: 0,
        microphonesNeeded: 1,
        contactPhone: '', // حقل مطلوب في الخلفية
        contactEmail: ''  // حقل مطلوب في الخلفية
    });

    const [error, setError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        const token = localStorage.getItem('token');

        try {
            const dateTimeString = `${formData.datePart}T${formData.timePart}`;
            // إرسال كافة الحقول المطلوبة لتجاوز خطأ التحقق
            const payload = { ...formData, date: new Date(dateTimeString) };
            await axios.post(`${API_URL}/bookings`, payload, {
                headers: { 'x-auth-token': token, 'Content-Type': 'application/json' },
            });
            setShowSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'فشل الاتصال بالخادم');
        } finally {
            setIsSubmitting(false);
        }
    };

    const labelStyle = { fontWeight: 'bold', color: '#003366', fontSize: '0.85rem' };

    return (
        <Container className="mt-4 mb-5">
            <Card className="shadow-lg p-4 border-0 rounded-4">
                <h3 className="text-center fw-bold text-primary mb-4">نموذج حجز قاعة جديدة</h3>
                
                {error && <Alert variant="danger" className="text-center">{error}</Alert>}
                {showSuccess && <Alert variant="success" className="text-center">✅ تم الحجز بنجاح!</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Row className="g-3">
                        {/* المكان والتوقيت */}
                        <Col md={6}>
                            <Card className="p-3 border-0 bg-light shadow-sm">
                                <h6 className="text-danger fw-bold mb-3"> المكان والتوقيت</h6>
                                <Form.Group className="mb-2">
                                    <Form.Label style={labelStyle}>القاعة</Form.Label>
                                    <Form.Select name="facility" value={formData.facility} onChange={handleChange}>
                                        {facilities.map(f => <option key={f} value={f}>{f}</option>)}
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-2">
                                    <Form.Label style={labelStyle}>القسم</Form.Label>
                                    <Form.Select name="section" value={formData.section} onChange={handleChange}>
                                        {sections.map(s => <option key={s} value={s}>{s}</option>)}
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-2">
                                    <Form.Label style={labelStyle}>التاريخ</Form.Label>
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

                        {/* تفاصيل النشاط والتواصل */}
                        <Col md={6}>
                            <Card className="p-3 border-0 bg-light shadow-sm">
                                <h6 className="text-danger fw-bold mb-3"> النشاط والتواصل</h6>
                                <Form.Group className="mb-2">
                                    <Form.Label style={labelStyle}>اسم النشاط</Form.Label>
                                    <Form.Control type="text" name="activityName" value={formData.activityName} onChange={handleChange} required />
                                </Form.Group>
                                <Row className="mb-2">
                                    <Col>
                                        <Form.Label style={labelStyle}>عدد الكراسي</Form.Label>
                                        <Form.Control type="number" name="chairsNeeded" value={formData.chairsNeeded} onChange={handleChange} />
                                    </Col>
                                    <Col>
                                        <Form.Label style={labelStyle}>الجوال</Form.Label>
                                        <Form.Control type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleChange} required placeholder="05xxxxxxxx" />
                                    </Col>
                                </Row>
                                <Form.Group className="mb-2">
                                    <Form.Label style={labelStyle}>البريد الإلكتروني</Form.Label>
                                    <Form.Control type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} required />
                                </Form.Group>
                                <Row>
                                    <Col>
                                        <Form.Label style={labelStyle}>المرحلة</Form.Label>
                                        <Form.Select name="stage" value={formData.stage} onChange={handleChange}>
                                            {stages.map(s => <option key={s} value={s}>{s}</option>)}
                                        </Form.Select>
                                    </Col>
                                    <Col>
                                        <Form.Label style={labelStyle}>المدة (ساعة)</Form.Label>
                                        <Form.Control type="number" name="duration" value={formData.duration} onChange={handleChange} min="1" required />
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                    </Row>
                    
                    <Button variant="primary" size="lg" type="submit" className="w-100 mt-4 fw-bold" disabled={isSubmitting}>
                        {isSubmitting ? 'جاري الإرسال...' : 'إرسال طلب الحجز'}
                    </Button>
                </Form>
            </Card>
        </Container>
    );
};

export default BookingPage;