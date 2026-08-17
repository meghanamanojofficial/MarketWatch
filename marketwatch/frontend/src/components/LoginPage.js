import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const LoginPage = () => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    
    // Status messages for the UI
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const { loginUser } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (isRegistering) {
            // --- REGISTRATION LOGIC ---
            try {
                const response = await fetch('https://marketwatch-backend.onrender.com/api/accounts/register/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (response.ok) {
                    setMessage('Account created successfully! You can now log in.');
                    setIsRegistering(false); // Flip back to Login mode
                    setPassword(''); // Clear the password field for security
                } else {
                    // Display backend validation errors
                    setError(data.error || data.detail || Object.values(data)[0] || 'Registration failed.');
                }
            } catch (err) {
                setError('Network error. Please make sure the Django server is running.');
            }
        } else {
            // --- LOGIN LOGIC ---
            try {
                const response = await fetch('https://marketwatch-backend.onrender.com/api/accounts/register/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (response.ok) {
                    // Pass the JWT tokens to your AuthContext to save them in localStorage
                    loginUser(data); 
                    
                    // Redirect the user to the dashboard
                    window.location.href = '/'; 
                } else {
                    setError('Invalid username or password.');
                }
            } catch (err) {
                setError('Network error. Please make sure the Django server is running.');
            }
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>
            <div style={{ 
                border: '1px solid #ccc', 
                padding: '40px', 
                borderRadius: '8px', 
                width: '100%', 
                maxWidth: '400px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }}>
                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
                    {isRegistering ? 'Create an Account' : 'Welcome Back'}
                </h2>

                {/* Status Messages */}
                {message && <p style={{ color: 'green', textAlign: 'center' }}>{message}</p>}
                {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input 
                        type="text" 
                        name="username"
                        placeholder="Username" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        style={{ padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                    <input 
                        type="password" 
                        name="password"
                        placeholder="Password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                    
                    <button 
                        type="submit" 
                        style={{ 
                            padding: '12px', 
                            fontSize: '16px', 
                            backgroundColor: isRegistering ? '#28a745' : '#007bff', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginTop: '10px'
                        }}
                    >
                        {isRegistering ? 'Sign Up' : 'Login'}
                    </button>
                </form>

                {/* Toggle Button */}
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <p style={{ margin: 0, color: '#555' }}>
                        {isRegistering ? 'Already have an account?' : "Don't have an account yet?"}
                    </p>
                    <button 
                        type="button" 
                        onClick={() => {
                            setIsRegistering(!isRegistering);
                            setError('');
                            setMessage('');
                        }}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#007bff',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            padding: '5px',
                            fontSize: '14px'
                        }}
                    >
                        {isRegistering ? 'Log in here' : 'Create one here'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;