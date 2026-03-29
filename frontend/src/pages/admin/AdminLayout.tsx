import React from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import './admin.css';

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        navigate('/login');
    };

    const navItems = [
        { path: '/admin', label: 'Home', exact: true },
        { path: '/admin/create-test', label: 'Create Test' },
        { path: '/admin/performance', label: 'Performance' },
        { path: '/admin/onboard', label: 'Onboard Student' },
        { path: '/admin/manage-students', label: 'Manage Students' },
    ];

    return (
        <div className="admin-layout">
            <nav className="admin-nav">
                <div className="admin-nav-left">
                    <div className="admin-nav-brand" onClick={() => navigate('/admin')} style={{ cursor: 'pointer' }}>
                        <div>
                            <div className="admin-nav-brand-name">DevBeeZ</div>
                            <div className="admin-nav-brand-tag">Admin Panel</div>
                        </div>
                    </div>
                    <div className="admin-nav-links">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.exact}
                                className={({ isActive }) =>
                                    `admin-nav-link ${isActive ? 'active' : ''}`
                                }
                            >
                                {item.label}
                            </NavLink>
                        ))}
                    </div>
                </div>
                <div className="admin-nav-right">
                    <div className="admin-nav-user">
                        <div className="admin-nav-user-info">
                            <div className="admin-nav-user-name">Admin</div>
                            <div className="admin-nav-user-email">admin@gmail.com</div>
                        </div>
                    </div>
                    <button className="admin-nav-logout" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </nav>
            <div className="admin-content">
                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout;
