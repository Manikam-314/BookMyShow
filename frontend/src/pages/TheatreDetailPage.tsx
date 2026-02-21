import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Info, Film, ChevronRight } from 'lucide-react';
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
                // Fetch Theatre Details
                const theatreData = await theatreService.getTheatreById(id);
                setTheatre(theatreData);

                // Fetch Shows for this Theatre
                // Backend: searchShows(movieName, cityName, theaterName)
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
        return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div></div>;
    }

    if (!theatre) {
        return <div className="min-h-screen flex items-center justify-center text-xl text-gray-600">Theatre not found</div>;
    }

    // Group shows by Movie
    const showsByMovie: Record<string, Show[]> = {};
    shows.forEach(show => {
        const movieTitle = show.movie.title;
        if (!showsByMovie[movieTitle]) {
            showsByMovie[movieTitle] = [];
        }
        showsByMovie[movieTitle].push(show);
    });

    return (
        <div className="bg-slate-50 min-h-screen font-sans pb-20">
            {/* Theatre Hero Section */}
            <div className="bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent z-10"></div>
                {/* Fallback pattern or image */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517604931442-710c8ef5ad25?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center opacity-30"></div>

                <div className="max-w-7xl mx-auto px-4 py-16 relative z-20 flex flex-col md:flex-row items-end gap-8">
                    <div className="flex-1">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">{theatre.name}</h1>
                        <div className="flex flex-col gap-2 text-gray-300">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-red-500" />
                                <span>{theatre.address}, {theatre.city}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Info className="w-5 h-5 text-blue-400" />
                                <span>{theatre.facilities || "Dolby Atmos, 4K Projection, Recliner Seats"}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg backdrop-blur-sm border border-white/20 transition-colors">
                            Get Directions
                        </button>
                    </div>
                </div>
            </div>

            {/* Movies Running Now */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                    <Film className="w-6 h-6 text-red-500" /> Now Showing
                </h2>

                <div className="grid grid-cols-1 gap-8">
                    {Object.keys(showsByMovie).length > 0 ? (
                        Object.keys(showsByMovie).map(movieTitle => {
                            const movieShows = showsByMovie[movieTitle];
                            const movie = movieShows[0].movie; // Get movie details from first show

                            return (
                                <div key={movie.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row hover:shadow-md transition-shadow">
                                    {/* Movie Poster */}
                                    <div className="w-full md:w-48 h-64 md:h-auto shrink-0 relative">
                                        <img
                                            src={movie.posterUrl}
                                            alt={movie.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-md">
                                            {movie.genre}
                                        </div>
                                    </div>

                                    {/* Show Details */}
                                    <div className="p-6 flex-1 flex flex-col justify-between">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">{movie.title}</h3>
                                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                                                <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700 font-medium">UA</span>
                                                <span>{movie.language}</span>
                                            </div>

                                            <div className="flex flex-wrap gap-4">
                                                {movieShows.map(show => (
                                                    <button
                                                        key={show.id}
                                                        onClick={() => navigate(`/book/${show.id}`)}
                                                        className="group flex flex-col items-center border border-green-500/30 hover:border-green-500 bg-green-50 hover:bg-green-500 rounded-lg px-4 py-2 transition-all"
                                                    >
                                                        <span className="text-sm font-bold text-green-700 group-hover:text-white">
                                                            {new Date(show.showTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        <span className="text-[10px] uppercase text-green-600 group-hover:text-green-100">
                                                            {show.type || "2D"}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                                            <div className="text-sm text-gray-500">
                                                Based on your selection
                                            </div>
                                            <button
                                                onClick={() => navigate(`/movie/${movie.id}`)}
                                                className="text-red-500 font-medium hover:text-red-600 text-sm flex items-center gap-1"
                                            >
                                                View Movie Details <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">No shows scheduled for today.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TheatreDetailPage;
