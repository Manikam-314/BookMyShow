import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ChevronRight, Play, Ticket, MapPin, TrendingUp, Film, Zap } from 'lucide-react';
import { movieService } from '../services/movieService';
import type { Movie } from '../types';

// ─── Hero slides ────────────────────────────────────────────────────────────
const HERO_SLIDES = [
    {
        bg: 'from-purple-900 via-slate-900 to-black',
        accent: '#a855f7',
        tag: 'NOW SHOWING',
        title: 'Endless Entertainment',
        sub: 'Book seats for the hottest movies in your city — instant confirmation.',
        cta: 'Browse Movies',
        href: '/movies',
    },
    {
        bg: 'from-red-900 via-slate-900 to-black',
        accent: '#ef4444',
        tag: 'LIVE EXPERIENCE',
        title: 'Premium Cinema\nAt Your Fingertips',
        sub: 'From blockbusters to indie gems, your perfect movie night starts here.',
        cta: 'Find Shows',
        href: '/movies',
    },
    {
        bg: 'from-blue-900 via-slate-900 to-black',
        accent: '#3b82f6',
        tag: 'EXCLUSIVE',
        title: 'Recliner. IMAX. 4DX.',
        sub: 'Choose your format, choose your seats — seamless booking in seconds.',
        cta: 'Book Now',
        href: '/movies',
    },
];

// ─── Genres ─────────────────────────────────────────────────────────────────
const GENRES = ['All', 'Action', 'Drama', 'Comedy', 'Thriller', 'Horror', 'Romance', 'Sci-Fi'];

// ─── Stat cards ─────────────────────────────────────────────────────────────
const STATS = [
    { icon: Film, label: 'Movies', value: '500+', color: 'text-purple-400' },
    { icon: MapPin, label: 'Cities', value: '50+', color: 'text-red-400' },
    { icon: Ticket, label: 'Shows Daily', value: '1000+', color: 'text-amber-400' },
    { icon: TrendingUp, label: 'Tickets Booked', value: '10M+', color: 'text-emerald-400' },
];

