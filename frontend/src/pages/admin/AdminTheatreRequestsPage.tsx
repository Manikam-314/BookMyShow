import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Pause, Search, RefreshCw, Shield } from 'lucide-react';
import api from '../../services/api';

interface TheatreApplication {
    id: number;
    theatreName: string;
    ownerName: string;
    email: string;
    phone: string;
    city: string;
    address: string;
    screensCount: number;
    verificationDocUrl?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
    rejectionReason?: string;
    createdAt: string;
}

const STATUS_TABS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'] as const;

const statusBadge = (status: string) => {
    const map: Record<string, string> = {
        PENDING: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
        APPROVED: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
        REJECTED: 'bg-red-500/20 text-red-300 border-red-400/30',
        SUSPENDED: 'bg-orange-500/20 text-orange-300 border-orange-400/30',
    };
    return map[status] || 'bg-gray-500/20 text-gray-300 border-gray-400/30';
};

const AdminTheatreRequestsPage: React.FC = () => {
    const [applications, setApplications] = useState<TheatreApplication[]>([]);
    const [filtered, setFiltered] = useState<TheatreApplication[]>([]);
    const [activeTab, setActiveTab] = useState<string>('ALL');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [reasonPrompt, setReasonPrompt] = useState<{ id: number; action: 'reject' | 'suspend' } | null>(null);
    const [reason, setReason] = useState('');

    const fetchAll = () => {
        setLoading(true);
        setError(null);
        api.get('/admin/theatres')
            .then(r => {
                setApplications(r.data);
                setFiltered(r.data);
            })
            .catch(err => {
                console.error("Failed to fetch admin theatres:", err);
                setError(err.response?.data?.message || err.message || "Failed to load applications");
            })
            .finally(() => setLoading(false));
    };

    useEffect(fetchAll, []);

    useEffect(() => {
        let data = activeTab === 'ALL' ? applications : applications.filter(a => a.status === activeTab);
        if (search) data = data.filter(a =>
            a.theatreName.toLowerCase().includes(search.toLowerCase()) ||
            a.ownerName.toLowerCase().includes(search.toLowerCase()) ||
            a.email.toLowerCase().includes(search.toLowerCase()) ||
            a.city.toLowerCase().includes(search.toLowerCase())
        );
        setFiltered(data);
    }, [applications, activeTab, search]);

    const doAction = async (id: number, action: string, body?: object) => {
        setActionLoading(id);
        try {
            await api.put(`/admin/theatre/${id}/${action}`, body || {});
            fetchAll();
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || "Action failed");
        } finally {
            setActionLoading(null);
        }
    };

    const handleApprove = (id: number) => doAction(id, 'approve');
    const handleRejectSuspend = () => {
        if (!reasonPrompt) return;
        doAction(reasonPrompt.id, reasonPrompt.action, { reason: reason || 'No reason provided' });
        setReasonPrompt(null);
        setReason('');
    };

    const pendingCount = applications.filter(a => a.status === 'PENDING').length;

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Shield className="w-6 h-6 text-red-400" /> Theatre Requests
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">{pendingCount} pending review</p>
                </div>
                <button onClick={fetchAll} className="flex items-center gap-2 text-sm bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg border border-white/10 transition-colors">
                    <RefreshCw className="w-3.5 h-3.5" /> Refresh
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-3">
                    <XCircle className="w-5 h-5" />
                    <div className="flex-1">{error}</div>
                    <button onClick={() => setError(null)} className="text-slate-500 hover:text-white">✕</button>
                </div>
            )}

            {/* Search + Tabs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search theatre, owner, email, city..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-white/10 border border-white/20 text-white placeholder-slate-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                </div>
                <div className="flex gap-1 bg-white/5 border border-white/10 rounded-lg p-1">
                    {STATUS_TABS.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${activeTab === tab ? 'bg-red-500 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            {tab}
                            {tab === 'PENDING' && pendingCount > 0 && (
                                <span className="ml-1 bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingCount}</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-red-500 border-t-transparent rounded-full" /></div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 text-slate-500">No theatre applications found.</div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(app => (
                        <div key={app.id} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-colors">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-white font-semibold">{app.theatreName}</h3>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${statusBadge(app.status)}`}>{app.status}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                                        <span>👤 {app.ownerName}</span>
                                        <span>📧 {app.email}</span>
                                        <span>📞 {app.phone}</span>
                                        <span>📍 {app.city}</span>
                                        <span>🎬 {app.screensCount} screen(s)</span>
                                        <span>🗓 {new Date(app.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    {app.rejectionReason && (
                                        <p className="text-xs text-red-400 mt-1">Reason: {app.rejectionReason}</p>
                                    )}
                                    {app.verificationDocUrl && (
                                        <a href={app.verificationDocUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline mt-1 inline-block">📄 View Document</a>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2 flex-shrink-0">
                                    {app.status !== 'APPROVED' && (
                                        <button
                                            onClick={() => handleApprove(app.id)}
                                            disabled={actionLoading === app.id}
                                            className="flex items-center gap-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 text-xs font-medium px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                                        </button>
                                    )}
                                    {app.status !== 'REJECTED' && (
                                        <button
                                            onClick={() => setReasonPrompt({ id: app.id, action: 'reject' })}
                                            disabled={actionLoading === app.id}
                                            className="flex items-center gap-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-400/30 text-xs font-medium px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            <XCircle className="w-3.5 h-3.5" /> Reject
                                        </button>
                                    )}
                                    {app.status !== 'SUSPENDED' && app.status === 'APPROVED' && (
                                        <button
                                            onClick={() => setReasonPrompt({ id: app.id, action: 'suspend' })}
                                            disabled={actionLoading === app.id}
                                            className="flex items-center gap-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-400/30 text-xs font-medium px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            <Pause className="w-3.5 h-3.5" /> Suspend
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Reason Modal */}
            {reasonPrompt && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-800 border border-white/20 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <h3 className="text-white font-bold mb-1 capitalize">
                            {reasonPrompt.action === 'reject' ? <><XCircle className="inline w-5 h-5 text-red-400 mr-1" />Reject Theatre</> : <><Pause className="inline w-5 h-5 text-orange-400 mr-1" />Suspend Theatre</>}
                        </h3>
                        <p className="text-slate-400 text-sm mb-4">Provide a reason (optional)</p>
                        <textarea
                            className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-400 rounded-lg px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400"
                            rows={3}
                            placeholder="e.g. Incomplete documentation..."
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                        />
                        <div className="flex gap-3 mt-4">
                            <button onClick={() => { setReasonPrompt(null); setReason(''); }} className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg text-sm transition-colors">Cancel</button>
                            <button onClick={handleRejectSuspend} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm font-semibold transition-colors">Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminTheatreRequestsPage;
