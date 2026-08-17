import React, { useState, useEffect } from 'react';



const AuthDemo = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [dashboardData, setDashboardData] = useState(null);
    const [error, setError] = useState('');

    // Ensure this matches your actual WSL IP
    const API_BASE_URL = 'http://172.31.170.48:8000';

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/token/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) throw new Error('Invalid credentials');

            const data = await response.json();
            
            // Save the tokens in the browser's local storage
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);
            
            alert('Login successful!');
        } catch (err) {
            setError(err.message);
        }
    };

    const fetchProtectedData = async () => {
        // Retrieve the saved token
        const token = localStorage.getItem('access_token');
        
        if (!token) {
            setError('No token found. Please log in first.');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/accounts/dashboard/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // This is how you pass the JWT to Django!
                    'Authorization': `Bearer ${token}` 
                }
            });

            if (!response.ok) throw new Error('Unauthorized. Token might be expired.');

            const data = await response.json();
            setDashboardData(data);
        } catch (err) {
            setError(err.message);
        }
    };

useEffect(() => {
    fetchProtectedData();
}, []);

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <h2>Login</h2>
            <form onSubmit={handleLogin} style={{ marginBottom: '20px' }}>
                <input 
                    type="text" 
                    placeholder="Username" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    style={{ display: 'block', margin: '10px 0', padding: '8px' }}
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    style={{ display: 'block', margin: '10px 0', padding: '8px' }}
                />
                <button type="submit" style={{ padding: '8px 16px' }}>Login</button>
            </form>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <hr />

            <h2>Test Protected Endpoint</h2>
            <button onClick={fetchProtectedData} style={{ padding: '8px 16px' }}>
                Get My Watchlist
            </button>

            {dashboardData && (
                <div style={{ marginTop: '20px', background: '#f4f4f4', padding: '15px' }}>
                    <p><strong>Message:</strong> {dashboardData.message}</p>
                    <p><strong>Watchlist:</strong> {dashboardData.watchlist.join(', ')}</p>
                </div>
            )}
        </div>
    );
};

export default AuthDemo;