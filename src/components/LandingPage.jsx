import React, { useState } from 'react';
import './LandingPage.css';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock } from 'react-icons/fa';

const LandingPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loginError, setLoginError] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        if (username === 'admin' && password === 'admin123') {
            alert('Login successful!');
            navigate('/admin-dashboard');
        } else {
            setLoginError('Invalid credentials, please try again.');
        }
    };

    return (
        <div className="landing-page">
            <div className="glass-card">
                <div className="logo-corner">
                    <img src="/logo.png" alt="Logo 1" className="corner-logo" />
                </div>
                <div className="login-left">
                    <div className="welcome-message">
                        <h1>Welcome to</h1>
                        <h2>TimeTable Management System</h2>
                    </div>
                </div>

                <div className="login-right">
                    <h2 className="login-title">Secure Login</h2>
                    <form className="login-form" onSubmit={handleLogin}>
                        <div className="input-group">
                            <FaEnvelope className="icon" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                            <label className={username && 'filled'}>Login ID</label>
                        </div>

                        <div className="input-group">
                            <FaLock className="icon" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <label className={password && 'filled'}>Password</label>
                        </div>

                        <div className="checkbox-row">
                            <input
                                type="checkbox"
                                id="showPassword"
                                checked={showPassword}
                                onChange={() => setShowPassword(!showPassword)}
                            />
                            <label htmlFor="showPassword">Show Password</label>
                        </div>

                        {loginError && <p className="error-message">{loginError}</p>}

                        <button type="submit" className="login-btn">LOGIN</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
