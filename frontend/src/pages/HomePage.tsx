import React from 'react';
import MovieCard from '../components/MovieCard';
import type { Movie } from '../types';



import { movieService } from '../services/movieService';

const HomePage: React.FC = () => {
    const [movies, setMovies] = React.useState<Movie[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchMovies = async () => {
            try {
                const data = await movieService.getAllMovies();
                setMovies(data);
            } catch (error) {
                console.error("Failed to fetch movies:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMovies();
    }, []);
    // ... (imports remain same)

    return (
        <div className="text-gray-900 font-sans bg-slate-50 pb-12">

            {/* Hero Section / Carousel */}
            <div className="w-full bg-gray-100 mb-8">
                <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden">
                    {/* Carousel Slides */}
                    <div className="absolute inset-0 flex transition-transform duration-500 ease-in-out">
                        {/* Static Banner 1 - Ensuring professional look */}
                        <div className="w-full h-full flex-shrink-0 relative">
                            <img
                                src="https://assets-in.bmscdn.com/promotions/cms/creatives/1706382336630_web.jpg"
                                alt="Banner 1"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent flex flex-col justify-center px-8 md:px-16 text-white">
                                <h1 className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-md">Endless Entertainment</h1>
                                <p className="text-lg md:text-xl font-light mb-6 opacity-90">Experience the magic of cinema.</p>
                                <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-lg w-fit transition-all shadow-lg hover:shadow-red-500/30">
                                    Book Now
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Placeholder for Carousel indicators if needed later */}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                {/* Filters & Content Layout */}
                <div className="flex flex-col md:flex-row gap-8">

                    {/* Filters Sidebar */}
                    <div className="hidden md:block w-64 flex-shrink-0">
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 sticky top-24">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-lg text-gray-900">Filters</h3>
                                <button className="text-sm text-gray-500 hover:text-red-500">Clear</button>
                            </div>

                            {/* Accordion Items for Filters */}
                            <div className="space-y-4">
                                <div className="border-b border-gray-200 pb-4">
                                    <h4 className="font-medium text-red-500 mb-2 flex justify-between cursor-pointer">
                                        Languages <span className="text-gray-400 text-xs">Clear</span>
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {['Tamil', 'English', 'Hindi', 'Telugu'].map(lang => (
                                            <span key={lang} className="px-3 py-1 border border-gray-300 text-gray-600 text-xs rounded hover:bg-red-50 hover:border-red-500 cursor-pointer transition-colors">
                                                {lang}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="border-b border-gray-200 pb-4">
                                    <h4 className="font-medium text-gray-900 mb-2">Genres</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {['Action', 'Drama', 'Comedy', 'Thriller'].map(g => (
                                            <span key={g} className="px-3 py-1 border border-gray-300 text-gray-600 text-xs rounded hover:bg-gray-50 cursor-pointer">
                                                {g}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button className="w-full mt-6 py-2 border border-red-500 text-red-500 rounded text-sm font-semibold hover:bg-red-50 transition-colors">
                                Browse by Cinemas
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">

                        {/* Recommended Movies Section */}
                        <div className="flex justify-between items-end mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Recommended Movies</h2>
                            <a href="/movies" className="text-red-500 text-sm font-medium hover:underline flex items-center gap-1">
                                See All ›
                            </a>
                        </div>

                        {/* Movies Grid */}
                        {loading ? (
                            <div className="text-gray-500 text-center py-20">Loading movies...</div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
                                {movies.length > 0 ? movies.map((movie) => (
                                    <MovieCard key={movie.id} movie={movie} />
                                )) : (
                                    <div className="col-span-full text-center text-gray-400 py-10">
                                        No movies found. Add some from the Admin Panel!
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Coming Soon / Banner Section */}
                        <div className="bg-slate-800 rounded-xl p-8 mb-12 flex items-center justify-between relative overflow-hidden group cursor-pointer hover:bg-slate-750 transition-colors">
                            <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-red-600/20 to-transparent"></div>
                            <div className="relative z-10">
                                <h3 className="text-2xl font-bold text-white mb-2">Coming Soon</h3>
                                <p className="text-gray-400 text-sm">Explore movies releasing next week</p>
                            </div>
                            <div className="relative z-10 text-red-400 font-semibold group-hover:text-red-300 transition-colors flex items-center gap-2">
                                Explore Upcoming Movies <span>›</span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
