import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Film, Monitor, Calendar, LogOut, ClipboardList } from 'lucide-react';

const AdminLayout: React.FC = () => {
    const location = useLocation();

    const NAV_ITEMS = [
        { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/movies', label: 'Movies', icon: Film },
        { path: '/admin/theatres', label: 'Theatres', icon: Monitor },
        { path: '/admin/shows', label: 'Shows', icon: Calendar },
        { path: '/admin/theatre-requests', label: 'Theatre Requests', icon: ClipboardList },
    ];

    return (
        <div className="flex min-h-screen bg-slate-900 text-white">

            {/* Sidebar */}
            <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col fixed h-full">
                <div className="p-6 border-b border-slate-800">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                        MovieBooky <span className="text-xs text-gray-500 block font-mono mt-1">ADMIN</span>
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
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
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 ml-64 bg-slate-100 dark:bg-slate-900 min-h-screen text-gray-900 dark:text-white">
                <div className="p-8">
                    <Outlet />
                </div>
            </main>

        </div>
    );
};

export default AdminLayout;
