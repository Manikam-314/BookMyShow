import React, { useCallback, useEffect, useState } from 'react';
import {
    Clapperboard, Clock, ChevronDown, ChevronUp, RefreshCw,
    AlertTriangle, Users, Ticket, CalendarDays, TrendingUp
} from 'lucide-react';
import { showService } from '../../services/showService';
import { useOwner } from '../../context/OwnerContext';
import type { Show, ShowSeat } from '../../types';

const NotApprovedGuard: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-10 max-w-md">
            <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h2 className="text-white font-bold text-xl mb-2">Feature Locked</h2>
            <p className="text-slate-400 text-sm leading-relaxed">{message}</p>
        </div>
    </div>
);

interface SeatStats { booked: number; available: number; total: number; }

const OwnerShowsPage: React.FC = () => {
    const { myTheatre, isApproved, loading: ownerLoading } = useOwner();
    const [shows, setShows] = useState<Show[]>([]);
    const [loading, setLoading] = useState(false);
    const [expandedDate, setExpandedDate] = useState<string | null>(null);
    // Map from showId → seat stats
    const [seatStats, setSeatStats] = useState<Record<number, SeatStats>>({});
    const [loadingSeats, setLoadingSeats] = useState<Record<number, boolean>>({});

    const loadShows = useCallback(async () => {
        if (!myTheatre) return;
        setLoading(true);
        setSeatStats({});
        try {
            const data = await showService.searchShows('', '', myTheatre.name);
            data.sort((a, b) => new Date(a.showTime).getTime() - new Date(b.showTime).getTime());
            setShows(data);
        } catch { setShows([]); }
        finally { setLoading(false); }
    }, [myTheatre]);

    useEffect(() => { if (isApproved && myTheatre) loadShows(); }, [isApproved, myTheatre, loadShows]);

    const loadSeatStatsForDate = useCallback(async (_date: string, showsForDate: Show[]) => {
        const toLoad = showsForDate.filter(s => !seatStats[s.id] && !loadingSeats[s.id]);
        if (toLoad.length === 0) return;

        setLoadingSeats(prev => {
            const next = { ...prev };
            toLoad.forEach(s => { next[s.id] = true; });
            return next;
        });

        await Promise.all(toLoad.map(async (s) => {
            try {
                const seats: ShowSeat[] = await showService.getSeatsForShow(String(s.id));
                const booked = seats.filter(x => x.status === 'BOOKED' || x.status === 'SOLD').length;
                const available = seats.filter(x => x.status === 'AVAILABLE').length;
                setSeatStats(prev => ({ ...prev, [s.id]: { booked, available, total: seats.length } }));
            } catch {
                setSeatStats(prev => ({ ...prev, [s.id]: { booked: 0, available: 0, total: 0 } }));
            } finally {
                setLoadingSeats(prev => ({ ...prev, [s.id]: false }));
            }
        }));
    }, [seatStats, loadingSeats]);

    if (ownerLoading) return (
        <div className="flex items-center justify-center py-24">
            <div className="animate-spin h-10 w-10 border-4 border-red-500 border-t-transparent rounded-full" />
        </div>
    );

    if (!isApproved) return (
        <NotApprovedGuard message="Your theatre is under review. You can view your shows once an admin approves your application." />
    );

    const today = new Date().toISOString().split('T')[0];
    const grouped = shows.reduce<Record<string, Show[]>>((acc, show) => {
        // showTime can be "2026-02-25T09:00:00" or "2026-02-25 09:00:00"
        const rawDate = show.showTime?.replace(' ', 'T') ?? '';
        const date = rawDate.split('T')[0];
        if (!date || date === 'undefined') return acc;
        if (!acc[date]) acc[date] = [];
        acc[date].push(show);
        return acc;
    }, {});
    const sortedDates = Object.keys(grouped).sort();

    const upcomingCount = shows.filter(s => {
        const raw = (s.showTime ?? '').replace(' ', 'T');
        return raw.split('T')[0] >= today;
    }).length;


    const formatDate = (d: string) => {
        const date = new Date(d + 'T00:00:00');
        if (isNaN(date.getTime())) return d;
        if (d === today) return 'Today';
        const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
        if (d === tomorrow.toISOString().split('T')[0]) return 'Tomorrow';
        return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
    };

    const formatTime = (showTime: string) => {
        const raw = (showTime ?? '').replace(' ', 'T');
        const d = new Date(raw);
        if (isNaN(d.getTime())) return '--:--';
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getMovieTitle = (show: Show): string => {
        return (show as any).movieTitle
            || show.movie?.title
            || (show as any).movieName
            || `Show #${show.id}`;
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Clapperboard className="w-6 h-6 text-red-400" /> My Shows
                    </h1>
                    <p className="text-slate-400 text-sm mt-0.5">
                        Shows at <span className="text-white font-medium">{myTheatre?.name}</span>
                        <span className="text-slate-600"> — {myTheatre?.city}</span>
                    </p>
                </div>
                <button onClick={loadShows} disabled={loading}
                    className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors disabled:opacity-50">
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <div className="animate-spin h-10 w-10 border-4 border-red-500 border-t-transparent rounded-full" />
                </div>
            ) : shows.length === 0 ? (
                <div className="text-center py-20">
                    <Clapperboard className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-500">No shows scheduled yet.</p>
                    <p className="text-slate-600 text-sm mt-1">Go to <span className="text-red-400">Schedule a Show</span> to add some.</p>
                </div>
            ) : (
                <>
                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { icon: CalendarDays, label: 'Total Shows', value: shows.length, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
                            { icon: TrendingUp, label: 'Upcoming', value: upcomingCount, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
                            { icon: Ticket, label: 'Seats Booked', value: shows.reduce((acc, s) => acc + (s as any).bookedSeatsCount, 0), color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
                            { icon: Users, label: 'Seats Available', value: shows.reduce((acc, s) => acc + ((s as any).totalSeatsCount - (s as any).bookedSeatsCount), 0), color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
                        ].map(stat => (
                            <div key={stat.label} className={`${stat.bg} border rounded-xl p-4 flex flex-col gap-1`}>
                                <div className="flex items-center gap-1.5">
                                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                                    <span className="text-slate-500 text-xs">{stat.label}</span>
                                </div>
                                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Shows grouped by date */}
                    <div className="space-y-3">
                        <p className="text-slate-500 text-sm">{shows.length} show(s) across {sortedDates.length} date(s)</p>
                        {sortedDates.map(date => {
                            const isOpen = expandedDate === date;
                            const upcoming = date >= today;
                            const dateShows = grouped[date];
                            // aggregate seat stats for this date
                            const dateBooked = dateShows.reduce((s, sh) => s + (seatStats[sh.id]?.booked ?? 0), 0);
                            const dateAvail = dateShows.reduce((s, sh) => s + (seatStats[sh.id]?.available ?? 0), 0);
                            const dateHasStats = dateShows.some(sh => seatStats[sh.id]);

                            return (
                                <div key={date} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                                    <button
                                        onClick={() => {
                                            const opening = expandedDate !== date;
                                            setExpandedDate(opening ? date : null);
                                            if (opening) loadSeatStatsForDate(date, dateShows);
                                        }}
                                        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors"
                                    >
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <span className={`text-sm font-bold ${upcoming ? 'text-white' : 'text-slate-500'}`}>
                                                {formatDate(date)}
                                            </span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${upcoming
                                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                                                : 'bg-slate-500/15 text-slate-500 border-slate-500/20'}`}>
                                                {upcoming ? 'Upcoming' : 'Past'}
                                            </span>
                                            {dateHasStats && (
                                                <span className="text-xs text-slate-500">
                                                    <span className="text-red-400 font-medium">{dateBooked}</span> booked ·
                                                    <span className="text-emerald-400 font-medium"> {dateAvail}</span> free
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-500 text-xs">{dateShows.length} show(s)</span>
                                            {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                                        </div>
                                    </button>

                                    {isOpen && (
                                        <div className="border-t border-white/10 divide-y divide-white/5">
                                            {dateShows.map((show) => {
                                                const showAny = show as any;
                                                const stats = seatStats[show.id];
                                                const isLoadingS = loadingSeats[show.id];

                                                // Use pre-calculated stats if available, otherwise fallback to lazy load
                                                const currentBooked = stats ? stats.booked : (showAny.bookedSeatsCount || 0);
                                                const currentTotal = stats ? stats.total : (showAny.totalSeatsCount || 0);
                                                const currentAvail = stats ? stats.available : (currentTotal - currentBooked);
                                                const fillPct = currentTotal > 0 ? Math.round((currentBooked / currentTotal) * 100) : null;

                                                return (
                                                    <div key={show.id} className="px-5 py-3.5">
                                                        <div className="flex items-center gap-4">
                                                            {/* Time */}
                                                            <div className="flex items-center gap-1.5 w-16 flex-shrink-0">
                                                                <Clock className="w-3.5 h-3.5 text-red-400" />
                                                                <span className="text-red-400 font-bold text-sm">
                                                                    {formatTime(show.showTime)}
                                                                </span>
                                                            </div>

                                                            {/* Movie info */}
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-white text-sm font-semibold truncate">
                                                                    {getMovieTitle(show)}
                                                                </p>
                                                                <p className="text-slate-500 text-xs">
                                                                    {show.type || '2D'}{show.language ? ` · ${show.language}` : ''}
                                                                </p>
                                                            </div>

                                                            {/* Price */}
                                                            <div className="text-slate-400 text-sm font-medium flex-shrink-0 text-right">
                                                                <div>₹{show.minPrice} – ₹{show.maxPrice}</div>
                                                            </div>
                                                        </div>

                                                        {/* Seat bar */}
                                                        <div className="mt-2.5 ml-[88px]">
                                                            {isLoadingS ? (
                                                                <div className="text-slate-600 text-xs animate-pulse">Loading seats...</div>
                                                            ) : stats ? (
                                                                <div className="space-y-1.5">
                                                                    <div className="flex items-center justify-between text-xs">
                                                                        <span className="text-slate-500">
                                                                            <span className="text-red-400 font-medium">{currentBooked}</span> booked ·
                                                                            <span className="text-emerald-400 font-medium"> {currentAvail}</span> available ·
                                                                            <span className="text-slate-400"> {currentTotal}</span> total
                                                                        </span>
                                                                        {fillPct !== null && (
                                                                            <span className={`font-medium ${fillPct >= 80 ? 'text-red-400' : fillPct >= 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                                                                {fillPct}% filled
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    {/* Fill bar */}
                                                                    {currentTotal > 0 && (
                                                                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                                            <div
                                                                                className={`h-full rounded-full transition-all ${fillPct! >= 80 ? 'bg-red-500' : fillPct! >= 50 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                                                                                style={{ width: `${fillPct}%` }}
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};

export default OwnerShowsPage;
