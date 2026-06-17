import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Info, ChevronRight, Navigation, Clock, Star } from 'lucide-react';
import { theatreService } from '../services/theatreService';
import { showService } from '../services/showService';
import type { Theatre, Show } from '../types';

const TheatreDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [theatre, setTheatre] = useState<Theatre | null>(null);
    const [shows, setShows] = useState<Show[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                const theatreData = await theatreService.getTheatreById(id);
                setTheatre(theatreData);

                if (theatreData) {
                    const showsData = await showService.searchShows("", "", theatreData.name);
                    setShows(showsData);
                }
            } catch (error) {
                console.error("Failed to fetch theatre details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                    <p className="text-slate-500 text-sm font-medium">Loading cinema details...</p>
                </div>
            </div>
        );
    }

    if (!theatre) {
        return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-xl text-slate-500 font-bold tracking-tight">Cinema not found</div>;
    }

    const showsByMovie: Record<string, Show[]> = {};
    shows.forEach(show => {
        const movieTitle = show.movie.title;
        if (!showsByMovie[movieTitle]) showsByMovie[movieTitle] = [];
        showsByMovie[movieTitle].push(show);
    });

    return (
        <div className="bg-[#0a0a0f] min-h-screen font-sans text-slate-300 pb-20">
            {/* Theatre Hero Section */}
            <div className="relative h-[400px] flex items-end overflow-hidden group">
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517604931442-710c8ef5ad25?q=80&w=2069&auto=format&fit=crop')" }} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/80 to-transparent z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f] via-transparent to-transparent z-10" />

                <div className="relative max-w-7xl mx-auto px-4 w-full pb-10 z-20">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-red-500 text-xs font-semibold tracking-wide uppercase bg-red-500/10 w-fit px-3 py-1 rounded-full border border-red-500/20">
                                <Clock className="w-3 h-3" /> Premium Partner
                            </div>
                            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-none mb-2">{theatre.name}</h1>
                            <div className="flex flex-col gap-3 text-slate-400">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <MapPin className="w-5 h-5 text-red-500 shrink-0" />
                                    <span>{theatre.address}, {theatre.city}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold tracking-wide uppercase">
                                    <Info className="w-4 h-4 text-slate-600 shrink-0" />
                                    <span>{theatre.facilities || "Dolby Atmos • 4K Laser Projection • Recliner Seats"}</span>
                                </div>
                            </div>
                        </div>
                        <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-8 py-3.5 rounded-2xl backdrop-blur-md border border-white/10 transition-all font-bold text-sm tracking-tight active:scale-95">
                            <Navigation className="w-4 h-4 text-red-500" /> Get Directions
                        </button>
                    </div>
                </div>
            </div>

            {/* Movies Running Now */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-1.5 h-8 bg-red-500 rounded-full" />
                    <div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">Now Showing</h2>
                        <p className="text-slate-500 text-sm font-medium">Experience the magic of cinema on our screens today</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    {Object.keys(showsByMovie).length > 0 ? (
                        Object.keys(showsByMovie).map(movieTitle => {
                            const movieShows = showsByMovie[movieTitle];
                            const movie = movieShows[0].movie;

                            return (
                                <div key={movie.id} className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 overflow-hidden flex flex-col md:flex-row hover:border-red-500/30 transition-all group">
                                    {/* Movie Poster */}
                                    <div className="w-full md:w-56 h-80 md:h-auto shrink-0 relative overflow-hidden">
                                        <img
                                            src={movie.posterUrl}
                                            alt={movie.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                                        <div className="absolute bottom-4 left-4 flex flex-col gap-1">
                                            <span className="bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded tracking-widest uppercase w-fit">
                                                {movie.genre?.split('/')[0] || "Featured"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Show Details */}
                                    <div className="p-8 flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                                <div>
                                                    <h3 className="text-2xl font-bold text-white tracking-tight group-hover:text-red-400 transition-colors mb-2 uppercase">{movie.title}</h3>
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                                                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> {movie.rating || "8.5"}/10
                                                        </div>
                                                        <span className="w-1 h-1 bg-slate-700 rounded-full" />
                                                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{movie.language}</span>
                                                        <span className="w-1 h-1 bg-slate-700 rounded-full" />
                                                        <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded border border-white/10 text-slate-300 font-bold">UA</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => navigate(`/movie/${movie.id}`)}
                                                    className="w-fit text-slate-400 font-bold hover:text-white text-xs flex items-center gap-1 group/link transition-colors"
                                                >
                                                    View Movie Details <ChevronRight className="w-4 h-4 text-red-500 group-hover/link:translate-x-1 transition-transform" />
                                                </button>
                                            </div>

                                            <div className="flex flex-wrap gap-4">
                                                {movieShows.map(show => (
                                                    <button
                                                        key={show.id}
                                                        onClick={() => navigate(`/book/${show.id}`)}
                                                        className="group/btn flex flex-col items-center border border-emerald-500/30 hover:border-emerald-500 bg-emerald-500/5 hover:bg-emerald-500 rounded-2xl px-6 py-3 transition-all hover:scale-105 active:scale-95 shadow-lg hover:shadow-emerald-500/20"
                                                    >
                                                        <span className="text-base font-bold text-emerald-400 group-hover/btn:text-white">
                                                            {new Date(show.showTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                        </span>
                                                        <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-500/60 group-hover/btn:text-white/70 mt-0.5">
                                                            {show.type || "2D"}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                                            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest">
                                                ⚡ Fast Filling • Best Experience Guaranteed
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-24 bg-white/5 rounded-3xl border border-white/10 border-dashed">
                            <Calendar className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-white tracking-tight mb-2 uppercase">No Shows Scheduled</h3>
                            <p className="text-slate-500 font-semibold text-sm">Our team is currently updating the schedule. Check back soon!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TheatreDetailPage;
