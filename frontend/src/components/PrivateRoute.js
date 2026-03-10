// frontend/src/components/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ isAuthenticated, children, requiredRole, userRole }) => {
    
    // 1. إذا لم يكن مسجلاً للدخول، وجهه لصفحة الدخول
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // 2. إذا كان المسار يتطلب دوراً معيناً (مثل Admin) والمستخدم ليس لديه هذا الدور
    if (requiredRole && userRole !== requiredRole) {
        // يمكنك توجيهه لصفحة "غير مصرح" أو الصفحة الرئيسية
        return <Navigate to="/" replace />;
    }

    // 3. إذا اجتاز الشروط، اعرض المحتوى
    return children;
};

export default PrivateRoute;