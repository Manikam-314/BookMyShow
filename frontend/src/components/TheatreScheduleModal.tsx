import React, { useEffect, useState } from 'react';
import { X, Calendar, Film } from 'lucide-react';
import type { Show } from '../types';
import { showService } from '../services/showService';

interface TheatreScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    theatreName: string;
    theatreId: number;
}

const TheatreScheduleModal: React.FC<TheatreScheduleModalProps> = ({ isOpen, onClose, theatreName, theatreId: _theatreId }) => {
    const [shows, setShows] = useState<Show[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && theatreName) {
            setLoading(true);
            showService.searchShows("", "", theatreName)
                .then(data => {
                    // Show all shows returned by the backend (committed plan) at user request
                    const sorted = data.sort((a, b) => new Date(a.showTime).getTime() - new Date(b.showTime).getTime());
                    setShows(sorted);
                })
                .catch(err => console.error("Failed to load theatre schedule", err))
                .finally(() => setLoading(false));
        }
    }, [isOpen, theatreName]);

    if (!isOpen) return null;

    // Group shows by date
    const groupedShows: { [key: string]: Show[] } = {};
    shows.forEach(show => {
        const date = new Date(show.showTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
        if (!groupedShows[date]) groupedShows[date] = [];
        groupedShows[date].push(show);
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800 rounded-t-xl">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-red-500" />
                        Schedule for <span className="text-blue-400">{theatreName}</span>
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                        </div>
                    ) : shows.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            No upcoming shows scheduled for this theater.
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {Object.entries(groupedShows).map(([date, dateShows]) => (
                                <div key={date}>
                                    <h3 className="text-sm font-semibold text-gray-400 mb-3 sticky top-0 bg-slate-900 py-2 border-b border-slate-800">
                                        {date}
                                    </h3>
                                    <div className="grid gap-3">
                                        {dateShows.map(show => (
                                            <div key={show.id} className="bg-slate-800 p-3 rounded-lg border border-slate-700 flex justify-between items-center group hover:border-slate-600 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-slate-900 p-2 rounded text-red-400 font-bold border border-slate-700">
                                                        {new Date(show.showTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-white flex items-center gap-2">
                                                            <Film className="w-3 h-3 text-slate-500" />
                                                            {show.movie.title}
                                                        </div>
                                                        <div className="text-xs text-slate-500 mt-1">
                                                            {show.language} • {show.type} • ₹{show.minPrice}-{show.maxPrice}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-slate-700 bg-slate-800 rounded-b-xl flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TheatreScheduleModal;
