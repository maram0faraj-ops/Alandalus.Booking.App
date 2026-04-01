// frontend/src/pages/RegisterPage.js

import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '' // التأكد من مسمى الحقل ليتوافق مع السيرفر
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (formData.password !== formData.confirmPassword) {
            return setError('كلمات المرور غير متطابقة');
        }

        setLoading(true);
        try {
            // إرسال البيانات للمسار الصحيح المفعول في server.js
            await axios.post(`${API_URL}/auth/register`, {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phone: formData.phone
            });
            
            alert('تم إنشاء الحساب بنجاح، يمكنك تسجيل الدخول الآن');
            navigate('/login');
        } catch (err) {
            // عرض رسالة الخطأ القادمة من السيرفر بدقة
            setError(err.response?.data?.message || 'حدث خطأ أثناء التسجيل. حاول مرة أخرى');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
            <Card className="shadow-lg p-4 rounded-4" style={{ width: '100%', maxWidth: '450px' }}>
                <div className="text-center mb-4">
                    <img src="/logo1984.png" alt="Logo" style={{ width: '80px' }} />
                    <h2 className="fw-bold text-primary mt-3">إنشاء حساب جديد</h2>
                </div>

                {error && <Alert variant="danger" className="text-center py-2 small">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold">الاسم الكامل</Form.Label>
                        <Form.Control name="name" type="text" onChange={handleChange} required />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold">البريد الإلكتروني</Form.Label>
                        <Form.Control name="email" type="email" onChange={handleChange} required />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold">رقم الجوال</Form.Label>
                        <Form.Control name="phone" type="tel" onChange={handleChange} required placeholder="05xxxxxxxx" />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold">كلمة المرور</Form.Label>
                        <Form.Control name="password" type="password" onChange={handleChange} required />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold">تأكيد كلمة المرور</Form.Label>
                        <Form.Control name="confirmPassword" type="password" onChange={handleChange} required />
                    </Form.Group>

                    <Button variant="primary" type="submit" className="w-100 fw-bold py-2" disabled={loading}>
                        {loading ? '...جاري التسجيل' : 'تسجيل حساب'}
                    </Button>
                </Form>

                <div className="text-center mt-3 small">
                    لديك حساب بالفعل؟ <Link to="/login" className="text-danger fw-bold">تسجيل الدخول</Link>
                </div>
            </Card>
        </Container>
    );
};

export default RegisterPage;