import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Building2, Clock, CheckCircle, XCircle, Pause,
    Film, Clapperboard, CalendarDays, Armchair,
    TrendingUp, Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useOwner } from '../../context/OwnerContext';

const statusConfig = {
    PENDING: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-400/30', label: 'Under Review', desc: 'Your application is being reviewed. You will be notified once approved.' },
    APPROVED: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-400/30', label: 'Approved & Live', desc: 'Your theatre is live! You can now schedule shows and manage everything below.' },
    REJECTED: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/15 border-red-400/30', label: 'Application Rejected', desc: 'Your application was not approved. See reason below.' },
    SUSPENDED: { icon: Pause, color: 'text-orange-400', bg: 'bg-orange-500/15 border-orange-400/30', label: 'Suspended', desc: 'Your theatre has been suspended by admin. Contact support.' },
};

const quickLinks = [
    { icon: Film, label: 'Browse Movies', desc: 'View all available movies to schedule', href: '/owner/movies', color: 'from-blue-500/20 to-blue-600/10 border-blue-500/20 hover:border-blue-400/40' },
    { icon: CalendarDays, label: 'Schedule a Show', desc: 'Pick a movie, date and time slots', href: '/owner/schedule', color: 'from-red-500/20 to-red-600/10 border-red-500/20 hover:border-red-400/40' },
    { icon: Clapperboard, label: 'My Shows', desc: 'View all upcoming and past shows', href: '/owner/shows', color: 'from-purple-500/20 to-purple-600/10 border-purple-500/20 hover:border-blue-400/40' },
    { icon: Armchair, label: 'Seat Status', desc: 'Check seat availability by show', href: '/owner/seats', color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/20 hover:border-blue-400/40' },
    { icon: Settings, label: 'Theatre Settings', desc: 'Configure hall layout & timings', href: '/owner/settings', color: 'from-amber-500/20 to-amber-600/10 border-amber-500/20 hover:border-blue-400/40' },
];

const OwnerOverviewPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    // Use shared context — no separate API call, no race condition on refresh
    const { app, loading } = useOwner();

    const sConfig = app ? statusConfig[app.status] : null;
    const StatusIcon = sConfig?.icon || Clock;

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Welcome header */}
            <div>
                <h1 className="text-3xl font-bold text-white">
                    Welcome back, {user?.name?.split(' ')[0]} 👋
                </h1>
                <p className="text-slate-400 mt-1">Here's your theatre management overview.</p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <div className="animate-spin h-10 w-10 border-4 border-red-500 border-t-transparent rounded-full" />
                </div>
            ) : app ? (
                <>
                    {/* Status Banner */}
                    <div className={`flex items-start gap-4 border rounded-2xl p-5 ${sConfig?.bg}`}>
                        <StatusIcon className={`w-7 h-7 mt-0.5 flex-shrink-0 ${sConfig?.color}`} />
                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-1">
                                <h2 className="text-white font-bold text-lg">{sConfig?.label}</h2>
                                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${sConfig?.bg} ${sConfig?.color}`}>
                                    {app.status}
                                </span>
                            </div>
                            <p className="text-slate-300 text-sm">{sConfig?.desc}</p>
                            {app.rejectionReason && (
                                <p className="text-red-300 text-sm mt-2 bg-red-500/10 rounded-lg px-3 py-2">
                                    <strong>Reason:</strong> {app.rejectionReason}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Theatre Details Grid */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h3 className="text-white font-semibold mb-5 flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-red-400" /> Theatre Information
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-5 text-sm">
                            {[
                                { label: 'Theatre Name', value: app.theatreName },
                                { label: 'Owner', value: app.ownerName },
                                { label: 'City', value: app.city },
                                { label: 'Screens', value: `${app.screensCount} screen(s)` },
                                { label: 'Email', value: app.email },
                                { label: 'Registered On', value: new Date(app.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
                            ].map(item => (
                                <div key={item.label}>
                                    <p className="text-slate-500 text-xs uppercase tracking-wide">{item.label}</p>
                                    <p className="text-white font-medium mt-1">{item.value}</p>
                                </div>
                            ))}
                        </div>
                        {app.address && (
                            <div className="mt-4 pt-4 border-t border-white/10">
                                <p className="text-slate-500 text-xs uppercase tracking-wide">Address</p>
                                <p className="text-white font-medium mt-1">{app.address}</p>
                            </div>
                        )}
                    </div>

                    {/* Quick Actions — only when APPROVED */}
                    {app.status === 'APPROVED' ? (
                        <div>
                            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-red-400" /> Quick Actions
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {quickLinks.map(link => (
                                    <button
                                        key={link.label}
                                        onClick={() => navigate(link.href)}
                                        className={`bg-gradient-to-br ${link.color} border rounded-2xl p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg group`}
                                    >
                                        <link.icon className="w-6 h-6 text-slate-300 mb-3 group-hover:scale-110 transition-transform" />
                                        <p className="text-white font-semibold text-sm">{link.label}</p>
                                        <p className="text-slate-400 text-xs mt-1 leading-relaxed">{link.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
                            <Building2 className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                            <p className="text-slate-400 text-sm max-w-sm mx-auto">
                                Management features will be available once your application is approved by an admin.
                            </p>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-20 text-slate-500">
                    No theatre application found for this account.
                </div>
            )}
        </div>
    );
};

export default OwnerOverviewPage;
