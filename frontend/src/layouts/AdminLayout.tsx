import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Film, Monitor, Calendar, LogOut, ClipboardList, Menu, X } from 'lucide-react';

const AdminLayout: React.FC = () => {
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const NAV_ITEMS = [
        { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/movies', label: 'Movies', icon: Film },
        { path: '/admin/theatres', label: 'Theatres', icon: Monitor },
        { path: '/admin/shows', label: 'Shows', icon: Calendar },
        { path: '/admin/theatre-requests', label: 'Theatre Requests', icon: ClipboardList },
    ];

    const SidebarContent = () => (
        <div className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col h-full text-white">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                    MovieBooky <span className="text-xs text-gray-500 block font-mono mt-1">ADMIN</span>
                </h1>
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="md:hidden text-gray-400 hover:text-white focus:outline-none"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <button className="flex items-center gap-3 text-gray-400 hover:text-white px-4 py-2 w-full transition-colors">
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col">

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex md:flex-col w-64 fixed h-full z-30">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden">
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <aside className="relative z-50 h-full flex flex-col">
                        <SidebarContent />
                    </aside>
                </div>
            )}

            {/* Main Area */}
            <div className="flex-1 flex flex-col md:pl-64">
                {/* Mobile Topbar */}
                <header className="md:hidden bg-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between z-20">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-gray-400 hover:text-white focus:outline-none"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <span className="text-xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                        MovieBooky Admin
                    </span>
                    <div className="w-6" />
                </header>

                {/* Main Content Area */}
                <main className="flex-grow bg-slate-100 dark:bg-slate-900 text-gray-900 dark:text-white">
                    <div className="p-4 md:p-8">
                        <Outlet />
                    </div>
                </main>
            </div>

        </div>
    );
};

export default AdminLayout;
