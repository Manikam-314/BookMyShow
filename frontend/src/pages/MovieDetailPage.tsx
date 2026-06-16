import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Share2, ChevronRight, Clock, Tag, Clapperboard, Ticket } from 'lucide-react';
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

    if (loading) return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                <p className="text-slate-400 text-sm">Loading movie details...</p>
            </div>
        </div>
    );

    if (!movie) return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-slate-400">
            Movie not found
        </div>
    );

    // Use actual movie banner/poster or reliable placeholders if missing
    const bannerImage = movie.bannerUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=2070';
    const posterImage = movie.posterUrl || 'https://via.placeholder.com/208x320/1a1a2e/ffffff?text=No+Poster';

    const durationStr = movie.duration
        ? `${Math.floor(movie.duration / 60)}h ${movie.duration % 60}m`
        : 'N/A';
    const releaseDateStr = movie.releaseDate
        ? new Date(movie.releaseDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        : 'Released';

    return (
        <div className="bg-[#0a0a0f] min-h-screen pb-24">

            {/* ── Hero Banner ── */}
            <div className="relative w-full h-[520px]">
                {/* Blurred background image */}
                <div
                    className="absolute inset-0 bg-cover bg-center scale-105"
                    style={{ backgroundImage: `url('${bannerImage}')`, filter: 'blur(2px) brightness(0.35)' }}
                />
                {/* Bottom fade to page bg */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/20 to-transparent" />
                {/* Left-to-right vignette */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f]/80 via-transparent to-transparent" />

                <div className="relative max-w-7xl mx-auto px-4 h-full flex items-end pb-10 gap-8">
                    {/* Poster card */}
                    <div className="hidden md:flex flex-col shrink-0 w-52 rounded-2xl overflow-hidden shadow-2xl shadow-black/60 border border-white/10">
                        <img
                            src={posterImage}
                            alt={movie.title}
                            className="w-full h-80 object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/208x320/1a1a2e/ffffff?text=No+Poster'; }}
                        />
                        <div className="bg-red-600 text-white text-center py-2 text-xs font-bold tracking-wide">
                            NOW SHOWING
                        </div>
                    </div>

                    {/* Info */}
                    <div className="text-white flex-1 space-y-4">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{movie.title}</h1>

                        {/* Meta chips */}
                        <div className="flex flex-wrap gap-2 text-xs">
                            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10 font-semibold">
                                {movie.format?.[0] || '2D'}
                            </span>
                            {movie.language && (
                                <span className="px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-300 font-semibold">
                                    {movie.language}
                                </span>
                            )}
                            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10 font-semibold">
                                {movie.sensorRating || 'UA'}
                            </span>
                        </div>

                        {/* Details row */}
                        <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm">
                            <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-slate-500" /> {durationStr}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Tag className="w-3.5 h-3.5 text-slate-500" /> {movie.genre?.split('/')[0] || 'Drama'}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Clapperboard className="w-3.5 h-3.5 text-slate-500" /> {releaseDateStr}
                            </span>
                        </div>

                        {/* Rating block */}
                        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3 w-fit backdrop-blur-sm">
                            <Star className="text-amber-400 fill-amber-400 w-6 h-6 shrink-0" />
                            <div>
                                <span className="font-bold text-lg">{movie.rating}/10</span>
                                <span className="text-slate-400 text-sm ml-2">({(movie.votes / 1000).toFixed(1)}K Votes)</span>
                            </div>
                            <button className="ml-2 text-xs text-red-400 hover:text-red-300 border border-red-500/30 px-3 py-1.5 rounded-lg transition-colors hover:bg-red-500/10">
                                Rate now
                            </button>
                        </div>

                        {/* CTA */}
                        <button
                            onClick={() => navigate(`/buy-tickets/${movie.id}`)}
                            className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-10 py-3.5 rounded-xl text-base font-bold shadow-xl shadow-red-500/30 transition-all hover:scale-105 hover:shadow-red-500/40"
                        >
                            <Ticket className="w-5 h-5" /> Book Tickets
                        </button>
                    </div>

                    {/* Share */}
                    <button className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 p-2.5 rounded-xl text-white flex items-center gap-2 transition-colors text-sm">
                        <Share2 className="w-4 h-4" /> Share
                    </button>
                </div>
            </div>

            {/* ── Body ── */}
            <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-4 gap-10">

                {/* Main column */}
                <div className="lg:col-span-3 space-y-12">

                    {/* About */}
                    <section>
                        <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                            <span className="w-1 h-5 bg-red-500 rounded-full inline-block" />
                            About the movie
                        </h2>
                        <p className="text-slate-400 leading-relaxed">{movie.description}</p>
                    </section>

                    {/* Offers */}
                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <span className="w-1 h-5 bg-red-500 rounded-full inline-block" />
                            Top offers for you
                        </h2>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-white/8 transition-colors mb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-9 h-9 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                                    %
                                </div>
                                <div>
                                    <div className="font-bold text-white text-sm">10% Off on Movie Munchies!</div>
                                    <div className="text-xs text-slate-500">Tap to view details</div>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-500" />
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                            {OFFERS.map(offer => (
                                <div key={offer.id} className="min-w-[280px] border border-red-500/20 bg-red-500/5 rounded-xl p-4 flex gap-3 items-start hover:bg-red-500/10 transition-colors cursor-pointer">
                                    <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400 font-bold shrink-0 text-sm">%</div>
                                    <div>
                                        <div className="font-bold text-white text-sm">{offer.title}</div>
                                        <div className="text-xs text-slate-500 mt-1">{offer.description}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Cast */}
                    <section>
                        <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
                            <span className="w-1 h-5 bg-red-500 rounded-full inline-block" />
                            Cast
                        </h2>
                        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                            {CAST.map((actor, idx) => (
                                <div key={idx} className="text-center min-w-[96px] group cursor-pointer">
                                    <div className="w-20 h-20 mx-auto rounded-full overflow-hidden mb-2 border-2 border-white/10 group-hover:border-red-500 transition-colors shadow-lg">
                                        <img src={actor.img} alt={actor.name} className="w-full h-full object-cover" />
                                    </div>
                                    <h4 className="font-semibold text-white text-xs leading-tight">{actor.name}</h4>
                                    <p className="text-slate-500 text-[11px]">{actor.role}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Crew */}
                    <section>
                        <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
                            <span className="w-1 h-5 bg-red-500 rounded-full inline-block" />
                            Crew
                        </h2>
                        <div className="flex gap-6">
                            <div className="text-center min-w-[96px]">
                                <div className="w-20 h-20 mx-auto rounded-full overflow-hidden mb-2 border-2 border-white/10 bg-white/5 flex items-center justify-center">
                                    <span className="text-[10px] text-slate-500">Director</span>
                                </div>
                                <h4 className="font-semibold text-white text-xs">Prem Kumar</h4>
                                <p className="text-slate-500 text-[11px]">Director, Writer</p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Sidebar */}
                <div className="hidden lg:block space-y-4">
                    <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                        <div className="font-bold text-red-400 mb-2 text-xs uppercase tracking-widest">Spotlight</div>
                        <div className="text-slate-400 text-xs leading-relaxed">
                            Check out the latest reviews and discussions about "{movie.title}".
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-red-500/10 to-red-900/5 border border-red-500/20 p-4 rounded-xl">
                        <div className="font-bold text-white text-sm mb-1">🎬 Now in Cinemas</div>
                        <div className="text-slate-400 text-xs">Book your preferred seats before they fill up!</div>
                        <button
                            onClick={() => navigate(`/buy-tickets/${movie.id}`)}
                            className="mt-3 w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-xs font-bold transition-colors"
                        >
                            Book Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MovieDetailPage;
