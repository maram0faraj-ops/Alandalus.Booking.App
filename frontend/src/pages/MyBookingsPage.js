// frontend/src/pages/MyBookingsPage.js

import React, { useEffect, useState } from 'react';
import { Container, Card, Alert, Table, Button } from 'react-bootstrap';
import axios from 'axios';
import moment from 'moment';
import '../custom.css'; // استيراد التنسيقات
const API_URL = process.env.REACT_APP_API_URL;

const MyBookingsPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    // دالة جلب حجوزات المستخدم الحالي
    const fetchMyBookings = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('الرجاء تسجيل الدخول أولاً.');
            setLoading(false);
            return;
        }

        try {
            // المسار: /api/bookings/my-bookings
            const res = await axios.get(`${API_URL}/bookings/my-bookings`, { 
                headers: {
                    'x-auth-token': token,
                },
            });
            
            setBookings(res.data);
            setLoading(false);
            setError(null);

        } catch (err) {
            console.error("Error fetching my bookings:", err.response);
            setError(err.response?.data?.message || 'فشل في جلب حجوزاتك من الخادم (تأكد من صلاحية الرمز).');
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchMyBookings();
    }, []);

    // دالة إلغاء (حذف) الحجز
    const handleCancel = async (bookingId) => {
        // [⚠️ ملاحظة: في بيئات المتصفح، يجب استخدام نموذج مخصص بدلاً من window.confirm]
        if (!window.confirm('هل أنت متأكد من رغبتك في إلغاء هذا الحجز؟')) {
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            // المسار: DELETE /api/bookings/:id
            await axios.delete(`${API_URL}/bookings/${bookingId}`, {
                headers: {
                    'x-auth-token': token,
                },
            });
            
            setMessage('تم إلغاء الحجز بنجاح!');
            // تحديث القائمة بعد الإلغاء
            fetchMyBookings();

        } catch (err) {
            console.error("Cancellation error:", err.response);
            setError(err.response?.data?.message || 'فشل إلغاء الحجز. تأكد من أن الوقت لم يفت على الإلغاء.');
        }
    };
    
    // دالة للتحقق مما إذا كان يمكن الإلغاء (الحجز في المستقبل)
    const canCancel = (date) => {
        // يمكن الإلغاء حتى قبل ساعة واحدة من موعد الحجز
        return moment(date).subtract(1, 'hours').isAfter(moment());
    };

    if (error) {
        return <Alert variant="danger" className="mt-5">{error}</Alert>;
    }

    if (loading) {
        return <div className="text-center mt-5">يتم تحميل حجوزاتك...</div>;
    }

    return (
        <Container className="mt-5">
            <Card className="shadow-lg p-4">
                <h2 className="text-center mb-4">حجوزاتي الحالية</h2>
                
                {message && <Alert variant="success">{message}</Alert>}
                
                {bookings.length === 0 ? (
                    <Alert variant="info" className="text-center">
                        لم تقم بإنشاء أي حجوزات بعد. ابدأ الآن من صفحة "حجز جديد".
                    </Alert>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <Table striped bordered hover responsive size="sm">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>المرفق</th>
                                    <th>اسم النشاط</th>
                                    <th>التاريخ والوقت</th>
                                    <th>المدة (ساعة)</th>
                                    <th>القسم</th>
                                    <th>المرحلة</th> 
                                    <th>إجراء</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map((booking, index) => (
                                    <tr key={booking._id}>
                                        <td>{index + 1}</td>
                                        <td>{booking.facility}</td>
                                        <td>{booking.activityName}</td>
                                        <td>{moment(booking.date).format('YYYY-MM-DD HH:mm')}</td>
                                        <td>{booking.duration}</td>
                                        <td>{booking.section}</td>
                                        <td>{booking.stage}</td> 
                                        <td>
                                            {canCancel(booking.date) ? (
                                                <Button 
                                                    variant="danger" 
                                                    size="sm" 
                                                    onClick={() => handleCancel(booking._id)}
                                                >
                                                    إلغاء الحجز
                                                </Button>
                                            ) : (
                                                <Button variant="secondary" size="sm" disabled>
                                                    انتهى الوقت
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                )}
            </Card>
        </Container>
    );
};

export default MyBookingsPage;