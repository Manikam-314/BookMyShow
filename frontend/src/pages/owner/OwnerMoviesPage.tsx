import React, { useEffect, useState } from 'react';
import { Film, Star, Clock, Search, AlertTriangle } from 'lucide-react';
import { movieService } from '../../services/movieService';
import { useOwner } from '../../context/OwnerContext';
import type { Movie } from '../../types';

const NotApprovedGuard: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-10 max-w-md">
            <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h2 className="text-white font-bold text-xl mb-2">Feature Locked</h2>
            <p className="text-slate-400 text-sm leading-relaxed">{message}</p>
        </div>
    </div>
);

const OwnerMoviesPage: React.FC = () => {
    const { isApproved, loading: ownerLoading } = useOwner();
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (!isApproved) return;
        movieService.getAllMovies()
            .then(setMovies)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [isApproved]);

    if (ownerLoading) return (
        <div className="flex items-center justify-center py-24">
            <div className="animate-spin h-10 w-10 border-4 border-red-500 border-t-transparent rounded-full" />
        </div>
    );

    if (!isApproved) return (
        <NotApprovedGuard message="Your theatre is under review. You can browse and schedule movies once an admin approves your application." />
    );

    const filtered = movies.filter(m =>
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        m.genre?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Available Movies</h1>
                    <p className="text-slate-400 text-sm mt-0.5">Browse movies available to schedule at your theatre</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search movies..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/40 w-64"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <div className="animate-spin h-10 w-10 border-4 border-red-500 border-t-transparent rounded-full" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20">
                    <Film className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-500">No movies found{search ? ` for "${search}"` : ''}.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filtered.map(movie => (
                        <div
                            key={movie.id}
                            className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-red-500/30 hover:bg-white/8 transition-all group"
                        >
                            {/* Poster */}
                            <div className="aspect-[2/3] relative bg-slate-800 overflow-hidden">
                                {movie.posterUrl ? (
                                    <img
                                        src={movie.posterUrl}
                                        alt={movie.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Film className="w-10 h-10 text-slate-600" />
                                    </div>
                                )}
                                {movie.sensorRating && (
                                    <span className="absolute top-2 left-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded font-bold">
                                        {movie.sensorRating}
                                    </span>
                                )}
                            </div>

                            {/* Info */}
                            <div className="p-3">
                                <h3 className="text-white text-sm font-semibold leading-tight line-clamp-2 mb-1">{movie.title}</h3>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500 text-xs">{movie.language}</span>
                                    {movie.rating > 0 && (
                                        <div className="flex items-center gap-1">
                                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                            <span className="text-yellow-400 text-xs font-medium">{movie.rating.toFixed(1)}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-1 mt-1">
                                    <Clock className="w-3 h-3 text-slate-600" />
                                    <span className="text-slate-500 text-xs">{movie.duration} min</span>
                                    <span className="text-slate-700 mx-1">•</span>
                                    <span className="text-slate-500 text-xs">{movie.genre}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OwnerMoviesPage;
