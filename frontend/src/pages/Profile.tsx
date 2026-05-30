import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
    username: string;
    role: string;
    supplierId: string;
    supplierCode?: string;
    employeeCode?: string;
}

const Profile = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) {
                    throw new Error('Failed to load profile');
                }

                const data = await response.json();
                setProfile(data);
            } catch (err: any) {
                setError(err.message);
                // If token is invalid/expired
                if (err.message.includes('load')) {
                   localStorage.removeItem('token');
                   navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (error) {
        return <div style={{ color: '#ef4444' }}>{error}</div>;
    }

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 className="page-title">Identity Profile</h2>
            <p className="page-subtitle">Manage your account and access settings</p>

            <div className="stat-card" style={{ marginTop: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--bg-dark)', border: '2px solid var(--brand-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(220, 38, 38, 0.2)' }}>
                        <svg width="40" height="40" fill="none" stroke="var(--brand-red)" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                    </div>
                    <div>
                        <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>{profile?.username}</h3>
                        <span style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)', color: 'var(--brand-red)', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', border: '1px solid rgba(220, 38, 38, 0.2)' }}>
                            {profile?.role.toUpperCase()}
                        </span>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {profile?.role === 'Supplier' && (
                        <div style={{ padding: '16px', backgroundColor: 'rgba(220, 38, 38, 0.05)', borderRadius: '8px', border: '1px solid rgba(220, 38, 38, 0.2)' }}>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Organization Invitation Code (Supplier Code)
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--brand-red)', fontFamily: 'monospace' }}>
                                    {profile?.supplierCode || 'N/A'}
                                </span>
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                                Share this code with employees so they can join your organization.
                            </div>
                        </div>
                    )}

                    {profile?.role === 'Staff' && (
                        <div style={{ padding: '16px', backgroundColor: 'var(--bg-dark)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Employee Code
                            </div>
                            <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                                {profile?.employeeCode || 'N/A'}
                            </span>
                        </div>
                    )}
                    
                    <div style={{ backgroundColor: 'var(--bg-dark)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Supplier ID</span>
                        <span style={{ fontSize: '16px', fontWeight: '600', fontFamily: 'monospace' }}>
                            {profile?.supplierId ? `SUP-${profile.supplierId.padStart(4, '0')}` : 'System Admin'}
                        </span>
                    </div>
                    
                    <div style={{ backgroundColor: 'var(--bg-dark)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Access Level</span>
                        <span style={{ fontSize: '16px', fontWeight: '600' }}>
                            {profile?.role === 'Supplier' ? 'Full Workspace Access' : 'Restricted Access'}
                        </span>
                    </div>
                </div>

                <button 
                    onClick={() => { localStorage.removeItem('token'); navigate('/login'); }} 
                    className="btn-outline" 
                    style={{ marginTop: '32px', width: '100%', borderColor: '#ef4444', color: '#ef4444' }}
                >
                    Terminate Session
                </button>
            </div>
        </div>
    );
};

export default Profile;
