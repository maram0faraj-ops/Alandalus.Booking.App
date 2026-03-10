// frontend/src/pages/RegisterPage.js

import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import '../custom.css'; // استيراد التنسيقات المخصصة

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const RegisterPage = () => {
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: ''
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
            setError('كلمات المرور غير متطابقة.');
            return;
        }

        if (formData.password.length < 6) {
            setError('يجب أن تتكون كلمة المرور من 6 خانات على الأقل.');
            return;
        }

        setLoading(true);

        try {
            await axios.post(`${API_URL}/auth/register`, {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                phone: formData.phone
            });

            alert('تم إنشاء الحساب بنجاح! يرجى تسجيل الدخول.');
            navigate('/login');

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'حدث خطأ أثناء التسجيل. حاول مرة أخرى.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 0' }}>
            <Container style={{ maxWidth: '500px' }}>
                {/* الشعار أعلى البطاقة بنفس نمط صفحة الدخول */}
                <div className="text-center mb-4">
                    <div style={{ 
                        backgroundColor: 'var(--navy-blue)', 
                        display: 'inline-block', 
                        padding: '15px', 
                        borderRadius: '15px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}>
                        {/* تأكد من وجود الصورة في مجلد public */}
                        <img 
                            src="/الشعار-أبيض.png" 
                            alt="شعار المدرسة" 
                            style={{ height: '60px', width: 'auto' }} 
                        />
                    </div>
                </div>

                <Card className="shadow-lg border-0 p-4" style={{ borderRadius: '15px' }}>
                    <div className="text-center mb-4">
                        <h3 className="fw-bold text-primary">إنشاء حساب جديد</h3>
                    </div>
                    
                    {error && <Alert variant="danger" className="text-center py-2">{error}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="username">
                            <Form.Label className="fw-bold text-primary" style={{ fontSize: '0.9rem' }}>الاسم الكامل</Form.Label>
                            <Form.Control 
                                type="text" 
                                name="username" 
                                value={formData.username} 
                                onChange={handleChange} 
                                required 
                                placeholder="الاسم الثلاثي"
                                style={{ backgroundColor: '#f1f3f5', border: 'none', padding: '10px' }}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="email">
                            <Form.Label className="fw-bold text-primary" style={{ fontSize: '0.9rem' }}>البريد الإلكتروني</Form.Label>
                            <Form.Control 
                                type="email" 
                                name="email" 
                                value={formData.email} 
                                onChange={handleChange} 
                                required 
                                placeholder="name@example.com"
                                style={{ backgroundColor: '#f1f3f5', border: 'none', padding: '10px' }}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="phone">
                            <Form.Label className="fw-bold text-primary" style={{ fontSize: '0.9rem' }}>رقم الجوال (للإشعارات)</Form.Label>
                            <Form.Control 
                                type="tel" 
                                name="phone" 
                                value={formData.phone} 
                                onChange={handleChange} 
                                placeholder="+9665xxxxxxxx"
                                style={{ backgroundColor: '#f1f3f5', border: 'none', padding: '10px' }}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="password">
                            <Form.Label className="fw-bold text-primary" style={{ fontSize: '0.9rem' }}>كلمة المرور</Form.Label>
                            <Form.Control 
                                type="password" 
                                name="password" 
                                value={formData.password} 
                                onChange={handleChange} 
                                required 
                                minLength="6"
                                style={{ backgroundColor: '#f1f3f5', border: 'none', padding: '10px' }}
                            />
                        </Form.Group>

                        <Form.Group className="mb-4" controlId="confirmPassword">
                            <Form.Label className="fw-bold text-primary" style={{ fontSize: '0.9rem' }}>تأكيد كلمة المرور</Form.Label>
                            <Form.Control 
                                type="password" 
                                name="confirmPassword" 
                                value={formData.confirmPassword} 
                                onChange={handleChange} 
                                required 
                                style={{ backgroundColor: '#f1f3f5', border: 'none', padding: '10px' }}
                            />
                        </Form.Group>

                        <div className="d-grid gap-2">
                            <Button 
                                variant="primary" 
                                size="lg" 
                                type="submit" 
                                disabled={loading} 
                                className="fw-bold"
                                style={{ padding: '10px', backgroundColor: 'var(--navy-blue)', border: 'none' }}
                            >
                                {loading ? 'جاري التسجيل...' : 'تسجيل حساب'}
                            </Button>
                        </div>

                        <div className="text-center mt-4">
                            <span className="text-muted" style={{ fontSize: '0.9rem' }}>لديك حساب بالفعل؟ </span>
                            <Link to="/login" className="text-pink fw-bold" style={{ textDecoration: 'none', fontSize: '0.9rem' }}>
                                تسجيل الدخول
                            </Link>
                        </div>
                    </Form>
                </Card>
            </Container>
        </div>
    );
};

export default RegisterPage;