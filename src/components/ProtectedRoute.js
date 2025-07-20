import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ adminOnly = false }) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    if (!userInfo) {
        // Not logged in
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && userInfo.role !== 'admin') {
        // Logged in but not an admin, trying to access admin route
        return <Navigate to="/dashboard" replace />;
    }
    
    // Logged in and has correct role, render the child route
    return <Outlet />;
};

export default ProtectedRoute;
