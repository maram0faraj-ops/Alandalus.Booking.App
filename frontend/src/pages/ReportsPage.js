// frontend/src/pages/ReportsPage.js

import React, { useEffect, useState } from 'react';
import { Container, Card, Alert, Table, Form, Row, Col, Badge, Spinner } from 'react-bootstrap';
import axios from 'axios';
import moment from 'moment';
import '../custom.css'; 

const API_URL = process.env.REACT_APP_API_URL || 'https://alandalus-booking-app.vercel.app/api';

const ReportsPage = () => {
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterFacility, setFilterFacility] = useState('الكل');
    const [filterSection, setFilterSection] = useState('الكل');
    const [filterStage, setFilterStage] = useState('الكل');

    const facilities = ['الكل', 'المسرح', 'مصادر التعلم', 'قاعة بلنسية', 'الصالة الرياضية بنات', 'الصالة الرياضية بنين'];
    const sections = ['الكل', 'بنين', 'بنات'];
    const stages = ['الكل', 'رياض أطفال', 'طفولة مبكرة', 'ابتدائي', 'متوسط', 'ثانوي', 'إشراف تعليمي', 'إدارة عامة'];

    useEffect(() => {
        const fetchAllBookings = async () => {
            const token = localStorage.getItem('token');
            const role = localStorage.getItem('role');

            if (!token || role !== 'Admin') {
                setError('غير مصرح لك بالدخول. يجب تسجيل الدخول كمسؤول.');
                setLoading(false);
                return;
            }

            try {
                const res = await axios.get(`${API_URL}/reports/all-bookings`, { 
                    headers: { 'x-auth-token': token },
                });
                
                // التأكد من أن البيانات مصفوفة
                const data = Array.isArray(res.data) ? res.data : [];
                setBookings(data);
                setFilteredBookings(data);
                setLoading(false);

            } catch (err) {
                console.error("Fetch Error:", err);
                setError('حدث خطأ أثناء جلب البيانات من السيرفر.');
                setLoading(false);
            }
        };

        fetchAllBookings();
    }, []);

    useEffect(() => {
        let currentFiltered = bookings;
        if (filterFacility !== 'الكل') currentFiltered = currentFiltered.filter(b => b.facility === filterFacility);
        if (filterSection !== 'الكل') currentFiltered = currentFiltered.filter(b => b.section === filterSection);
        if (filterStage !== 'الكل') currentFiltered = currentFiltered.filter(b => b.stage === filterStage);
        setFilteredBookings(currentFiltered);
    }, [filterFacility, filterSection, filterStage, bookings]);

    const totalBookings = filteredBookings.length;
    const totalHours = filteredBookings.reduce((sum, b) => sum + (Number(b.duration) || 0), 0);

    if (error) return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;

    if (loading) return (
        <Container className="text-center mt-5">
            <Spinner animation="border" variant="primary" className="mb-2" />
            <p>جاري تحميل تقارير مدارس الأندلس...</p>
        </Container>
    );

    return (
        <Container className="mt-4 mb-5">
            <Card className="shadow-lg border-0 p-4 rounded-4">
                <h2 className="text-center mb-4 fw-bold" style={{ color: '#00157c' }}>📋 تقارير المسؤول الشاملة</h2>
                
                <Card className="mb-4 p-3 bg-light border-0 rounded-3">
                    <Row className="text-center">
                        <Col md={6}><h5>إجمالي الحجوزات: <Badge bg="primary">{totalBookings}</Badge></h5></Col>
                        <Col md={6}><h5>ساعات التشغيل: <Badge bg="info">{totalHours}</Badge></h5></Col>
                    </Row>
                </Card>

                <Form className="mb-4 p-3 border rounded-3 bg-white">
                    <Row>
                        <Col md={4} className="mb-2">
                            <Form.Label className="fw-bold">المرفق</Form.Label>
                            <Form.Select value={filterFacility} onChange={(e) => setFilterFacility(e.target.value)}>
                                {facilities.map(f => <option key={f} value={f}>{f}</option>)}
                            </Form.Select>
                        </Col>
                        <Col md={4} className="mb-2">
                            <Form.Label className="fw-bold">القسم</Form.Label>
                            <Form.Select value={filterSection} onChange={(e) => setFilterSection(e.target.value)}>
                                {sections.map(s => <option key={s} value={s}>{s}</option>)}
                            </Form.Select>
                        </Col>
                        <Col md={4} className="mb-2">
                            <Form.Label className="fw-bold">المرحلة</Form.Label>
                            <Form.Select value={filterStage} onChange={(e) => setFilterStage(e.target.value)}>
                                {stages.map(s => <option key={s} value={s}>{s}</option>)}
                            </Form.Select>
                        </Col>
                    </Row>
                </Form>

                <div className="table-responsive">
                    <Table hover className="align-middle text-center border shadow-sm">
                        <thead style={{ backgroundColor: '#00157c', color: 'white' }}>
                            <tr>
                                <th>#</th>
                                <th>النشاط</th>
                                <th>التاريخ</th>
                                <th>المرفق</th>
                                <th>المرحلة</th>
                                <th>طالب الحجز</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBookings.length > 0 ? (
                                filteredBookings.map((booking, index) => (
                                    <tr key={booking._id}>
                                        <td>{index + 1}</td>
                                        <td className="fw-bold">{booking.activityName}</td>
                                        <td>{moment(booking.date).format('YYYY-MM-DD HH:mm')}</td>
                                        <td><Badge bg="secondary">{booking.facility}</Badge></td>
                                        <td>{booking.stage}</td>
                                        <td>
                                            {/* ✅ الحماية هنا: استخدام ? لمنع انهيار الصفحة إذا كانت البيانات ناقصة */}
                                            <span className="text-primary fw-bold">
                                                {booking.bookedBy?.username || 'مستخدم غير معروف'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" className="py-4 text-muted">لا توجد سجلات مطابقة لهذه الفلترة.</td></tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            </Card>
        </Container>
    );
};

export default ReportsPage;