import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ZerodhaAuthCallback: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const requestToken = params.get('request_token');
        console.log('ZerodhaAuthCallback: request_token from URL:', requestToken);

        // Prevent double exchange
        if (localStorage.getItem('zerodha_auth_token')) {
            navigate('/mcp-chat');
            return;
        }

        if (!requestToken) {
            alert('No request_token found in URL');
            navigate('/mcp-chat');
            return;
        }

        // Exchange request_token for access token via backend
        fetch('http://127.0.0.1:5000/api/zerodha/exchange-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ request_token: requestToken }),
        })
            .then(res => res.json().then(data => {
                console.log('ZerodhaAuthCallback: backend response:', data);
                const accessToken = data.access_token || (data.data && data.data.access_token);
                if (accessToken) {
                    localStorage.setItem('zerodha_auth_token', accessToken);
                    navigate('/mcp-chat');
                } else {
                    alert('Failed to get access token');
                    navigate('/mcp-chat');
                }
            }))
            .catch((err) => {
                console.error('ZerodhaAuthCallback: error exchanging token:', err);
                alert('Error exchanging token');
                navigate('/mcp-chat');
            });
    }, [navigate]);

    return <div style={{ color: '#fff', textAlign: 'center', marginTop: '2em' }}>Authenticating with Zerodha...</div>;
};

export default ZerodhaAuthCallback; 