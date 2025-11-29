// frontend/src/pages/HomePage.js

import React, { useEffect, useState } from 'react';
import { Container, Card, Alert } from 'react-bootstrap';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import moment from 'moment'; // لتبسيط التعامل مع التواريخ والمدد

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const HomePage = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const isAuthenticated = !!localStorage.getItem('token');

    // دالة جلب الحجوزات من الـ API
    useEffect(() => {
        const fetchBookings = async () => {
            const token = localStorage.getItem('token');
            
            // إذا لم يكن المستخدم مسجل الدخول، نتوقف ونعرض شاشة التقويم فارغة مع رسالة
            if (!token) {
                setLoading(false);
                return; 
            }

            try {
                const res = await axios.get(`${API_URL}/bookings`, {
                    headers: {
                        'x-auth-token': token,
                    },
                });

                // تحويل بيانات الحجز إلى تنسيق FullCalendar
                const calendarEvents = res.data.map(booking => {
                    
                    const startDate = moment(booking.date);
                    // حساب نهاية الحدث بناءً على مدة الحجز بالساعات
                    const endDate = moment(booking.date).add(booking.duration, 'hours');
                    
                    return {
                        id: booking._id,
                        // عرض اسم الفعالية واسم القاعة
                        title: `${booking.activityName} (${booking.facility})`, 
                        start: startDate.toDate(),
                        end: endDate.toDate(),
                        // اختيار لون مختلف حسب نوع الحجز (إذا أردت التمييز)
                        backgroundColor: booking.bookingType === 'داخلي' ? '#007bff' : '#28a745',
                        borderColor: '#007bff',
                        extendedProps: {
                            facility: booking.facility,
                            user: booking.bookedBy?.username || 'N/A',
                            role: booking.bookedBy?.role || 'N/A',
                        }
                    };
                });
                
                setEvents(calendarEvents);
                setLoading(false);

            } catch (err) {
                console.error("Error fetching bookings:", err.response || err);
                // إظهار خطأ المصادقة إذا كان الرمز غير صالح (401)
                setError(err.response?.status === 401 ? 'انتهت جلسة الدخول. يرجى تسجيل الدخول مرة أخرى.' : 'فشل في جلب الحجوزات من الخادم.');
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    // خيارات تهيئة التقويم
    const calendarOptions = {
        // التأكد من أن هذه المصفوفة تحتوي على الدوال المستوردة فقط
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin], 
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        locale: 'ar', 
        dir: 'rtl',   
        events: events,
        height: 'auto',
        // تعطيل التفاعل إذا كنا نعرض فقط
        editable: false, 
        selectable: false,
        // عند النقر على حدث (اختياري)
        eventClick: (info) => {
            alert(`تفاصيل الحجز:\nالفعالية: ${info.event.title}\nالقاعة: ${info.event.extendedProps.facility}\nالمستخدم: ${info.event.extendedProps.user}`);
        }
    };

    return (
        <Container className="mt-5 mb-5">
            <Card className="p-4 shadow-lg">
                <h2 className="text-center mb-4 text-primary">تقويم الحجوزات المتاح</h2>
                
                {/* رسالة للمستخدم غير المسجل */}
                {!isAuthenticated && (
                    <Alert variant="info" className="text-center">
                        يرجى **تسجيل الدخول** لعرض جميع الحجوزات وإجراء حجز جديد.
                    </Alert>
                )}
                
                {/* رسالة الخطأ */}
                {error && <Alert variant="danger">{error}</Alert>}
                
                {/* رسالة التحميل (تظهر فقط للمسجلين) */}
                {loading && isAuthenticated && <div className="text-center text-muted">يتم تحميل التقويم...</div>}

                {/* عرض التقويم بعد التأكد من عدم وجود خطأ حاد */}
                {(!loading || !isAuthenticated) && (
                     <FullCalendar
                        {...calendarOptions}
                     />
                )}
            </Card>
        </Container>
    );
};

export default HomePage;