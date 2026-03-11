// frontend/src/pages/BookingPage.js

import React, { useState, useEffect, useMemo } from 'react';
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
const sections = ['بنين', 'بنات']; // قائمة الأقسام
const stages = ['رياض الأطفال', 'طفولة مبكرة', 'ابتدائي', 'متوسط', 'ثانوي', 'إشراف تعليمي', 'إدارة عامة'];
const bookingTypes = ['داخلي', 'خارجي'];

const BookingPage = () => {
    const navigate = useNavigate();

    // توليد 60 يوماً مع تحسين الأداء
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
    }, []);

    const [formData, setFormData] = useState({
        facility: facilities[0],
        datePart: availableDates[0].value, 
        timePart: '08:00', 
        activityName: '',
        duration: 1, 
        section: sections[0], // القيمة الافتراضية للقسم
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
    const [showSuccess, setShowSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const selected = availableDates.find(d => d.value === formData.datePart);
        if (selected) setDayOfWeek(selected.dayName);
    }, [formData.datePart, availableDates]);

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
            const payload = { ...formData, date: new Date(dateTimeString) };
            const res = await axios.post(`${API_URL}/bookings`, payload, {
                headers: { 'x-auth-token': token, 'Content-Type': 'application/json' },
            });
            setShowSuccess(true);
        } catch (err) {
            if (err.response && err.response.status === 409) {
                const ov = err.response.data.details;
                setError(`❌ محجوز مسبقاً بواسطة: ${ov.reserverName}\nالتاريخ: ${ov.date}`);
            } else {
                setError(err.response?.data?.message || 'فشل الاتصال');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const labelStyle = { fontWeight: 'bold', color: '#003366', fontSize: '0.9rem' };

    return (
        <Container className="mt-4 mb-5">
            <Card className="shadow-lg p-4 border-0 rounded-4">
                <div className="text-center mb-4">
                    <h2 className="fw-bold text-primary">نموذج حجز قاعة جديدة</h2>
                </div>
                
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
                                
                                {/* إعادة إضافة حقل القسم المفقود */}
                                <Form.Group className="mb-2">
                                    <Form.Label style={labelStyle}>القسم</Form.Label>
                                    <Form.Select name="section" value={formData.section} onChange={handleChange}>
                                        {sections.map(s => <option key={s} value={s}>{s}</option>)}
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-2">
                                    <Form.Label style={labelStyle}>التاريخ (متاح لشهرين)</Form.Label>
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
                        {/* باقي الكود (النشاط والتواصل) يظل كما هو لضمان السرعة */}
                        <Col md={6}>
                            <Card className="p-3 border-0 bg-light shadow-sm">
                                <h6 className="text-danger fw-bold mb-3">📝 تفاصيل النشاط</h6>
                                <Form.Group className="mb-2">
                                    <Form.Label style={labelStyle}>اسم النشاط</Form.Label>
                                    <Form.Control type="text" name="activityName" value={formData.activityName} onChange={handleChange} required />
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
                    <Button variant="primary" size="lg" type="submit" className="w-100 mt-4 fw-bold" disabled={isSubmitting}>
                        {isSubmitting ? 'جاري معالجة الطلب...' : 'إرسال طلب الحجز'}
                    </Button>
                </Form>
                )}
            </Card>
        </Container>
    );
};

export default BookingPage;