import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Home, Download, Share2, Ticket, Star, Calendar, Clock, MapPin, Film, ShieldCheck } from 'lucide-react';

const BookingSuccessPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { movie, theatre, show, selectedSeats, amountPayable, bookingId } = location.state || {};

    if (!movie || !theatre || !show) return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
            <div className="text-center group">
                <Ticket className="w-16 h-16 text-slate-800 mx-auto mb-4 group-hover:text-red-500 transition-colors duration-500" />
                <h1 className="text-xl font-bold text-slate-500 uppercase tracking-widest">Booking Session Expired</h1>
                <button onClick={() => navigate('/')} className="mt-6 text-red-500 font-bold hover:underline flex items-center gap-2 mx-auto">
                    Return to Homepage
                </button>
            </div>
        </div>
    );

    const seatsStr = selectedSeats?.map((s: any) => `${s.row}${s.number}`).join(', ') || '';

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-slate-300 flex flex-col items-center justify-center p-6 relative overflow-hidden">

            {/* Background Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-emerald-500/5 blur-[120px] rounded-full" />

            {/* Main Ticket Card */}
            <div className="relative w-full max-w-lg animate-in zoom-in-95 duration-700">
                <div className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden relative group">

                    {/* Top Section - Success Status */}
                    <div className="bg-emerald-500/10 p-10 flex flex-col items-center border-b border-dashed border-white/10 relative">
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
                        <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.4)] mb-6 animate-bounce-subtle">
                            <CheckCircle className="w-10 h-10 text-white fill-white/20" />
                        </div>
                        <h2 className="text-3xl font-bold text-white tracking-tight uppercase">Booking Confirmed</h2>
                        <p className="text-emerald-400 text-xs font-semibold tracking-wide mt-2">Enjoy your experience, {movie.title.split(' ')[0]}!</p>
                    </div>

                    {/* Perforated Divider Visuals */}
                    <div className="absolute left-0 top-[184px] -translate-x-1/2 w-8 h-8 bg-[#0a0a0f] rounded-full border border-white/10 z-20 shadow-inner" />
                    <div className="absolute right-0 top-[184px] translate-x-1/2 w-8 h-8 bg-[#0a0a0f] rounded-full border border-white/10 z-20 shadow-inner" />

                    {/* Middle Section - Booking Details */}
                    <div className="p-10 pt-12">
                        <div className="flex gap-8 mb-10 border-b border-white/5 pb-8 relative">
                            <div className="w-28 h-40 shrink-0 relative rounded-2xl overflow-hidden border border-white/10 shadow-xl">
                                <img src={movie.posterUrl} alt="Poster" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            </div>
                            <div className="flex flex-col justify-center">
                                <div className="flex items-center gap-2 mb-2">
                                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                    <span className="text-xs font-bold text-white">{movie.rating || '8.5'}</span>
                                </div>
                                <h3 className="text-2xl font-bold text-white tracking-tight uppercase leading-none mb-3">{movie.title}</h3>
                                <div className="space-y-1.5">
                                    <p className="text-[10px] text-slate-500 font-semibold flex items-center gap-2 tracking-wide uppercase">
                                        <Film className="w-3.5 h-3.5 text-red-500" /> {movie.language} • {show.type || '2D'}
                                    </p>
                                    <p className="text-[10px] text-slate-500 font-semibold flex items-center gap-2 tracking-wide uppercase">
                                        <MapPin className="w-3.5 h-3.5 text-red-500" /> {theatre.name}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Grid Info */}
                        <div className="grid grid-cols-2 gap-y-8 gap-x-4 mb-10">
                            <div>
                                <p className="text-[10px] text-slate-600 font-semibold uppercase tracking-widest mb-1.5">Date & Time</p>
                                <div className="space-y-0.5">
                                    <p className="text-sm font-bold text-white flex items-center gap-2">
                                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                        {show.showTime && !isNaN(new Date(show.showTime).getTime()) 
                                            ? new Date(show.showTime).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                                            : 'Today'}
                                    </p>
                                    <p className="text-xs font-semibold text-slate-400 flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5 text-slate-600" />
                                        {show.showTime && !isNaN(new Date(show.showTime).getTime())
                                            ? new Date(show.showTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
                                            : 'Flexible Time'}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-600 font-semibold uppercase tracking-widest mb-1.5">Seats & Hall</p>
                                <p className="text-sm font-bold text-white tracking-tight truncate">{seatsStr}</p>
                                <p className="text-[10px] text-slate-500 font-semibold tracking-wide uppercase mt-0.5">Screen 02</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-600 font-semibold uppercase tracking-widest mb-1.5">Booking ID</p>
                                <p className="text-xs font-bold text-red-500 tracking-widest">#{bookingId}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-600 font-semibold uppercase tracking-widest mb-1.5">Total Paid</p>
                                <p className="text-sm font-bold text-white">₹{amountPayable?.toFixed(2)}</p>
                            </div>
                        </div>

                        {/* QR Code Section */}
                        <div className="bg-white/5 border border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center relative shadow-inner mb-6">
                            <div className="absolute top-4 left-4 w-4 h-4 border-l border-t border-white/20" />
                            <div className="absolute top-4 right-4 w-4 h-4 border-r border-t border-white/20" />
                            <div className="absolute bottom-4 left-4 w-4 h-4 border-l border-b border-white/20" />
                            <div className="absolute bottom-4 right-4 w-4 h-4 border-r border-b border-white/20" />

                            <img src={`https://bwipjs-api.metafloor.com/?bcid=qrcode&text=MS-${bookingId}&scale=3&contenttype=image/png`}
                                alt="QR Code"
                                className="w-32 h-32 invert brightness-200 opacity-80" />
                            <p className="text-[9px] text-slate-600 font-semibold uppercase tracking-[0.4em] mt-4">Security Scannable</p>
                        </div>
                    </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-10 flex gap-4 w-full">
                    <button className="flex-1 bg-white/5 hover:bg-white/10 text-white py-4 rounded-3xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 border border-white/10 transition-all active:scale-95 shadow-xl">
                        <Download className="w-5 h-5 text-red-500" /> E-Ticket
                    </button>
                    <button className="flex-1 bg-white/5 hover:bg-white/10 text-white py-4 rounded-3xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 border border-white/10 transition-all active:scale-95 shadow-xl">
                        <Share2 className="w-5 h-5 text-emerald-500" /> Share
                    </button>
                </div>

                <button
                    onClick={() => navigate('/')}
                    className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white py-5 rounded-3xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-red-600/30 transition-all hover:scale-[1.02] active:scale-95 group"
                >
                    <Home className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" /> Back to Movies
                </button>
            </div>

            {/* Verification Footer */}
            <div className="mt-12 flex items-center gap-3 text-[10px] font-semibold text-slate-700 uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4" /> Securely processed by MovieShark Anti-Fraud System
            </div>
        </div>
    );
};

export default BookingSuccessPage;
