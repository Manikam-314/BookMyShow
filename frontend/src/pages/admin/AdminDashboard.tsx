import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Film, Monitor, Ticket, Users, TrendingUp } from 'lucide-react';

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const STATS = [
        { label: 'Total Movies', value: '45', icon: Film, bg: 'bg-blue-500' },
        { label: 'Theatres', value: '12', icon: Monitor, bg: 'bg-purple-500' },
        { label: 'Active Shows', value: '86', icon: Ticket, bg: 'bg-orange-500' },
        { label: 'Total Users', value: '1.2K', icon: Users, bg: 'bg-green-500' },
    ];

    return (
        <div>
            <h2 className="text-3xl font-bold mb-8">Dashboard Overview</h2>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {STATS.map((stat) => (
                    <div key={stat.label} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{stat.label}</p>
                            <h3 className="text-3xl font-bold dark:text-white">{stat.value}</h3>
                        </div>
                        <div className={`p-3 rounded-lg ${stat.bg} bg-opacity-10`}>
                            <stat.icon className={`w-6 h-6 ${stat.bg.replace('bg-', 'text-')}`} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions & Recent Activity (Placeholder) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Recent Bookings Chart Placeholder */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg dark:text-white">Revenue Analytics</h3>
                        <div className="flex items-center gap-2 text-green-500 text-sm font-medium">
                            <TrendingUp className="w-4 h-4" /> +12.5% this week
                        </div>
                    </div>
                    <div className="h-64 flex items-end gap-2 justify-between px-2">
                        {/* Mock Bars */}
                        {[40, 65, 30, 80, 55, 90, 70].map((h, i) => (
                            <div key={i} className="w-full bg-slate-100 dark:bg-slate-700 rounded-t overflow-hidden relative group">
                                <div
                                    style={{ height: `${h}%` }}
                                    className="absolute bottom-0 left-0 right-0 bg-red-500 opacity-80 group-hover:opacity-100 transition-opacity rounded-t"
                                ></div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4 text-xs text-gray-400">
                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="font-bold text-lg dark:text-white mb-6">Quick Actions</h3>
                    <div className="space-y-4">
                        <button className="w-full flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors text-left">
                            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded text-blue-600 dark:text-blue-400">
                                <Film className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="font-semibold text-sm dark:text-white">Add New Movie</div>
                                <div className="text-xs text-gray-500">Update catalog</div>
                            </div>
                        </button>

                        <button onClick={() => navigate('/admin/theatres')} className="w-full flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors text-left">
                            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded text-purple-600 dark:text-purple-400">
                                <Monitor className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="font-semibold text-sm dark:text-white">Manage Theatres</div>
                                <div className="text-xs text-gray-500">Add, Edit, Delete venues</div>
                            </div>
                        </button>

                        <button className="w-full flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors text-left">
                            <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded text-orange-600 dark:text-orange-400">
                                <Ticket className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="font-semibold text-sm dark:text-white">Schedule Shows</div>
                                <div className="text-xs text-gray-500">Assign movies to screens</div>
                            </div>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;
