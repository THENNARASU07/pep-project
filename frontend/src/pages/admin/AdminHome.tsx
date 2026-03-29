import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminHome = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ students: 0, tests: 0, results: { total: 0, pending: 0, completed: 0 } });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [studentsRes, testsRes, resultsRes] = await Promise.all([
                    fetch('http://localhost:5000/api/students/count'),
                    fetch('http://localhost:5000/api/tests/count'),
                    fetch('http://localhost:5000/api/results/count'),
                ]);
                const students = await studentsRes.json();
                const tests = await testsRes.json();
                const results = await resultsRes.json();
                setStats({
                    students: students.total || 0,
                    tests: tests.total || 0,
                    results: results || { total: 0, pending: 0, completed: 0 },
                });
            } catch (err) {
                console.error('Failed to fetch stats:', err);
            }
        };
        fetchStats();
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const quickCards = [
        {
            label: 'CREATE TEST',
            value: stats.tests,
            sub: 'tests created',
            path: '/admin/create-test',
        },
        {
            label: 'PERFORMANCE',
            value: stats.results.completed,
            valueClass: 'green',
            sub: 'completed',
            path: '/admin/performance',
        },
        {
            label: 'MANAGE STUDENTS',
            value: stats.students,
            sub: 'students enrolled',
            path: '/admin/manage-students',
        },
    ];

    return (
        <div>
            {/* Greeting */}
            <div className="admin-page-header">
                <h1 className="admin-greeting">{getGreeting()}, Admin.</h1>
                <p className="admin-greeting-sub">Here is your platform overview for today.</p>
            </div>

            {/* Profile Card */}
            <div className="admin-card admin-profile-card">
                <div className="admin-profile-left">
                    <div className="admin-profile-avatar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                        <div className="admin-profile-badge">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                    </div>
                    <div>
                        <div className="admin-profile-name">Admin (Platform Manager)</div>
                        <div className="admin-profile-detail">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                            admin@gmail.com
                        </div>
                        <div className="admin-profile-detail">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                            Mock Test Platform Administrator
                        </div>
                    </div>
                </div>
                <div className="admin-profile-right">
                    <div className="admin-profile-status">
                        <div className="admin-profile-status-title">Platform Status</div>
                        <div className="admin-profile-status-sub">All systems operational</div>
                    </div>
                </div>
            </div>

            {/* Quick Access */}
            <h3 className="admin-section-title">Quick Access</h3>
            <div className="admin-quick-grid">
                {quickCards.map((card) => (
                    <div
                        key={card.label}
                        className="admin-card admin-card-clickable admin-quick-card"
                        onClick={() => navigate(card.path)}
                    >
                        <div className="admin-quick-card-label">{card.label}</div>
                        <div className={`admin-quick-card-value ${card.valueClass || ''}`}>
                            {card.value}
                        </div>
                        <div style={{ fontSize: '13px', color: '#94A3B8' }}>{card.sub}</div>
                        <div className="admin-quick-card-footer">
                            <div className="admin-quick-card-arrow">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminHome;
