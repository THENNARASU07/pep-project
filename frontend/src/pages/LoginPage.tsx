import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormInput from '../components/FormInput';
import './LoginPage.css';

const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log('Login attempt with', formData);
        
        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            
            const data = await response.json();
            
            if (response.ok) {
                localStorage.setItem('user', JSON.stringify(data));
                if (data.role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/student');
                }
            } else {
                alert(data.message || 'Invalid credentials');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Failed to connect to backend server');
        }
    };

    return (
        <div className="login-container">
            {/* Background with skewed splits */}
            <div className="split-bg white-panel"></div>
            <div className="split-bg mustard-panel"></div>

            {/* Content Overlay */}
            <div className="content-wrapper">
                <div className="left-content animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <div className="form-wrapper">
                        <h1 className="logo-text">DevBeeZ<span className="dot">.</span></h1>
                        <div className="form-header">
                            <h2>Welcome Back</h2>
                            <p>Log in to access your mock interview dashboard.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="login-form">
                            <FormInput
                                label="Email Address"
                                name="email"
                                type="email"
                                placeholder="rollno@gmail.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                            <FormInput
                                label="Password"
                                name="password"
                                type="password"
                                placeholder="reg no"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />

                            <div className="form-actions">
                                <a href="#" className="forgot-link">Forgot password?</a>
                            </div>

                            <button type="submit" className="btn-primary">
                                Log In To Dashboard
                            </button>
                        </form>

                        <p className="signup-prompt">
                            Don't have an account? <a href="#">Create one</a>
                        </p>
                    </div>
                </div>

                <div className="right-content animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    <div className="branding-glass">
                        <div className="bee-icon">
                            {/* Abstract Technical Bee Representation */}
                            <svg width="120" height="120" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M50 15L85 35V65L50 85L15 65V35L50 15Z" stroke="#121212" strokeWidth="6" strokeLinejoin="round" />
                                <path d="M25 40L50 55L75 40" stroke="#121212" strokeWidth="6" strokeLinejoin="round" />
                                <path d="M50 55V85" stroke="#121212" strokeWidth="6" strokeLinejoin="round" />
                                <circle cx="50" cy="50" r="10" fill="#121212" />
                                <path d="M50 25C40 10 20 10 15 25C10 40 30 50 50 50C70 50 90 40 85 25C80 10 60 10 50 25Z" fill="#121212" fillOpacity="0.2" />
                            </svg>
                        </div>
                        <h2 className="branding-title">Master Your Interviews</h2>
                        <p className="branding-subtitle">
                            Join the hive. Prepare with AI-driven mock interviews configured for top tech companies.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
