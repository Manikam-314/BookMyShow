import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Share2, ChevronRight } from 'lucide-react';
import type { Movie } from '../types';
import { movieService } from '../services/movieService';



const OFFERS = [
    { id: 1, title: "YES Private Debit Card Offer", description: "Buy 1 Get 1 free movie ticket" },
    { id: 2, title: "RuPay Credit Card Offer", description: "Get 50% off up to ₹250" },
];

const CAST = [
    { name: "Dhanush", role: "Actor", img: "https://in.bmscdn.com/iedb/artist/images/website/poster/large/dhanush-602-19-09-2017-04-37-37.jpg" },
    { name: "Nithya Menen", role: "Actress", img: "https://in.bmscdn.com/iedb/artist/images/website/poster/large/nithya-menen-17369-19-09-2017-05-33-06.jpg" },
    { name: "Prakash Raj", role: "Actor", img: "https://in.bmscdn.com/iedb/artist/images/website/poster/large/prakash-raj-1555-19-09-2017-04-20-04.jpg" },
    { name: "Raashii Khanna", role: "Actress", img: "https://in.bmscdn.com/iedb/artist/images/website/poster/large/raashi-khanna-37965-19-09-2017-05-18-54.jpg" },
];

const MovieDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [movie, setMovie] = useState<Movie | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMovie = async () => {
            if (!id) return;
            try {
                const data = await movieService.getMovieById(id);
                setMovie(data);
            } catch (error) {
                console.error("Failed to fetch movie details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMovie();
    }, [id]);

    if (loading) return <div className="text-white text-center p-20">Loading movie details...</div>;
    if (!movie) return <div className="text-white text-center p-20">Movie not found</div>;

    // Hardcoded logic for "Madesh: The PlayBoy"
    const isMadesh = movie.title.toLowerCase().includes('madesh') || movie.title.toLowerCase().includes('playboy');
    const bannerImage = isMadesh ? '/assets/madesh-banner.jpg' : 'https://assets-in.bmscdn.com/iedb/movies/images/mobile/listing/xxlarge/with-love-et00385203-1707111000.jpg';
    const posterImage = isMadesh ? '/assets/madesh-poster.jpg' : movie.posterUrl;

    return (
        <div className="bg-slate-50 min-h-screen pb-20">

            {/* Banner Section */}
            <div
                className="relative w-full h-[480px] bg-cover bg-center"
                style={{ backgroundImage: `url('${bannerImage}')` }}
            >
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent"></div>

                <div className="relative max-w-7xl mx-auto px-4 h-full flex items-center gap-8">
                    {/* Poster */}
                    <div className="hidden md:block w-64 h-96 rounded-xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10 shrink-0">
                        <img src={posterImage} alt={movie.title} className="w-full h-full object-cover" />
                        <div className="bg-black text-white text-center py-2 text-xs font-medium">In cinemas</div>
                    </div>

                    {/* Details */}
                    <div className="text-white flex-1 pt-8">
                        <h1 className="text-4xl font-bold mb-4">{movie.title}</h1>

                        {/* Rating Block */}
                        <div className="flex items-center gap-4 mb-6 bg-slate-800/60 backdrop-blur-sm p-4 rounded-xl border border-white/10 w-fit">
                            <Star className="text-red-500 fill-red-500 w-8 h-8" />
                            <div>
                                <div className="font-bold text-xl">{movie.rating}/10 <span className="text-sm font-normal text-gray-400">({(movie.votes / 1000).toFixed(1)}K Votes)</span></div>
                                <div className="text-xs text-blue-400 hover:underline cursor-pointer">Rate now &gt;</div>
                            </div>
                            <button className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded text-sm font-semibold ml-4 transition-colors">
                                Rate now
                            </button>
                        </div>

                        {/* Chips */}
                        <div className="flex flex-wrap gap-3 mb-6">
                            <span className="px-3 py-1 bg-white/20 rounded text-xs font-semibold">{movie.format?.[0] || '2D'}</span>
                            <span className="px-3 py-1 bg-white/20 rounded text-xs font-semibold text-red-500 bg-red-500/10 border border-red-500/20">{movie.language}</span>
                        </div>

                        <div className="text-base font-medium mb-8">
                            {movie.duration ? `${Math.floor(movie.duration / 60)}h ${movie.duration % 60}m` : 'N/A'} • {movie.genre?.split('/')[0]} • {movie.sensorRating || 'UA'} • {movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Released'}
                        </div>

                        <button
                            onClick={() => navigate(`/buy-tickets/${movie.id}`)}
                            className="bg-red-500 hover:bg-red-600 text-white px-12 py-4 rounded-lg text-lg font-bold shadow-lg shadow-red-500/30 transition-transform hover:scale-105"
                        >
                            Book tickets
                        </button>
                    </div>

                    {/* Share Button (Top Right) */}
                    <div className="absolute top-8 right-8">
                        <button className="bg-black/40 hover:bg-black/60 p-3 rounded backdrop-blur-sm text-white flex items-center gap-2 border border-white/10 transition-colors">
                            <Share2 className="w-5 h-5" />
                            <span className="font-medium text-sm">Share</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-4 gap-12">

                {/* Left Column (Main) */}
                <div className="lg:col-span-3 space-y-12">

                    {/* About */}
                    <section>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">About the movie</h3>
                        <p className="text-gray-600 leading-relaxed text-base">
                            {movie.description}
                        </p>
                    </section>

                    {/* Offers */}
                    <section>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Top offers for you</h3>
                        <div className="bg-white text-gray-900 border border-amber-200 border-l-4 border-l-amber-500 rounded-lg p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className="bg-red-500 p-2 rounded-full">
                                    <div className="w-4 h-4 bg-white rounded-full"></div>
                                </div>
                                <div>
                                    <div className="font-bold text-base">10% Off on Movie Munchies!</div>
                                    <div className="text-sm text-gray-600">Tap to view details</div>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-500" />
                        </div>
                        <div className="mt-4 flex gap-4 overflow-x-auto pb-4">
                            {OFFERS.map(offer => (
                                <div key={offer.id} className="min-w-[300px] border border-dashed border-red-300 bg-red-50 rounded-xl p-4 flex gap-3 items-start">
                                    <div className="w-8 h-8 rounded bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                                        %
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900 text-sm">{offer.title}</div>
                                        <div className="text-xs text-gray-500 mt-1">{offer.description}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Cast */}
                    <section>
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Cast</h3>
                        <div className="flex gap-8 overflow-x-auto pb-6 scrollbar-hide">
                            {CAST.map((actor, idx) => (
                                <div key={idx} className="text-center min-w-[100px] group cursor-pointer">
                                    <div className="w-24 h-24 mx-auto rounded-full overflow-hidden mb-3 border-2 border-transparent group-hover:border-red-500 transition-colors shadow-lg">
                                        <img src={actor.img} alt={actor.name} className="w-full h-full object-cover" />
                                    </div>
                                    <h4 className="font-bold text-gray-900 text-sm">{actor.name}</h4>
                                    <p className="text-gray-500 text-xs">{actor.role}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Crew - Simplified for MVP */}
                    <section>
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Crew</h3>
                        <div className="flex gap-8">
                            <div className="text-center min-w-[100px]">
                                <div className="w-24 h-24 mx-auto rounded-full overflow-hidden mb-3 bg-gray-200 flex items-center justify-center text-gray-500">
                                    <span className="text-xs">Director</span>
                                </div>
                                <h4 className="font-bold text-gray-900 text-sm">Prem Kumar</h4>
                                <p className="text-gray-500 text-xs">Director, Writer</p>
                            </div>
                        </div>
                    </section>

                </div>

                {/* Right Column (Ads/Reviews - Placeholder) */}
                <div className="hidden lg:block">
                    <div className="bg-red-50 p-4 rounded-xl border border-red-500/10">
                        <div className="font-bold text-red-500 mb-2 text-sm">SPOTLIGHT</div>
                        <div className="text-gray-600 text-xs">
                            Check out the latest reviews and discussions about "With Love".
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default MovieDetailPage;
