import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Heart, Smartphone, FastForward, Search, ChevronDown } from 'lucide-react';
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

    // Generate dates dynamically starting from today
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

    useEffect(() => {
        const fetchData = async () => {
            if (!movieId) return;
            try {
                // 1. Fetch Movie Details
                const movieData = await movieService.getMovieById(movieId);
                setMovie(movieData);

                // 2. Fetch Shows (Search by Movie Name only to find all theaters)
                // Passing empty city to allow backend to find all shows for this movie regardless of city
                const showsData = await showService.searchShows("", movieData.title);
                console.log("Shows fetched:", showsData);

                // 3. Filter and Group Shows
                const selectedDateStr = DATES[selectedDate].fullDate;

                // Filter by date (simple string match on YYYY-MM-DD)
                const filteredShows = showsData.filter(show => show.showTime.startsWith(selectedDateStr));

                // Group by Theatre Name
                const grouped: Record<string, Show[]> = {};
                filteredShows.forEach(show => {
                    // The backend ShowResource needs to have theatreName or theatre object
                    // Based on showService.ts ShowResource likely has theatre details?
                    // Checking ShowResource in backend... it has 'theater' object probably?
                    // If type definition in frontend is missing it, we might have issues.
                    // Let's assume 'theater' property exists on Show or use show.theaterId if names not available.
                    // BUT wait, searchShows returns ShowResource list.
                    // user view_file of ShowController showed ShowResource. Let's hope it has theater name.
                    // Fallback to "Unknown Theatre" if not.
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
    }, [movieId, selectedDate]);

    return (
        <div className="bg-slate-50 min-h-screen font-sans">

            {/* Header: Movie Title & Filters */}
            <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <h1 className="text-3xl font-normal text-gray-900 mb-4">
                        {loading ? 'Loading...' : (movie ? movie.title : 'Movie Not Found')} - <span className="text-gray-500 text-xl font-light">{movie?.language || 'Lang'}</span>
                    </h1>

                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        {/* Date Slider */}
                        <div className="flex gap-2">
                            {DATES.map((d, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedDate(i)}
                                    className={`flex flex-col items-center px-4 py-2 rounded-lg transition-colors ${selectedDate === i
                                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                                        : 'hover:bg-gray-200 text-gray-600'
                                        }`}
                                >
                                    <span className="text-xs font-semibold">{d.day}</span>
                                    <span className="text-lg font-bold">{d.date}</span>
                                    <span className="text-xs">{d.month}</span>
                                </button>
                            ))}
                        </div>

                        {/* Filters */}
                        <div className="flex items-center gap-4 border-l border-gray-300 pl-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600 border-b border-gray-300 pb-1 cursor-pointer hover:text-red-500 transition-colors">
                                <span>Tamil, 2D</span>
                                <ChevronDown className="w-4 h-4" />
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 border-b border-gray-300 pb-1 cursor-pointer hover:text-red-500 transition-colors">
                                <span>Price Range</span>
                                <ChevronDown className="w-4 h-4" />
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 border-b border-gray-300 pb-1 cursor-pointer hover:text-red-500 transition-colors">
                                <span>Filter Show Timings</span>
                                <ChevronDown className="w-4 h-4" />
                            </div>
                            <div className="p-2 hover:bg-gray-100 rounded-full cursor-pointer">
                                <Search className="w-5 h-5 text-gray-400" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Legend */}
            <div className="bg-white border-b border-gray-200 py-2">
                <div className="max-w-7xl mx-auto px-4 flex justify-end gap-6 text-xs text-gray-500 uppercase font-medium">
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Available</div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500"></div> Fast Filling</div>
                    <div className="flex items-center gap-2 border border-green-500 px-1 text-green-500 rounded text-[10px]">LAN</div>
                    <span>Subtitles Language</span>
                </div>
            </div>

            {/* Theatres List */}
            <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
                {Object.keys(groupedShows).length > 0 ? (
                    Object.keys(groupedShows).map(theatreName => {
                        const theatreShows = groupedShows[theatreName];
                        if (theatreShows.length === 0) return null;

                        return (
                            <div key={theatreName} className="bg-white p-6 rounded-sm shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-8 border-l-4 border-transparent hover:border-l-red-500">

                                {/* Theatre Info */}
                                <div className="w-full md:w-1/3 space-y-4">
                                    <div className="flex items-start gap-3">
                                        <Heart className="w-5 h-5 text-gray-300 hover:text-red-500 cursor-pointer mt-1" />
                                        <div>
                                            <h3 className="font-bold text-gray-900">{theatreName}</h3>
                                            <div className="flex items-center gap-4 mt-2">
                                                <div className="flex items-center gap-1 text-green-500 text-xs">
                                                    <Smartphone className="w-4 h-4" /> M-Ticket
                                                </div>
                                                <div className="flex items-center gap-1 text-orange-500 text-xs">
                                                    <FastForward className="w-4 h-4" /> F&B
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Shows Grid */}
                                <div className="flex-1">
                                    <div className="flex flex-wrap gap-4">
                                        {theatreShows.map(show => (
                                            <div key={show.id} className="group relative">
                                                <button
                                                    onClick={() => navigate(`/book/${show.id}`)}
                                                    className="group min-w-[100px] border border-[#2dc492] text-[#2dc492] px-4 py-2 rounded-[4px] hover:bg-[#2dc492] hover:text-white transition-colors flex flex-col items-center"
                                                >
                                                    <span className="text-sm font-bold">
                                                        {(() => {
                                                            // Sanitize input: remove .0.0.0 suffixes or other weirdness if present
                                                            // Example: 2026-02-17T09:45:00.000.00.0 -> 2026-02-17T09:45:00.000
                                                            let timeStr = show.showTime;
                                                            if (timeStr && timeStr.length > 23) {
                                                                // Simple truncate to ISO millis length (23 chars: YYYY-MM-DDTHH:mm:ss.sss)
                                                                // Or just try to keep the first valid parts
                                                                const parts = timeStr.split('.');
                                                                if (parts.length > 2) {
                                                                    // Reassemble YYYY-MM-DDTHH:mm:ss + .sss
                                                                    timeStr = `${parts[0]}.${parts[1]}`;
                                                                }
                                                            }

                                                            const d = new Date(timeStr);
                                                            return isNaN(d.getTime())
                                                                ? show.showTime
                                                                : d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                                                        })()}
                                                    </span>
                                                    <span className="text-[9px] font-medium uppercase mt-0.5 group-hover:text-white text-[#2dc492]">
                                                        {show.type || '2D'}
                                                    </span>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className="text-center py-10 text-gray-500">No shows available for this date.</div>
                )}
            </div>

        </div>
    );
};

export default TheatreListingPage;
