// frontend/src/components/NavBar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import '../custom.css'; 

const NavBar = ({ isAuthenticated, role, handleLogout }) => {
    const navigate = useNavigate();

    // جلب بيانات المستخدم لعرض الاسم
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    const username = user ? user.username : '';

    const handleLogoutClick = () => {
        handleLogout();
        navigate('/login'); 
    };

    return (
        <Navbar expand="lg" dir="rtl" className="navbar-custom mb-4">
            <Container fluid className="px-4"> {/* تم جعل الحاوية مرنة لزيادة مساحة الإزاحة */}
                {/* 1. الجهة اليمنى: الشعار */}
                <Navbar.Brand as={Link} to="/" className="d-flex align-items-center ms-4">
                    <img src="/الشعار-أبيض.png" alt="Logo" style={{ height: '50px', marginLeft: '10px' }} />
                    <span className="fw-bold text-white">نظام حجز قاعات الأندلس</span>
                </Navbar.Brand>
                
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    {/* 2. الروابط المركزية */}
                    <Nav className="me-2">
                        {isAuthenticated && (
                            <>
                                <Nav.Link as={Link} to="/" className="fw-bold px-3 text-white">الرئيسية</Nav.Link>
                                <Nav.Link as={Link} to="/booking" className="fw-bold px-3 text-white">حجز جديد</Nav.Link>
                                <Nav.Link as={Link} to="/my-bookings" className="fw-bold px-3 text-white">حجوزاتي</Nav.Link>
                            </>
                        )}
                        {isAuthenticated && role === 'Admin' && (
                            <Nav.Link as={Link} to="/admin/reports" className="fw-bold px-3 text-white">تقارير المسؤول</Nav.Link>
                        )}
                    </Nav>

                    {/* 3. حاوية الاسم وزر الخروج مع إزاحة قصوى لليسار */}
                    <Nav className="ms-auto d-flex align-items-center">
                        {isAuthenticated ? (
                            <>
                                {/* عرض اسم المستخدم */}
                                <span className="text-white fw-bold d-flex align-items-center pe-3 border-end" style={{ fontSize: '0.95rem' }}>
                                    👤 {username}
                                </span>
                                
                                {/* ✅ تم استخدام ms-5 لضمان قفز الزر إلى أقصى اليسار بعيداً عن الاسم */}
                                <Button 
                                    variant="outline-light" 
                                    onClick={handleLogoutClick} 
                                    className="fw-bold rounded-pill ms-5 px-3" 
                                >
                                    تسجيل الخروج
                                </Button>
                            </>
                        ) : (
                            <Button variant="outline-light" as={Link} to="/login" className="fw-bold rounded-pill px-4">
                                تسجيل الدخول
                            </Button>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default NavBar;