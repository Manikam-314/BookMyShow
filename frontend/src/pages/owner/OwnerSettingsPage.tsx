import React, { useState, useEffect } from 'react';
import { Settings, Armchair, Clock, Lock, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import api from '../../services/api';
import { useOwner } from '../../context/OwnerContext';
import type { Theatre } from '../../types';

const OwnerSettingsPage: React.FC = () => {
    const { myTheatre, refetch } = useOwner();
    const [theatre, setTheatre] = useState<Theatre | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Form states
    const [rows, setRows] = useState(10);
    const [cols, setCols] = useState(15);
    const [timings, setTimings] = useState<string[]>([]);
    const [newTiming, setNewTiming] = useState('');

    useEffect(() => {
        if (myTheatre) {
            setTheatre(myTheatre);
            setRows(myTheatre.totalRows || 10);
            setCols(myTheatre.totalColumns || 15);
            setTimings(myTheatre.showTimings ? myTheatre.showTimings.split(',').map(t => t.trim()) : []);
        }
    }, [myTheatre]);

    const handleAddTiming = () => {
        if (!newTiming) return;
        if (timings.includes(newTiming)) {
            setError('This timing is already added.');
            return;
        }
        setTimings(prev => [...prev, newTiming].sort());
        setNewTiming('');
        setError(null);
    };

    const handleRemoveTiming = (time: string) => {
        setTimings(prev => prev.filter(t => t !== time));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            const payload = {
                totalRows: rows,
                totalColumns: cols,
                showTimings: timings.join(',')
            };

            await api.put('/theatre-owner/update-my-theatre', payload);
            setSuccess('Settings updated successfully!');
            refetch(); // Update global context
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to update settings.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!theatre) return null;

    const isLocked = theatre.seatsConfigured;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-black text-white flex items-center gap-3 uppercase tracking-tight">
                    <Settings className="w-8 h-8 text-red-500" /> Theatre Settings
                </h1>
                <p className="text-slate-500 text-sm mt-1 uppercase font-bold tracking-widest">Configure your hall layout and show preferences</p>
            </header>

            {success && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3 text-emerald-400 font-bold text-sm animate-in zoom-in-95">
                    <CheckCircle2 className="w-5 h-5" /> {success}
                </div>
            )}

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 text-red-400 font-bold text-sm animate-in zoom-in-95">
                    <AlertTriangle className="w-5 h-5" /> {error}
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-8 pb-20">

                {/* Seat Configuration Section */}
                <section className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-3xl -mr-16 -mt-16" />

                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                                <Armchair className="w-5 h-5 text-red-500" /> Hall Configuration
                            </h2>
                            <p className="text-slate-500 text-xs mt-1 font-bold uppercase tracking-wider">Define your seat matrix (Rows × Columns)</p>
                        </div>
                        {isLocked && (
                            <span className="bg-red-500/20 text-red-400 text-[10px] font-black px-3 py-1 rounded-full border border-red-500/30 flex items-center gap-1.5 uppercase tracking-widest">
                                <Lock className="w-3 h-3" /> Locked
                            </span>
                        )}
                    </div>

                    {isLocked ? (
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-black/20 border border-white/5 rounded-2xl p-6">
                                <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest mb-1">Total Rows</p>
                                <p className="text-3xl font-black text-white tracking-tighter">{rows}</p>
                            </div>
                            <div className="bg-black/20 border border-white/5 rounded-2xl p-6">
                                <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest mb-1">Total Columns</p>
                                <p className="text-3xl font-black text-white tracking-tighter">{cols}</p>
                            </div>
                            <div className="col-span-2 mt-2 flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                                <Info className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-red-400 font-medium">
                                    Seat configuration is permanently locked. To change the layout of your theatre, please contact administrator support.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Rows (Horizontal)</label>
                                    <input
                                        type="number" min={1} max={26}
                                        value={rows} onChange={e => setRows(Number(e.target.value))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500/40 transition-all font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Columns (Vertical)</label>
                                    <input
                                        type="number" min={1} max={30}
                                        value={cols} onChange={e => setCols(Number(e.target.value))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500/40 transition-all font-bold"
                                    />
                                </div>
                            </div>
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 flex items-start gap-4">
                                <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
                                <div>
                                    <p className="text-amber-400 font-black text-xs uppercase tracking-tight">Warning: One-time Setup</p>
                                    <p className="text-amber-500/70 text-[10px] font-bold mt-1 leading-relaxed">
                                        Once saved, the seat matrix will be locked and cannot be edited. This ensures consistency for existing show bookings.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                {/* Timing Preferences Section */}
                <section className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden group">
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 blur-3xl -ml-16 -mb-16" />

                    <div className="mb-8">
                        <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                            <Clock className="w-5 h-5 text-emerald-500" /> Show Timings
                        </h2>
                        <p className="text-slate-500 text-xs mt-1 font-bold uppercase tracking-wider">Set your regular show schedules for quick booking</p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex gap-3">
                            <input
                                type="time"
                                value={newTiming} onChange={e => setNewTiming(e.target.value)}
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all font-bold [color-scheme:dark]"
                            />
                            <button
                                type="button" onClick={handleAddTiming}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white font-black px-6 rounded-xl transition-all shadow-lg shadow-emerald-500/20 uppercase text-xs tracking-widest"
                            >
                                Add Slot
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {timings.length > 0 ? timings.map(time => (
                                <div key={time} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3 group/item hover:bg-white/10 transition-all">
                                    <span className="text-white font-black text-sm">{time}</span>
                                    <button
                                        type="button" onClick={() => handleRemoveTiming(time)}
                                        className="text-slate-600 hover:text-red-500 transition-colors"
                                    >
                                        <Lock className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )) : (
                                <div className="w-full py-8 text-center bg-black/20 border border-dashed border-white/5 rounded-2xl">
                                    <p className="text-slate-600 font-bold uppercase text-[10px] tracking-[0.2em]">No timing preferences set</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Footer Actions */}
                <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-[2rem] p-6 sticky bottom-6 z-10 backdrop-blur-xl">
                    <div>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-none mb-1">Current Status</p>
                        <p className="text-white font-bold text-sm tracking-tight">{theatre.name} — Hall Config</p>
                    </div>
                    <button
                        type="submit" disabled={submitting}
                        className="bg-red-500 hover:bg-red-600 disabled:bg-red-900/50 text-white font-black px-10 py-4 rounded-2xl shadow-2xl shadow-red-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] uppercase text-xs tracking-[0.2em]"
                    >
                        {submitting ? 'Processing...' : 'Save Configuration'}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default OwnerSettingsPage;
