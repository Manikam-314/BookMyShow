import React, { useEffect, useState } from 'react';
import { Armchair, AlertTriangle } from 'lucide-react';
import { showService } from '../../services/showService';
import { useOwner } from '../../context/OwnerContext';
import type { Show, ShowSeat } from '../../types';

const seatColors: Record<string, string> = {
    AVAILABLE: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400',
    BOOKED: 'bg-red-500/20 border-red-500/40 text-red-400',
    LOCKED: 'bg-amber-500/20 border-amber-500/40 text-amber-400',
    SOLD: 'bg-slate-700 border-slate-600 text-slate-500',
};

const NotApprovedGuard: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-10 max-w-md">
            <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h2 className="text-white font-bold text-xl mb-2">Feature Locked</h2>
            <p className="text-slate-400 text-sm leading-relaxed">{message}</p>
        </div>
    </div>
);

const OwnerSeatsPage: React.FC = () => {
    const { myTheatre, isApproved, loading: ownerLoading } = useOwner();
    const [shows, setShows] = useState<Show[]>([]);
    const [selectedShow, setSelectedShow] = useState('');
    const [seats, setSeats] = useState<ShowSeat[]>([]);
    const [showsLoading, setShowsLoading] = useState(false);
    const [seatsLoading, setSeatsLoading] = useState(false);

    useEffect(() => {
        if (isApproved && myTheatre) {
            setShowsLoading(true);
            showService.searchShows('', '', myTheatre.name)
                .then(data => {
                    const today = new Date().toISOString().split('T')[0];
                    const upcoming = data
                        .filter(s => {
                            const raw = (s.showTime ?? '').replace(' ', 'T');
                            return raw.split('T')[0] >= today;
                        })
                        .sort((a, b) => {
                            const ta = new Date((a.showTime ?? '').replace(' ', 'T')).getTime();
                            const tb = new Date((b.showTime ?? '').replace(' ', 'T')).getTime();
                            return ta - tb;
                        });
                    setShows(upcoming);
                })
                .catch(() => setShows([]))
                .finally(() => setShowsLoading(false));
        }
    }, [isApproved, myTheatre]);

    const handleShowChange = async (id: string) => {
        setSelectedShow(id);
        setSeats([]);
        if (!id) return;
        setSeatsLoading(true);
        try {
            const data = await showService.getSeatsForShow(id);
            setSeats(Array.isArray(data) ? data : []);
        } catch { setSeats([]); }
        finally { setSeatsLoading(false); }
    };

    if (ownerLoading) return (
        <div className="flex items-center justify-center py-24">
            <div className="animate-spin h-10 w-10 border-4 border-red-500 border-t-transparent rounded-full" />
        </div>
    );

    if (!isApproved) return (
        <NotApprovedGuard message="Your theatre is under review. Seat availability will be accessible once an admin approves your application." />
    );

    const rows = seats.reduce<Record<string, ShowSeat[]>>((acc, seat) => {
        if (!acc[seat.row]) acc[seat.row] = [];
        acc[seat.row].push(seat);
        return acc;
    }, {});

    const stats = {
        available: seats.filter(s => s.status === 'AVAILABLE').length,
        booked: seats.filter(s => s.status === 'BOOKED').length,
        locked: seats.filter(s => s.status === 'LOCKED').length,
        sold: seats.filter(s => s.status === 'SOLD').length,
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Armchair className="w-6 h-6 text-red-400" /> Seat Availability
                </h1>
                <p className="text-slate-400 text-sm mt-0.5">
                    Showing shows for <span className="text-white font-medium">{myTheatre?.name}</span>
                </p>
            </div>

            {/* Show picker */}
            <div>
                <label className="text-slate-500 text-xs uppercase tracking-wide block mb-1.5">Select Show</label>
                <select
                    value={selectedShow}
                    onChange={e => handleShowChange(e.target.value)}
                    disabled={showsLoading || shows.length === 0}
                    className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/40 [&>option]:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <option value="">
                        {showsLoading ? 'Loading shows...' : shows.length === 0 ? 'No upcoming shows found' : 'Select a show...'}
                    </option>
                    {shows.map(s => {
                        const raw = (s.showTime ?? '').replace(' ', 'T');
                        const dt = new Date(raw);
                        const dateStr = isNaN(dt.getTime())
                            ? raw.split('T')[0]
                            : dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                        const timeStr = isNaN(dt.getTime())
                            ? raw.split('T')[1]?.slice(0, 5) ?? ''
                            : dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        const movie = (s as any).movieTitle || s.movie?.title || `Show #${s.id}`;
                        return <option key={s.id} value={s.id}>{dateStr} at {timeStr} — {movie}</option>;
                    })}
                </select>
            </div>

            {!selectedShow ? (
                <div className="text-center py-20">
                    <Armchair className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-500">Select a show above to view seat availability.</p>
                </div>
            ) : seatsLoading ? (
                <div className="flex items-center justify-center py-24">
                    <div className="animate-spin h-10 w-10 border-4 border-red-500 border-t-transparent rounded-full" />
                </div>
            ) : seats.length === 0 ? (
                <div className="text-center py-20">
                    <Armchair className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-500">No seat data available for this show.</p>
                </div>
            ) : (
                <>
                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { label: 'Available', count: stats.available, cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
                            { label: 'Booked', count: stats.booked, cls: 'text-red-400 bg-red-500/10 border-red-500/20' },
                            { label: 'Locked', count: stats.locked, cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
                            { label: 'Sold', count: stats.sold, cls: 'text-slate-400 bg-slate-500/10 border-slate-500/20' },
                        ].map(stat => (
                            <div key={stat.label} className={`border rounded-xl p-4 text-center ${stat.cls}`}>
                                <p className="text-2xl font-bold">{stat.count}</p>
                                <p className="text-xs font-medium mt-0.5">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap gap-3 text-xs">
                        {Object.entries(seatColors).map(([status, cls]) => (
                            <span key={status} className={`flex items-center gap-1.5 border rounded px-2.5 py-1 ${cls}`}>
                                <span className="w-2 h-2 rounded-sm bg-current" /> {status}
                            </span>
                        ))}
                    </div>

                    {/* Seat Grid */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 overflow-x-auto">
                        <div className="flex flex-col items-center gap-1.5 min-w-max mx-auto">
                            <div className="w-full max-w-2xl bg-slate-800/60 rounded-lg py-2 text-center text-slate-400 text-xs font-medium mb-4 border border-white/10">
                                🎬  S C R E E N
                            </div>
                            {Object.keys(rows).sort().map(row => (
                                <div key={row} className="flex items-center gap-1.5">
                                    <span className="text-slate-600 text-xs w-5 text-right font-mono">{row}</span>
                                    <div className="flex gap-1">
                                        {rows[row].sort((a, b) => a.number - b.number).map(seat => (
                                            <div
                                                key={seat.id}
                                                title={`${seat.row}${seat.number} — ${seat.type} — ${seat.status}`}
                                                className={`w-6 h-6 rounded-sm border text-[9px] flex items-center justify-center font-mono cursor-default ${seatColors[seat.status] || 'bg-slate-800 border-slate-700 text-slate-600'}`}
                                            >
                                                {seat.number}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default OwnerSeatsPage;
