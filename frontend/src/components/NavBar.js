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
        <Navbar expand="lg" dir="rtl" className="navbar-custom mb-4 py-3 shadow-sm">
            <Container fluid className="px-lg-5">
                {/* 1. شعار المدرسة في أقصى اليمين */}
                <Navbar.Brand as={Link} to="/" className="d-flex align-items-center me-0">
                    <img 
                        src="/الشعار-أبيض.png" 
                        alt="شعار المدرسة" 
                        style={{ height: '50px', marginLeft: '10px' }} 
                    />
                    <span className="fw-bold text-white d-none d-sm-inline">نظام حجز قاعات الأندلس</span>
                </Navbar.Brand>
                
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                
                <Navbar.Collapse id="basic-navbar-nav" className="justify-content-between">
                    {/* 2. الروابط المركزية */}
                    <Nav className="mx-auto fw-bold">
                        {isAuthenticated && (
                            <>
                                <Nav.Link as={Link} to="/" className="text-white px-3">الرئيسية</Nav.Link>
                                <Nav.Link as={Link} to="/booking" className="text-white px-3">حجز جديد</Nav.Link>
                                <Nav.Link as={Link} to="/my-bookings" className="text-white px-3">حجوزاتي</Nav.Link>
                            </>
                        )}
                        {isAuthenticated && role === 'Admin' && (
                            <Nav.Link as={Link} to="/admin/reports" className="text-white px-3">تقارير المسؤول</Nav.Link>
                        )}
                    </Nav>

                    {/* 3. حاوية التحكم في أقصى اليسار */}
                    <Nav className="d-flex align-items-center ms-0">
                        {isAuthenticated ? (
                            <div className="d-flex align-items-center">
                                {/* زر تسجيل الخروج في الطرف الأيسر تماماً */}
                                <Button 
                                    variant="outline-light" 
                                    onClick={handleLogoutClick} 
                                    className="fw-bold rounded-pill px-4 shadow-sm order-1" 
                                >
                                    تسجيل الخروج
                                </Button>

                                {/* اسم المستخدم يظهر بجانب الزر من الداخل */}
                                <span className="text-white fw-bold me-4 border-end pe-3 order-2" style={{ fontSize: '0.95rem' }}>
                                    👤 {username}
                                </span>
                            </div>
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