import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-brand">WA-Bot</Link>
            <div className="nav-links">
                {userInfo ? (
                    <>
                        <Link to="/dashboard">Dashboard</Link>
                        {userInfo.role === 'admin' && <Link to="/admin">Admin</Link>}
                        <a href="#!" onClick={handleLogout}>Logout</a>
                    </>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/signup">Sign Up</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
