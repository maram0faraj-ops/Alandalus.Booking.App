// frontend/src/App.js

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import NavBar from './components/NavBar';
import PrivateRoute from './components/PrivateRoute';
import './custom.css';

// استيراد الصفحات
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import BookingPage from './pages/BookingPage'; 
import ReportsPage from './pages/ReportsPage';
import MyBookingsPage from './pages/MyBookingsPage'; 
import RegisterPage from './pages/RegisterPage'; 

// مكون Layout للتحكم في ظهور الشريط العلوي
const Layout = ({ children, isAuthenticated, role, handleLogout }) => {
    const location = useLocation();
    // قائمة المسارات التي لا نريد إظهار الشريط العلوي فيها
    const hideNavBarRoutes = ['/login', '/register'];
    const showNavBar = !hideNavBarRoutes.includes(location.pathname);

    return (
        <>
            {showNavBar && (
                <NavBar 
                    isAuthenticated={isAuthenticated} 
                    role={role} 
                    handleLogout={handleLogout} 
                />
            )}
            <div className={showNavBar ? "container mt-3" : ""}>
                {children}
            </div>
        </>
    );
};

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [role, setRole] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('role');
        
        if (token) {
            setIsAuthenticated(true);
            setRole(userRole);
        }
        setIsLoading(false); 
    }, []);

    const handleLogin = (token, role) => {
        localStorage.setItem('token', token);
        if (role) localStorage.setItem('role', role);
        setIsAuthenticated(true);
        setRole(role);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setIsAuthenticated(false);
        setRole(null);
    };

    if (isLoading) return null; 

    return (
        <Router>
            <Layout isAuthenticated={isAuthenticated} role={role} handleLogout={handleLogout}>
                <Routes>
                    <Route 
                        path="/" 
                        element={isAuthenticated ? <HomePage /> : <Navigate to="/login" replace />} 
                    />
                    
                    <Route path="/login" element={<LoginPage handleLogin={handleLogin} />} />
                    <Route path="/register" element={<RegisterPage />} />
                    
                    <Route 
                        path="/booking" 
                        element={
                            <PrivateRoute isAuthenticated={isAuthenticated}>
                                <BookingPage /> 
                            </PrivateRoute>
                        } 
                    />
                    
                    <Route 
                        path="/my-bookings" 
                        element={
                            <PrivateRoute isAuthenticated={isAuthenticated}>
                                <MyBookingsPage /> 
                            </PrivateRoute>
                        } 
                    />
                    
                    <Route 
                        path="/admin/reports" 
                        element={
                            <PrivateRoute isAuthenticated={isAuthenticated} requiredRole="Admin" userRole={role}>
                                <ReportsPage />
                            </PrivateRoute>
                        } 
                    />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;