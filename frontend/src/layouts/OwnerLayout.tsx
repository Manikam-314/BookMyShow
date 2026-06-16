import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
    Film, LayoutDashboard, Clapperboard, CalendarDays,
    Armchair, LogOut, Menu, Building2, ChevronRight, Lock, Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { OwnerProvider, useOwner } from '../context/OwnerContext';

// ── Inner layout (has access to OwnerContext) ──────────────────────────────────
const OwnerLayoutInner: React.FC = () => {
    const { user, logout } = useAuth();
    const { isApproved, loading } = useOwner();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => { logout(); navigate('/login'); };

    // Nav items — pages that require APPROVED status are marked `locked`
    const navItems = [
        { to: '/owner/dashboard', icon: LayoutDashboard, label: 'Overview', locked: false },
        { to: '/owner/movies', icon: Film, label: 'Movies', locked: !isApproved },
        { to: '/owner/schedule', icon: CalendarDays, label: 'Schedule Show', locked: !isApproved },
        { to: '/owner/shows', icon: Clapperboard, label: 'My Shows', locked: !isApproved },
        { to: '/owner/seats', icon: Armchair, label: 'Seats', locked: !isApproved },
        { to: '/owner/settings', icon: Settings, label: 'Settings', locked: !isApproved },
    ];

    const Sidebar = () => (
        <aside className="flex flex-col h-full bg-slate-900 border-r border-white/10 w-64 flex-shrink-0">
            {/* Brand */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
                <div className="bg-red-500/20 p-2 rounded-lg">
                    <Film className="w-5 h-5 text-red-400" />
                </div>
                <div>
                    <span className="text-white font-bold text-base block">MovieBooky</span>
                    <span className="text-xs text-amber-400 font-medium">Theatre Portal</span>
                </div>
            </div>

            {/* Owner info */}
            <div className="px-4 py-4 mx-3 mt-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {user?.name?.charAt(0)?.toUpperCase() || 'O'}
                    </div>
                    <div className="min-w-0">
                        <p className="text-white font-medium text-sm truncate">{user?.name}</p>
                        <p className="text-slate-500 text-xs truncate">{user?.email}</p>
                    </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 text-xs font-medium">Theatre Owner</span>
                </div>
            </div>

            {/* Nav links */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {/* Pending notice */}
                {!loading && !isApproved && (
                    <div className="mb-3 mx-1 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                        <p className="text-amber-400 text-xs font-medium flex items-center gap-1.5">
                            <Lock className="w-3 h-3" /> Awaiting admin approval
                        </p>
                        <p className="text-amber-500/70 text-[10px] mt-0.5">Features unlock after approval</p>
                    </div>
                )}

                {navItems.map(item => (
                    item.locked ? (
                        // Locked nav item — not clickable
                        <div
                            key={item.to}
                            title="Available after approval"
                            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 cursor-not-allowed select-none"
                        >
                            <item.icon className="w-4 h-4 text-slate-700" />
                            <span>{item.label}</span>
                            <Lock className="w-3 h-3 ml-auto text-slate-700" />
                        </div>
                    ) : (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === '/owner/dashboard'}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all group ${isActive
                                    ? 'bg-red-500/15 text-red-400 border border-red-500/20'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon className={`w-4 h-4 ${isActive ? 'text-red-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                                    <span>{item.label}</span>
                                    {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-red-400" />}
                                </>
                            )}
                        </NavLink>
                    )
                ))}
            </nav>

            {/* Logout */}
            <div className="px-3 pb-5">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
                >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </button>
            </div>
        </aside>
    );

    return (
        <div className="flex h-screen bg-slate-950 overflow-hidden">
            {/* Desktop sidebar */}
            <div className="hidden md:flex">
                <Sidebar />
            </div>

            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden">
                    <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
                    <div className="relative z-50"><Sidebar /></div>
                </div>
            )}

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile topbar */}
                <div className="md:hidden bg-slate-900 border-b border-white/10 px-4 py-3 flex items-center justify-between">
                    <button onClick={() => setSidebarOpen(true)} className="text-slate-400 hover:text-white">
                        <Menu className="w-6 h-6" />
                    </button>
                    <span className="text-white font-bold">MovieBooky Owner</span>
                    <div className="w-6" />
                </div>

                <main className="flex-1 overflow-y-auto p-6 md:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

// ── Outer layout (wraps with OwnerProvider) ─────────────────────────────────────
const OwnerLayout: React.FC = () => (
    <OwnerProvider>
        <OwnerLayoutInner />
    </OwnerProvider>
);

export default OwnerLayout;
