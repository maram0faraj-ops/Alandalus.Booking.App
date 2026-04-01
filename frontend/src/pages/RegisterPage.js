// frontend/src/pages/RegisterPage.js
import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            // إرسال البيانات للمسار الصحيح المفعول في server.js
            await axios.post(`${API_URL}/auth/register`, formData);
            alert('تم التسجيل بنجاح!');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'فشل التسجيل، تأكد من الاتصال بالسيرفر');
        } finally { setLoading(false); }
    };

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
            <Card className="p-4 shadow-lg border-0 rounded-4" style={{ maxWidth: '400px', width: '100%' }}>
                <h3 className="text-center fw-bold mb-4">إنشاء حساب جديد</h3>
                {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Form.Control className="mb-2" placeholder="الاسم" onChange={e => setFormData({...formData, name: e.target.value})} required />
                    <Form.Control className="mb-2" type="email" placeholder="البريد" onChange={e => setFormData({...formData, email: e.target.value})} required />
                    <Form.Control className="mb-2" type="tel" placeholder="الجوال" onChange={e => setFormData({...formData, phone: e.target.value})} required />
                    <Form.Control className="mb-3" type="password" placeholder="كلمة المرور" onChange={e => setFormData({...formData, password: e.target.value})} required />
                    <Button variant="primary" type="submit" className="w-100 fw-bold" disabled={loading}>
                        {loading ? 'جاري التسجيل...' : 'تسجيل حساب'}
                    </Button>
                </Form>
            </Card>
        </Container>
    );
};
export default RegisterPage;