// ─── Movie Card ──────────────────────────────────────────────────────────────
const PremiumMovieCard: React.FC<{ movie: Movie; index: number }> = ({ movie, index }) => {
    const navigate = useNavigate();
    const [imgError, setImgError] = useState(false);
    const delay = `${index * 60}ms`;

    return (
        <div
            onClick={() => navigate(`/movie/${movie.id}`)}
            className="group cursor-pointer rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-white/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50"
            style={{ animationDelay: delay }}
        >
            {/* Poster */}
            <div className="relative aspect-[2/3] overflow-hidden bg-slate-800">
                {!imgError && movie.posterUrl ? (
                    <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        onError={() => setImgError(true)}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                        <Film className="w-12 h-12 text-slate-600 mb-2" />
                        <span className="text-slate-500 text-xs text-center px-3 leading-tight">{movie.title}</span>
                    </div>
                )}

                {/* Hover play overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-red-500/90 flex items-center justify-center shadow-xl">
                        <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                    </div>
                </div>

                {/* Rating chip */}
                <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-full px-2 py-0.5">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-white text-xs font-bold">{movie.rating}</span>
                </div>

                {/* Genre chip */}
                {movie.genre && (
                    <div className="absolute top-2 right-2 bg-red-500/80 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full">
                        {movie.genre.split(',')[0]?.trim()}
                    </div>
                )}

                {/* Bottom gradient */}
                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent" />
            </div>

            {/* Info */}
            <div className="p-3">
                <h3 className="text-white font-bold text-sm leading-tight mb-1 truncate group-hover:text-red-400 transition-colors">
                    {movie.title}
                </h3>
                <div className="flex items-center justify-between">
                    <p className="text-slate-500 text-xs truncate">{movie.language || 'Multi-language'}</p>
                    <div className="flex items-center gap-1 text-slate-500 text-xs">
                        <span>{movie.votes > 1000 ? `${(movie.votes / 1000).toFixed(1)}K` : movie.votes}</span>
                        <span className="text-slate-700">votes</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Page ────────────────────────────────────────────────────────────────────
const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeGenre, setActiveGenre] = useState('All');
    const [heroIndex, setHeroIndex] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Auto-rotate hero
    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setHeroIndex(p => (p + 1) % HERO_SLIDES.length);
        }, 5000);
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, []);

    useEffect(() => {
        movieService.getAllMovies()
            .then(setMovies)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const slide = HERO_SLIDES[heroIndex];

    const filtered = activeGenre === 'All'
        ? movies
        : movies.filter(m => m.genre?.toLowerCase().includes(activeGenre.toLowerCase()));

    return (
        <div className="bg-[#0a0a0f] min-h-screen text-white font-sans">

            {/* ── HERO ─────────────────────────────────────────────────────── */}
            <div className="relative w-full h-[480px] md:h-[560px] overflow-hidden">
                {/* Animated gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${slide.bg} transition-all duration-1000`} />

                {/* Cinema reel decorative circles */}
                <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full opacity-10"
                    style={{ background: `radial-gradient(circle, ${slide.accent}, transparent 70%)` }} />
                <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full opacity-10"
                    style={{ background: `radial-gradient(circle, ${slide.accent}, transparent 70%)` }} />

                {/* Film strip top bar */}
                <div className="absolute top-0 left-0 right-0 h-6 flex gap-1 overflow-hidden opacity-20">
                    {Array.from({ length: 40 }).map((_, i) => (
                        <div key={i} className="w-8 h-full bg-white/30 flex-shrink-0 rounded-sm" />
                    ))}
                </div>

                {/* Content */}
                <div className="relative z-10 h-full max-w-7xl mx-auto px-6 flex flex-col justify-center">
                    <div key={heroIndex} className="animate-fade-in">
                        <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest mb-4 px-3 py-1.5 rounded-full bg-white/10 border border-white/20"
                            style={{ color: slide.accent }}>
                            <Zap className="w-3 h-3" /> {slide.tag}
                        </span>
                        <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-4 max-w-2xl" style={{ whiteSpace: 'pre-line' }}>
                            {slide.title}
                        </h1>
                        <p className="text-slate-400 text-base md:text-lg max-w-lg mb-8 leading-relaxed">
                            {slide.sub}
                        </p>
                        <div className="flex items-center gap-4 flex-wrap">
                            <button
                                onClick={() => navigate(slide.href)}
                                className="flex items-center gap-2 text-white font-bold px-7 py-3.5 rounded-xl transition-all hover:scale-105 hover:shadow-xl shadow-lg"
                                style={{ background: `linear-gradient(135deg, ${slide.accent}, ${slide.accent}bb)` }}
                            >
                                <Ticket className="w-4 h-4" /> {slide.cta}
                            </button>
                            <button
                                onClick={() => navigate('/movies')}
                                className="flex items-center gap-2 text-white/70 hover:text-white border border-white/20 hover:border-white/40 font-medium px-6 py-3.5 rounded-xl transition-all"
                            >
                                <Film className="w-4 h-4" /> All Movies
                            </button>
                        </div>
                    </div>
                </div>

                {/* Hero slide indicators */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {HERO_SLIDES.map((_, i) => (
                        <button key={i} onClick={() => setHeroIndex(i)}
                            className="h-1.5 rounded-full transition-all duration-300"
                            style={{
                                width: i === heroIndex ? '2rem' : '0.5rem',
                                background: i === heroIndex ? slide.accent : 'rgba(255,255,255,0.3)'
                            }} />
                    ))}
                </div>

                {/* Bottom fade */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
            </div>

            {/* ── STATS BAR ────────────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-6 -mt-6 mb-12 relative z-10">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {STATS.map(s => (
                        <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3 backdrop-blur-sm hover:border-white/20 transition-all">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                                <s.icon className={`w-5 h-5 ${s.color}`} />
                            </div>
                            <div>
                                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                                <p className="text-slate-500 text-xs">{s.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── MOVIES SECTION ───────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-6 pb-16">

                {/* Section header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Now Showing</h2>
                        <p className="text-slate-500 text-sm mt-0.5">
                            {filtered.length} movie{filtered.length !== 1 ? 's' : ''} available
                        </p>
                    </div>
                    <button onClick={() => navigate('/movies')}
                        className="flex items-center gap-1 text-red-400 hover:text-red-300 text-sm font-semibold transition-colors">
                        See All <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Genre filter chips */}
                <div className="flex gap-2 overflow-x-auto pb-3 mb-8 scrollbar-hide">
                    {GENRES.map(genre => (
                        <button
                            key={genre}
                            onClick={() => setActiveGenre(genre)}
                            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${activeGenre === genre
                                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/10'
                                }`}
                        >
                            {genre}
                        </button>
                    ))}
                </div>

                {/* Movie grid */}
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden animate-pulse">
                                <div className="aspect-[2/3] bg-white/5" />
                                <div className="p-3 space-y-2">
                                    <div className="h-3 bg-white/5 rounded w-3/4" />
                                    <div className="h-2.5 bg-white/5 rounded w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-24">
                        <Film className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                        <p className="text-slate-500 text-lg font-medium">No {activeGenre} movies found</p>
                        <button onClick={() => setActiveGenre('All')} className="mt-4 text-red-400 text-sm hover:underline">
                            Clear filter
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {filtered.map((movie, index) => (
                            <PremiumMovieCard key={movie.id} movie={movie} index={index} />
                        ))}
                    </div>
                )}

                {/* CTA Banner */}
                {!loading && movies.length > 0 && (
                    <div className="mt-12 rounded-2xl overflow-hidden relative" style={{
                        background: 'linear-gradient(135deg, #1e1b4b 0%, #0a0a0f 50%, #1a0505 100%)'
                    }}>
                        <div className="absolute inset-0 opacity-30"
                            style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #7c3aed33, transparent 50%), radial-gradient(circle at 80% 50%, #dc262633, transparent 50%)' }} />
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 p-8 md:p-10">
                            <div>
                                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Own a Theatre?</h3>
                                <p className="text-slate-400 max-w-md">Partner with MovieBooky — list your theatre, schedule shows and manage bookings all in one place.</p>
                            </div>
                            <button
                                onClick={() => navigate('/owner/register')}
                                className="flex-shrink-0 flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold px-8 py-4 rounded-xl transition-all hover:scale-105 hover:shadow-xl shadow-red-500/30 whitespace-nowrap"
                            >
                                <Ticket className="w-5 h-5" /> Register Theatre
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomePage;
