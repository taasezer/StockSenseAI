import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { language, setLanguage } = useLanguage();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

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
