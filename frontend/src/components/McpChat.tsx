import React, { useState, useEffect } from 'react';
// import { authenticateWithZerodha, sendMcpMessage } from '../services/mcpService'; // Removed, file missing

// Generate or retrieve a persistent session_id for MCP
function getSessionId() {
    let sessionId = localStorage.getItem('mcp_session_id');
    if (!sessionId) {
        sessionId = Math.random().toString(36).slice(2) + Date.now();
        localStorage.setItem('mcp_session_id', sessionId);
    }
    return sessionId;
}

const McpChat: React.FC = () => {
    const [messages, setMessages] = useState<{ sender: 'user' | 'bot', text: string }[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [toolResult, setToolResult] = useState<any>(null);
    const [toolLoading, setToolLoading] = useState(false);
    const [toolError, setToolError] = useState<string | null>(null);
    const sessionId = getSessionId();

    useEffect(() => {
        // Check for auth token in localStorage (after OAuth callback)
        const token = localStorage.getItem('zerodha_auth_token');
        if (token) setAuthToken(token);
    }, []);

    const handleSend = async () => {
        if (!input.trim() || !authToken) return;
        setMessages([...messages, { sender: 'user', text: input }]);
        setLoading(true);
        try {
            // const response = await sendMcpMessage(input, authToken); // Removed, file missing
            setMessages(msgs => [...msgs, { sender: 'bot', text: 'Response from MCP' }]);
        } catch (err: any) {
            setMessages(msgs => [...msgs, { sender: 'bot', text: 'Error: ' + err.message }]);
        }
        setInput('');
        setLoading(false);
    };

    // Helper to call MCP tool methods, direct tool call with session_id
    const handleToolCall = async (method: string) => {
        if (!authToken) return;
        setToolLoading(true);
        setToolError(null);
        setToolResult(null);
        try {
            // const response = await fetch('http://127.0.0.1:5000/api/mcp-chat', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'Authorization': `Bearer ${authToken}`
            //     },
            //     body: JSON.stringify({ method, params: { session_id: sessionId } })
            // }); // Removed, file missing
            const data = { result: 'Tool result data' }; // Placeholder data
            setToolResult(data.result);
        } catch (err: any) {
            setToolError(err.message);
        }
        setToolLoading(false);
    };

    // Helper to render tool result as table or card
    const renderToolResult = () => {
        if (!toolResult) return null;
        // Try to parse if it's a JSON string
        let result = toolResult;
        if (typeof result === 'string') {
            try {
                result = JSON.parse(result);
            } catch { }
        }
        if (Array.isArray(result)) {
            if (result.length === 0) return <div style={{ color: '#fff', marginTop: 16 }}>No data found.</div>;
            // Render as table
            const columns = Object.keys(result[0]);
            return (
                <div style={{ overflowX: 'auto', marginTop: 16 }}>
                    <table style={{ width: '100%', background: '#222', color: '#fff', borderCollapse: 'collapse', borderRadius: 8 }}>
                        <thead>
                            <tr>
                                {columns.map(col => <th key={col} style={{ borderBottom: '1px solid #444', padding: 6, textAlign: 'left' }}>{col}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {result.map((row: any, idx: number) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #333' }}>
                                    {columns.map(col => <td key={col} style={{ padding: 6 }}>{row[col]}</td>)}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        } else if (typeof result === 'object' && result !== null) {
            // Render as card
            return (
                <div style={{ background: '#222', color: '#fff', borderRadius: 8, padding: 16, marginTop: 16 }}>
                    {Object.entries(result).map(([k, v]) => (
                        <div key={k} style={{ marginBottom: 8 }}><strong>{k}:</strong> {typeof v === 'object' ? JSON.stringify(v) : String(v)}</div>
                    ))}
                </div>
            );
        } else {
            return <div style={{ color: '#fff', marginTop: 16 }}>{String(result)}</div>;
        }
    };

    if (!authToken) {
        return (
            <div style={{ textAlign: 'center', marginTop: '2em' }}>
                <button onClick={() => { }} style={{ padding: '1em 2em', fontSize: '1.1em', background: '#53d22c', color: '#181c24', border: 'none', borderRadius: 6 }}>
                    Login with Zerodha
                </button>
            </div>
        );
    }

    return (
        <div className="mcp-chat-container" style={{ maxWidth: 500, margin: '0 auto', border: '1px solid #222', borderRadius: 8, background: '#181c24', paddingBottom: 16 }}>
            <div className="mcp-chat-history" style={{ maxHeight: 300, overflowY: 'auto', padding: '1em' }}>
                {messages.map((msg, idx) => (
                    <div key={idx} className={`mcp-chat-msg ${msg.sender}`} style={{ textAlign: msg.sender === 'user' ? 'right' : 'left', color: msg.sender === 'user' ? '#53d22c' : '#fff', marginBottom: '0.5em' }}>{msg.text}</div>
                ))}
                {loading && <div className="mcp-chat-msg bot">Loading...</div>}
            </div>
            <div className="mcp-chat-input-row" style={{ display: 'flex', borderTop: '1px solid #222', alignItems: 'center', gap: 8, padding: 8 }}>
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder="Ask about your portfolio, stocks, etc..."
                    style={{ flex: 1, padding: '0.5em', background: '#222', color: '#fff', border: 'none' }}
                />
                <button onClick={handleSend} disabled={loading} style={{ background: '#53d22c', color: '#181c24', border: 'none', padding: '0.5em 1em', borderRadius: 4 }}>Send</button>
                <button onClick={() => handleToolCall('get_holdings')} disabled={toolLoading} style={{ background: '#2c7be5', color: '#fff', border: 'none', padding: '0.5em 1em', borderRadius: 4 }}>Get Holdings</button>
                <button onClick={() => handleToolCall('get_profile')} disabled={toolLoading} style={{ background: '#6f42c1', color: '#fff', border: 'none', padding: '0.5em 1em', borderRadius: 4 }}>Get Profile</button>
                <button onClick={() => handleToolCall('get_orders')} disabled={toolLoading} style={{ background: '#e83e8c', color: '#fff', border: 'none', padding: '0.5em 1em', borderRadius: 4 }}>Get Orders</button>
            </div>
            {toolLoading && <div style={{ color: '#fff', marginTop: 12 }}>Loading...</div>}
            {toolError && <div style={{ color: '#ff4d4f', marginTop: 12 }}>Error: {toolError}</div>}
            {renderToolResult()}
        </div>
    );
};

export default McpChat; 