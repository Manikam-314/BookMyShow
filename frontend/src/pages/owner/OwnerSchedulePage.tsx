import React, { useEffect, useState } from 'react';
import { Save, CalendarDays, Clock, AlertTriangle, Building2 } from 'lucide-react';
import { movieService } from '../../services/movieService';
import { showService } from '../../services/showService';
import { useOwner } from '../../context/OwnerContext';
import type { Movie } from '../../types';

const TIME_SLOTS = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00', '22:00', '23:00',
];

// ── Guard: shown when status is not APPROVED ─────────────────────────────────
const NotApprovedGuard: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-10 max-w-md">
            <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h2 className="text-white font-bold text-xl mb-2">Feature Locked</h2>
            <p className="text-slate-400 text-sm leading-relaxed">{message}</p>
        </div>
    </div>
);

const OwnerSchedulePage: React.FC = () => {
    const { myTheatre, isApproved, loading: ownerLoading } = useOwner();

    const [movies, setMovies] = useState<Movie[]>([]);
    const [formData, setFormData] = useState({ movieId: '', date: '', priceMin: '', priceMax: '' });
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [slotsLoading, setSlotsLoading] = useState(false);

    useEffect(() => {
        if (isApproved) {
            movieService.getAllMovies().then(setMovies).catch(console.error);
        }
    }, [isApproved]);

    useEffect(() => {
        if (myTheatre && formData.date) {
            setSlotsLoading(true);
            showService.getAvailableSlots(String(myTheatre.id), formData.date)
                .then(slots => setAvailableSlots(slots))
                .catch(() => setAvailableSlots([]))
                .finally(() => setSlotsLoading(false));
            setSelectedSlots([]);
        }
    }, [myTheatre, formData.date]);

    const toggleSlot = (slot: string) =>
        setSelectedSlots(prev => prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null); setSuccess(null);
        if (!myTheatre) { setError('Theatre not found. Contact support.'); return; }
        if (selectedSlots.length === 0) { setError('Please select at least one time slot.'); return; }

        setSubmitting(true);
        try {
            await Promise.all(selectedSlots.map(slot => {
                const [h, m] = slot.split(':');
                return showService.addShow({
                    movieId: Number(formData.movieId),
                    theaterId: myTheatre.id,
                    showTime: `${formData.date}T${h.padStart(2, '0')}:${(m || '00').padStart(2, '0')}:00`,
                    minPrice: Number(formData.priceMin),
                    maxPrice: Number(formData.priceMax),
                });
            }));
            setSuccess(`✅ ${selectedSlots.length} show(s) scheduled successfully for ${myTheatre.name}!`);
            setSelectedSlots([]);
            const refreshed = await showService.getAvailableSlots(String(myTheatre.id), formData.date).catch(() => []);
            setAvailableSlots(refreshed);
        } catch (err: any) {
            const d = err?.response?.data;
            setError(typeof d === 'string' ? d : d?.message || 'Failed to schedule shows.');
        } finally {
            setSubmitting(false);
        }
    };

    if (ownerLoading) return (
        <div className="flex items-center justify-center py-24">
            <div className="animate-spin h-10 w-10 border-4 border-red-500 border-t-transparent rounded-full" />
        </div>
    );

    if (!isApproved) return (
        <NotApprovedGuard message="Your theatre is under review. You can schedule shows once an admin approves your application." />
    );

    const inputCls = "w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/40 [&>option]:bg-slate-900";
    const labelCls = "block text-slate-400 text-xs font-medium mb-1.5 uppercase tracking-wide";

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <CalendarDays className="w-6 h-6 text-red-400" /> Schedule a Show
                </h1>
                <p className="text-slate-400 text-sm mt-0.5">
                    Scheduling for: <span className="text-white font-medium">{myTheatre?.name}</span>
                    <span className="text-slate-600"> — {myTheatre?.city}</span>
                </p>
            </div>

            {/* Theatre badge */}
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                <Building2 className="w-5 h-5 text-red-400 flex-shrink-0" />
                <div>
                    <p className="text-white text-sm font-semibold">{myTheatre?.name}</p>
                    <p className="text-slate-500 text-xs">{myTheatre?.city} • {myTheatre?.address}</p>
                </div>
                <span className="ml-auto text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">Your Theatre</span>
            </div>

            {success && <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-xl px-4 py-3 text-sm">{success}</div>}
            {error && <div className="bg-red-500/15 border border-red-500/30 text-red-300 rounded-xl px-4 py-3 text-sm">{error}</div>}

            <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
                <div>
                    <label className={labelCls}>Movie *</label>
                    <select required value={formData.movieId} onChange={e => setFormData(f => ({ ...f, movieId: e.target.value }))} className={inputCls}>
                        <option value="">Choose a movie...</option>
                        {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                    </select>
                </div>

                <div>
                    <label className={labelCls}>Date *</label>
                    <input
                        type="date" required
                        min={new Date().toISOString().split('T')[0]}
                        value={formData.date}
                        onChange={e => setFormData(f => ({ ...f, date: e.target.value }))}
                        className={inputCls + ' [color-scheme:dark]'}
                    />
                </div>

                <div>
                    <label className={labelCls}>
                        <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" /> Select Time Slots *
                            {selectedSlots.length > 0 && <span className="normal-case text-red-400 font-semibold ml-1">({selectedSlots.length} selected)</span>}
                        </span>
                    </label>
                    {slotsLoading ? (
                        <div className="flex items-center gap-2 text-slate-500 text-sm py-3">
                            <div className="animate-spin h-4 w-4 border-2 border-slate-500 border-t-transparent rounded-full" /> Loading available slots...
                        </div>
                    ) : !formData.date ? (
                        <p className="text-slate-600 text-sm py-3 italic">Select a date first to see available show timings.</p>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-2 mt-1">
                                {availableSlots.length > 0 ? (
                                    availableSlots.map(slot => (
                                        <button key={slot} type="button" onClick={() => toggleSlot(slot)}
                                            className={`px-4 py-2.5 rounded-xl border text-sm font-bold transition-all ${selectedSlots.includes(slot)
                                                ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20 scale-105 select-none'
                                                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'}`}
                                        >{slot}</button>
                                    ))
                                ) : (
                                    <div className="w-full py-4 px-5 bg-amber-500/5 border border-dashed border-amber-500/20 rounded-2xl">
                                        <p className="text-amber-400 text-xs font-semibold flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4" />
                                            {myTheatre?.showTimings
                                                ? "All preferred slots for this date are already scheduled or unavailable."
                                                : "No preferred timings set. Using default slots (Manage in Settings)."}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {!myTheatre?.showTimings && availableSlots.length === 0 && (
                                <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                                    <p className="w-full text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2">Default Hourly Slots</p>
                                    {TIME_SLOTS.map(slot => (
                                        <button key={slot} type="button" onClick={() => toggleSlot(slot)}
                                            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${selectedSlots.includes(slot)
                                                ? 'bg-red-500 border-red-500 text-white'
                                                : 'bg-white/5 border-white/10 text-slate-500 hover:text-slate-300'}`}
                                        >{slot}</button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-5">
                    <div>
                        <label className={labelCls}>Min Price (₹) *</label>
                        <input type="number" required min={1} placeholder="60" value={formData.priceMin}
                            onChange={e => setFormData(f => ({ ...f, priceMin: e.target.value }))} className={inputCls} />
                    </div>
                    <div>
                        <label className={labelCls}>Max Price (₹) *</label>
                        <input type="number" required min={1} placeholder="200" value={formData.priceMax}
                            onChange={e => setFormData(f => ({ ...f, priceMax: e.target.value }))} className={inputCls} />
                    </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-white/10">
                    <button type="submit" disabled={submitting || selectedSlots.length === 0}
                        className="flex items-center gap-2 px-6 py-2.5 bg-red-500 hover:bg-red-600 disabled:bg-red-500/40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-red-500/20">
                        {submitting
                            ? <><div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> Scheduling...</>
                            : <><Save className="w-4 h-4" /> Schedule {selectedSlots.length > 0 ? `${selectedSlots.length} ` : ''}Show{selectedSlots.length !== 1 ? 's' : ''}</>
                        }
                    </button>
                </div>
            </form>
        </div>
    );
};

export default OwnerSchedulePage;
