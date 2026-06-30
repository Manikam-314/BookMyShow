import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Heart, Smartphone, FastForward, Search, ChevronDown, Calendar, MapPin, Clock } from 'lucide-react';
import { movieService } from '../services/movieService';
import { showService } from '../services/showService';
import type { Movie, Show } from '../types';

const TheatreListingPage: React.FC = () => {
    const { movieId } = useParams<{ movieId: string }>();
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState(0);
    const [movie, setMovie] = useState<Movie | null>(null);
    const [groupedShows, setGroupedShows] = useState<Record<string, Show[]>>({});
    const [loading, setLoading] = useState(true);

    const DATES = Array.from({ length: 4 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return {
            day: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
            date: d.getDate(),
            month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
            fullDate: d.toISOString().split('T')[0]
        };
    });

    const [selectedCity, setSelectedCity] = useState(() => {
        return localStorage.getItem('user_city') || 'Mumbai';
    });

    useEffect(() => {
        const handleCityChange = () => {
            setSelectedCity(localStorage.getItem('user_city') || 'Mumbai');
        };
        window.addEventListener('city_changed', handleCityChange);
        return () => window.removeEventListener('city_changed', handleCityChange);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            if (!movieId) return;
            try {
                const movieData = await movieService.getMovieById(movieId);
                setMovie(movieData);

                // Pass the *actual* selected city to the API
                const showsData = await showService.searchShows(selectedCity, movieData.title);
                const selectedDateStr = DATES[selectedDate].fullDate;
                const filteredShows = showsData.filter(show => show.showTime.startsWith(selectedDateStr));

                const grouped: Record<string, Show[]> = {};
                filteredShows.forEach(show => {
                    const tName = show.theaterResource?.name || `Theatre ${show.theaterId}`;
                    if (!grouped[tName]) grouped[tName] = [];
                    grouped[tName].push(show);
                });
                setGroupedShows(grouped);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [movieId, selectedDate, selectedCity]); // Re-fetch if selectedCity changes

    return (
        <div className="bg-[#0a0a0f] min-h-screen font-sans text-slate-300 pb-20 overflow-x-hidden">

            {/* Header: Movie Info & Date Filter */}
            <div className="bg-[#0a0a0f]/60 backdrop-blur-xl border-b border-white/10 sticky top-16 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 text-red-500 text-xs font-bold tracking-widest uppercase mb-1">
                                <Clock className="w-3 h-3" /> Now Showing
                            </div>
                            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                                {loading ? 'Loading...' : (movie ? movie.title : 'Movie Not Found')}
                                <span className="text-slate-500 text-sm sm:text-lg font-medium ml-2 sm:ml-3">— {movie?.language || 'All Languages'}</span>
                            </h1>
                        </div>

                        {/* Date Slider */}
                        <div className="flex gap-2 sm:gap-3 bg-white/5 p-1.5 rounded-2xl border border-white/5 overflow-x-auto scrollbar-hide">
                            {DATES.map((d, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedDate(i)}
                                    className={`flex flex-col items-center min-w-[56px] sm:min-w-[64px] py-2 sm:py-2.5 rounded-xl transition-all ${selectedDate === i
                                        ? 'bg-red-600 text-white shadow-lg shadow-red-600/40'
                                        : 'hover:bg-white/10 text-slate-400'
                                        }`}
                                >
                                    <span className="text-[10px] font-bold tracking-tight opacity-70">{d.day}</span>
                                    <span className="text-lg font-bold">{d.date}</span>
                                    <span className="text-[10px] uppercase font-bold tracking-tighter">{d.month}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Secondary Filters */}
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/5">
                        <div className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer hover:text-white transition-colors">
                            <span className="font-semibold">Format: 2D/3D</span>
                            <ChevronDown className="w-4 h-4 text-slate-500" />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer hover:text-white transition-colors">
                            <span className="font-semibold">Price Range</span>
                            <ChevronDown className="w-4 h-4 text-slate-500" />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer hover:text-white transition-colors">
                            <span className="font-semibold">Show Timings</span>
                            <ChevronDown className="w-4 h-4 text-slate-500" />
                        </div>
                        <div className="flex-1" />
                        <div className="relative group hidden sm:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-hover:text-red-400 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search Cinema..."
                                className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 w-64"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap justify-end gap-4 sm:gap-6 text-[10px] text-slate-500 uppercase font-semibold tracking-widest">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></div> Available</div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50"></div> Fast Filling</div>
                <div className="flex items-center gap-2 border border-emerald-500/50 px-1.5 py-0.5 text-emerald-500 rounded-sm">LAN</div>
                <span>Subtitles Available</span>
            </div>

            {/* Theatres List */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
                {Object.keys(groupedShows).length > 0 ? (
                    Object.keys(groupedShows).map(theatreName => {
                        const theatreShows = groupedShows[theatreName];
                        if (theatreShows.length === 0) return null;

                        return (
                            <div key={theatreName} className="bg-white/5 backdrop-blur-md p-4 sm:p-6 md:p-8 rounded-2xl border border-white/10 hover:border-red-500/30 transition-all flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-8 group">

                                {/* Theatre Info */}
                                <div className="w-full md:w-1/3 xl:w-1/4 space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-white/5 p-2 rounded-lg border border-white/10 group-hover:bg-red-500/10 group-hover:border-red-500/20 transition-colors">
                                            <Heart className="w-5 h-5 text-slate-500 group-hover:text-red-500 cursor-pointer" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xl text-white group-hover:text-red-400 transition-colors tracking-tight leading-tight mb-1">{theatreName}</h3>
                                            <div className="flex items-center gap-2 text-slate-500 text-xs mb-3">
                                                <MapPin className="w-3 h-3" /> Chennai
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold uppercase tracking-wider bg-emerald-400/10 px-2 py-1 rounded-md">
                                                    <Smartphone className="w-3.5 h-3.5" /> M-Ticket
                                                </div>
                                                <div className="flex items-center gap-1.5 text-amber-400 text-[10px] font-bold uppercase tracking-wider bg-amber-400/10 px-2 py-1 rounded-md">
                                                    <FastForward className="w-3.5 h-3.5" /> F&B
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Shows Grid */}
                                <div className="flex-1">
                                    <div className="flex flex-wrap gap-4">
                                        {theatreShows.map(show => (
                                            <button
                                                key={show.id}
                                                onClick={() => navigate(`/book/${show.id}`)}
                                                className="group/btn min-w-[110px] border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500 text-emerald-400 hover:text-white px-5 py-3 rounded-xl transition-all flex flex-col items-center hover:scale-110 hover:shadow-xl hover:shadow-emerald-500/20 active:scale-95"
                                            >
                                                <span className="text-sm font-bold tracking-tight">
                                                    {(() => {
                                                        let timeStr = show.showTime;
                                                        if (timeStr && timeStr.length > 23) {
                                                            const parts = timeStr.split('.');
                                                            if (parts.length > 2) timeStr = `${parts[0]}.${parts[1]}`;
                                                        }
                                                        const d = new Date(timeStr);
                                                        return isNaN(d.getTime())
                                                            ? show.showTime
                                                            : d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                                                    })()}
                                                </span>
                                                <span className="text-[9px] font-semibold uppercase mt-1 opacity-60 group-hover/btn:opacity-100">
                                                    {show.type || '2D'}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                    <p className="mt-4 text-[10px] text-slate-500 italic opacity-50 font-medium">Cancellation available</p>
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className="text-center py-32 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                        <Calendar className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-white mb-2">No Shows Found</h2>
                        <p className="text-slate-500 max-w-sm mx-auto">There are no shows available for the selected date. Please try another date or location.</p>
                    </div>
                )}
            </div>

        </div>
    );
};

export default TheatreListingPage;
