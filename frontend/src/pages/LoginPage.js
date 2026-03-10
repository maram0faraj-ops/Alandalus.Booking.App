// frontend/src/pages/LoginPage.js

import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import '../custom.css'; 

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const LoginPage = ({ handleLogin }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await axios.post(`${API_URL}/auth/login`, formData);
            
            if (handleLogin) {
                handleLogin(res.data.token, res.data.user.role, res.data.user);
            }

            navigate('/'); 
            
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* ✅ تم زيادة العرض هنا إلى 600px لجعل النافذة أكبر */}
            <Container style={{ maxWidth: '600px' }}>
                
                {/* الشعار أعلى البطاقة */}
                <div className="text-center mb-4">
                    <div style={{ 
                        backgroundColor: 'var(--navy-blue)', 
                        display: 'inline-block', 
                        padding: '20px', // زيادة الحشوة
                        borderRadius: '20px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}>
                        {/* ✅ تم تكبير الشعار إلى 120px */}
                        <img 
                            src="/الشعار-أبيض.png" 
                            alt="شعار المدرسة" 
                            style={{ height: '120px', width: 'auto' }} 
                        />
                    </div>
                </div>

                <Card className="shadow-lg border-0 p-5" style={{ borderRadius: '20px' }}>
                    <div className="text-center mb-5">
                        <h2 className="fw-bold text-primary" style={{ fontSize: '2rem' }}>تسجيل الدخول</h2>
                    </div>
                    
                    {error && <Alert variant="danger" className="text-center py-2">{error}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-4" controlId="email">
                            <Form.Label className="fw-bold text-primary" style={{ fontSize: '1rem' }}>البريد الإلكتروني</Form.Label>
                            <Form.Control 
                                type="email" 
                                name="email" 
                                value={formData.email} 
                                onChange={handleChange} 
                                required 
                                style={{ backgroundColor: '#f1f3f5', border: 'none', padding: '15px', fontSize: '1rem' }}
                            />
                        </Form.Group>

                        <Form.Group className="mb-5" controlId="password">
                            <Form.Label className="fw-bold text-primary" style={{ fontSize: '1rem' }}>كلمة المرور</Form.Label>
                            <Form.Control 
                                type="password" 
                                name="password" 
                                value={formData.password} 
                                onChange={handleChange} 
                                required 
                                style={{ backgroundColor: '#f1f3f5', border: 'none', padding: '15px', fontSize: '1rem' }}
                            />
                        </Form.Group>

                        <div className="d-grid gap-2">
                            <Button 
                                variant="primary" 
                                size="lg" 
                                type="submit" 
                                disabled={loading} 
                                className="fw-bold"
                                style={{ padding: '15px', backgroundColor: 'var(--navy-blue)', border: 'none', fontSize: '1.2rem' }}
                            >
                                {loading ? 'جاري التحقق...' : 'دخول'}
                            </Button>
                        </div>

                        <div className="text-center mt-4">
                            <span className="text-muted" style={{ fontSize: '1rem' }}>ليس لديك حساب؟ </span>
                            <Link to="/register" className="text-pink fw-bold" style={{ textDecoration: 'none', fontSize: '1rem' }}>
                                إنشاء حساب جديد
                            </Link>
                        </div>
                    </Form>
                </Card>
            </Container>
        </div>
    );
};

export default LoginPage;