// frontend/src/pages/ReportsPage.js

import React, { useEffect, useState } from 'react';
import { Container, Card, Alert, Table, Form, Row, Col, Badge } from 'react-bootstrap';
import axios from 'axios';
import moment from 'moment';
import '../custom.css'; // استيراد التنسيقات

const API_URL = process.env.REACT_APP_API_URL;

const ReportsPage = () => {
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterFacility, setFilterFacility] = useState('الكل');
    const [filterSection, setFilterSection] = useState('الكل');
    const [filterStage, setFilterStage] = useState('الكل');

    // قائمة الخيارات يجب أن تكون مطابقة لما تم تحديده في BookingPage.js
    const facilities = ['الكل', 'المسرح', 'مصادر التعلم', 'قاعة بلنسية', 'الصالة الرياضية بنات', 'الصالة الرياضية بنين'];
    const sections = ['الكل', 'بنين', 'بنات'];
    const stages = ['الكل', 'رياض أطفال', 'طفولة مبكرة', 'ابتدائي', 'متوسط', 'ثانوي', 'إشراف تعليمي', 'إدارة عامة'];

    useEffect(() => {
        const fetchAllBookings = async () => {
            const token = localStorage.getItem('token');
            if (!token || localStorage.getItem('role') !== 'Admin') {
                setError('غير مصرح لك. يجب أن تكون مسؤولاً.');
                setLoading(false);
                return;
            }

            try {
                // استخدام مسار تقارير المسؤول المحمي
                const res = await axios.get(`${API_URL}/reports/all-bookings`, { 
                    headers: {
                        'x-auth-token': token,
                    },
                });
                
                setBookings(res.data);
                setFilteredBookings(res.data); // تعيين القائمة المصفاة في البداية
                setLoading(false);

            } catch (err) {
                console.error("Error fetching reports:", err.response);
                setError(err.response?.status === 401 ? 'انتهت جلسة الدخول أو غير مصرح لك.' : 'فشل في جلب التقارير من الخادم.');
                setLoading(false);
            }
        };

        fetchAllBookings();
    }, []);

    // دالة التصفية
    useEffect(() => {
        let currentFiltered = bookings;

        if (filterFacility !== 'الكل') {
            currentFiltered = currentFiltered.filter(b => b.facility === filterFacility);
        }
        if (filterSection !== 'الكل') {
            currentFiltered = currentFiltered.filter(b => b.section === filterSection);
        }
        if (filterStage !== 'الكل') {
            currentFiltered = currentFiltered.filter(b => b.stage === filterStage);
        }
        
        setFilteredBookings(currentFiltered);
    }, [filterFacility, filterSection, filterStage, bookings]);

    // حساب الملخصات الإحصائية
    const totalBookings = filteredBookings.length;
    const internalBookings = filteredBookings.filter(b => b.bookingType === 'داخلي').length;
    const externalBookings = totalBookings - internalBookings;
    
    // حساب إجمالي الساعات
    const totalHours = filteredBookings.reduce((sum, booking) => sum + booking.duration, 0);


    if (error) {
        return <Alert variant="danger" className="mt-5">{error}</Alert>;
    }

    if (loading) {
        return <div className="text-center mt-5">يتم تحميل تقارير الحجوزات...</div>;
    }

    return (
        <Container className="mt-5">
            <Card className="shadow-lg p-4">
                <h2 className="text-center mb-4">تقارير المسؤول - كافة الحجوزات</h2>
                
                {/* 1. ملخص سريع */}
                <Card className="mb-4 p-3 bg-light">
                    <Row className="text-center">
                        <Col><h5>إجمالي الحجوزات: <Badge bg="primary">{totalBookings}</Badge></h5></Col>
                        <Col><h5>ساعات الحجز الكلية: <Badge bg="info">{totalHours}</Badge></h5></Col>
                        <Col><h5>داخلي: <Badge bg="success">{internalBookings}</Badge></h5></Col>
                        <Col><h5>خارجي: <Badge bg="warning">{externalBookings}</Badge></h5></Col>
                    </Row>
                </Card>

                {/* 2. خيارات التصفية */}
                <Form className="mb-4">
                    <Row>
                        <Col md={4}>
                            <Form.Group controlId="filterFacility">
                                <Form.Label>تصفية حسب المرفق</Form.Label>
                                <Form.Select value={filterFacility} onChange={(e) => setFilterFacility(e.target.value)}>
                                    {facilities.map(f => <option key={f} value={f}>{f}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group controlId="filterSection">
                                <Form.Label>تصفية حسب القسم</Form.Label>
                                <Form.Select value={filterSection} onChange={(e) => setFilterSection(e.target.value)}>
                                    {sections.map(s => <option key={s} value={s}>{s}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                         <Col md={4}>
                            <Form.Group controlId="filterStage">
                                <Form.Label>تصفية حسب المرحلة</Form.Label>
                                <Form.Select value={filterStage} onChange={(e) => setFilterStage(e.target.value)}>
                                    {stages.map(s => <option key={s} value={s}>{s}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>
                </Form>

                {/* 3. جدول البيانات */}
                <div style={{ overflowX: 'auto' }}>
                    <Table striped bordered hover responsive size="sm">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>اسم النشاط</th>
                                <th>التاريخ والوقت</th>
                                <th>المدة (ساعة)</th>
                                <th>المرفق</th>
                                <th>القسم</th>
                                <th>المرحلة</th>
                                <th>النوع</th>
                                <th>طالب الحجز</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBookings.length > 0 ? (
                                filteredBookings.map((booking, index) => (
                                    <tr key={booking._id}>
                                        <td>{index + 1}</td>
                                        <td>{booking.activityName}</td>
                                        <td>{moment(booking.date).format('YYYY-MM-DD HH:mm')}</td>
                                        <td>{booking.duration}</td>
                                        <td>{booking.facility}</td>
                                        <td>{booking.section}</td>
                                        <td>{booking.stage}</td>
                                        <td>
                                            <Badge bg={booking.bookingType === 'داخلي' ? 'success' : 'warning'}>
                                                {booking.bookingType}
                                            </Badge>
                                        </td>
                                        <td>{booking.bookedBy.username} ({booking.bookedBy.role})</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className="text-center">لا توجد حجوزات مطابقة للمعايير المحددة.</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            </Card>
        </Container>
    );
};

export default ReportsPage;