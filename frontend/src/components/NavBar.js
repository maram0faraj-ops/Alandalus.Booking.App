// frontend/src/components/NavBar.js

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import '../custom.css'; // استيراد ملف التنسيق المخصص

const NavBar = ({ isAuthenticated, role, handleLogout }) => {
    const navigate = useNavigate();

    const handleLogoutClick = () => {
        handleLogout();
        navigate('/login'); 
    };

    return (
        <Navbar expand="lg" dir="rtl" className="navbar-custom mb-4">
            <Container>
                {/* الشعار والنص في أقصى اليمين */}
                <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
                    <img 
                        src="/الشعار-أبيض.png" 
                        alt="شعار المدرسة" 
                        className="d-inline-block align-top"
                        style={{ height: '50px', marginLeft: '10px' }} // تعديل المسافة
                    />
                    {/* إضافة fw-bold لجعله عريضاً */}
                    <span className="fw-bold" style={{ fontSize: '1.2rem' }}>نظام حجز قاعات الأندلس</span>
                </Navbar.Brand>
                
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    
                    {/* الروابط */}
                    <Nav className="me-auto" style={{ textAlign: 'right' }}>
                        {isAuthenticated && (
                            <>
                                <Nav.Link as={Link} to="/" className="fw-bold px-3">الرئيسية</Nav.Link>
                                <Nav.Link as={Link} to="/booking" className="fw-bold px-3">حجز جديد</Nav.Link>
                                <Nav.Link as={Link} to="/my-bookings" className="fw-bold px-3">حجوزاتي</Nav.Link>
                            </>
                        )}
                        
                        {isAuthenticated && role === 'Admin' && (
                            <Nav.Link as={Link} to="/admin/reports" className="fw-bold px-3">تقارير المسؤول</Nav.Link>
                        )}
                    </Nav>

                    {/* الأزرار */}
                    <Nav>
                        {isAuthenticated ? (
                            <Button variant="outline-light" onClick={handleLogoutClick} className="fw-bold">
                                تسجيل الخروج
                            </Button>
                        ) : (
                            <Button variant="outline-light" as={Link} to="/login" className="fw-bold">
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