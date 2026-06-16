import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Clock, CheckCircle, XCircle, Pause, LogOut, Film, Clapperboard, Settings, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

interface TheatreApplication {
    id: number;
    theatreName: string;
    ownerName: string;
    email: string;
    city: string;
    screensCount: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
    rejectionReason?: string;
    createdAt: string;
}

const statusConfig = {
    PENDING: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/20 border-amber-400/30', label: 'Under Verification', desc: 'Your theatre registration is being reviewed by our team.' },
    APPROVED: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-400/30', label: 'Approved', desc: 'Congratulations! Your theatre is approved and live.' },
    REJECTED: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20 border-red-400/30', label: 'Rejected', desc: 'Your application was not approved.' },
    SUSPENDED: { icon: Pause, color: 'text-orange-400', bg: 'bg-orange-500/20 border-orange-400/30', label: 'Suspended', desc: 'Your theatre has been suspended by the admin.' },
};

const OwnerDashboardPage: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [app, setApp] = useState<TheatreApplication | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/theatre-owner/status')
            .then(r => setApp(r.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const StatusIcon = app ? statusConfig[app.status].icon : Clock;
    const sConfig = app ? statusConfig[app.status] : null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Top Bar */}
            <header className="bg-white/5 border-b border-white/10 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Film className="w-6 h-6 text-red-400" />
                    <span className="text-white font-bold text-lg">MovieBooky</span>
                    <span className="bg-amber-500/20 text-amber-300 text-xs px-2 py-1 rounded-full font-medium border border-amber-500/30">Theatre Owner</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-slate-400 text-sm">👋 {user?.name}</span>
                    <button onClick={handleLogout} className="flex items-center gap-1 text-sm text-slate-400 hover:text-red-400 transition-colors">
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-6 py-10">
                <h1 className="text-3xl font-bold text-white mb-2">Owner Dashboard</h1>
                <p className="text-slate-400 mb-8">Manage your theatre registration and settings</p>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin h-10 w-10 border-4 border-red-500 border-t-transparent rounded-full" />
                    </div>
                ) : app ? (
                    <>
                        {/* Status Card */}
                        <div className={`border rounded-2xl p-6 mb-8 flex items-start gap-4 ${sConfig?.bg}`}>
                            <StatusIcon className={`w-8 h-8 mt-0.5 flex-shrink-0 ${sConfig?.color}`} />
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <h2 className="text-white font-bold text-lg">{sConfig?.label}</h2>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${sConfig?.bg} ${sConfig?.color}`}>{app.status}</span>
                                </div>
                                <p className="text-slate-300 text-sm">{sConfig?.desc}</p>
                                {app.rejectionReason && (
                                    <p className="text-red-300 text-sm mt-2 bg-red-500/10 rounded px-3 py-2">
                                        <strong>Reason:</strong> {app.rejectionReason}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Theatre Info */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
                            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-red-400" /> Theatre Information
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                {[
                                    { label: 'Theatre Name', value: app.theatreName },
                                    { label: 'Owner', value: app.ownerName },
                                    { label: 'Email', value: app.email },
                                    { label: 'Screens', value: `${app.screensCount} screen(s)` },
                                    { label: 'City', value: app.city },
                                    { label: 'Applied On', value: new Date(app.createdAt).toLocaleDateString() },
                                ].map(item => (
                                    <div key={item.label}>
                                        <p className="text-slate-500 text-xs">{item.label}</p>
                                        <p className="text-white font-medium mt-0.5">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Feature Cards — locked or accessible based on status */}
                        {app.status === 'APPROVED' ? (
                            <div>
                                <h3 className="text-white font-semibold mb-4">Your Tools</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                        { icon: Clapperboard, label: 'Manage Shows', desc: 'Add or edit show timings and pricing', href: '/admin/shows' },
                                        { icon: Settings, label: 'Screen Layout', desc: 'Configure seats for each screen', href: '/admin/theatres' },
                                        { icon: MapPin, label: 'Theatre Settings', desc: 'Update your theatre details', href: '/admin/theatres' },
                                    ].map(tool => (
                                        <button key={tool.label} onClick={() => navigate(tool.href)}
                                            className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-red-500/30 rounded-xl p-5 text-left transition-all group">
                                            <tool.icon className="w-6 h-6 text-red-400 mb-3 group-hover:scale-110 transition-transform" />
                                            <p className="text-white font-semibold">{tool.label}</p>
                                            <p className="text-slate-400 text-xs mt-1">{tool.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center text-slate-400">
                                <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p className="text-sm">Theatre management features will be available once your application is approved.</p>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-20 text-slate-400">No theatre application found for this account.</div>
                )}
            </div>
        </div>
    );
};

export default OwnerDashboardPage;
