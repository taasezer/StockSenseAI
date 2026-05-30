import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { language, setLanguage } = useLanguage();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotifDropdown, setShowNotifDropdown] = useState(false);

    useEffect(() => {
        const fetchNotifications = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) setNotifications(await res.json());
                } catch (e) { console.error(e); }
            }
        };
        fetchNotifications();
        // Poll every 10 seconds for new notifications
        const interval = setInterval(fetchNotifications, 10000);
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (id: number) => {
        const token = localStorage.getItem('token');
        if (token) {
            await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/${id}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="app-layout">
            <Sidebar />
            
            <div className="main-area">
                <header className="top-header">
                    <div className="header-actions">
                        <button 
                            onClick={toggleTheme} 
                            style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                        >
                            {theme === 'dark' ? (
                                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                            ) : (
                                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                            )}
                        </button>
                        <select 
                            className="lang-select" 
                            value={language} 
                            onChange={(e) => setLanguage(e.target.value as any)}
                        >
                            <option value="en">EN</option>
                            <option value="tr">TR</option>
                            <option value="fr">FR</option>
                            <option value="es">ES</option>
                        </select>
                        <div style={{ position: 'relative' }}>
                            <button 
                                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                                style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', position: 'relative', display: 'flex' }}
                            >
                                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                                {unreadCount > 0 && (
                                    <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--brand-red)', color: '#fff', borderRadius: '50%', padding: '2px 6px', fontSize: '10px', fontWeight: 'bold' }}>
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                            {showNotifDropdown && (
                                <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: '8px', width: '300px', backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px', zIndex: 100 }}>
                                    <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Notifications</h4>
                                    {notifications.length === 0 ? <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No notifications</p> : (
                                        <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {notifications.map(n => (
                                                <div key={n.id} onClick={() => !n.isRead && markAsRead(n.id)} style={{ padding: '8px', backgroundColor: n.isRead ? 'transparent' : 'rgba(239,68,68,0.1)', borderLeft: n.isRead ? '2px solid transparent' : '2px solid var(--brand-red)', borderRadius: '4px', cursor: n.isRead ? 'default' : 'pointer' }}>
                                                    <p style={{ margin: 0, fontSize: '12px', color: n.isRead ? 'var(--text-muted)' : 'var(--text-main)' }}>{n.message}</p>
                                                    <small style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{new Date(n.createdAt).toLocaleString()}</small>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div 
                            onClick={() => navigate('/profile')}
                            style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'border-color 0.2s' }}
                            onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--brand-red)'}
                            onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                        >
                            <svg width="16" height="16" fill="none" stroke="var(--text-muted)" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                        </div>
                    </div>
                </header>

                <main className="page-content">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
