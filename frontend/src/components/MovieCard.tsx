import React from 'react';
import { Star } from 'lucide-react';
import type { Movie } from '../types';
import { useNavigate } from 'react-router-dom';

interface MovieCardProps {
    movie: Movie;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
    const navigate = useNavigate();
    const isPromoted = movie.votes > 10000; // Mock logic for promoted badge

    return (
        <div
            className="group cursor-pointer flex flex-col h-full"
            onClick={() => navigate(`/movie/${movie.id}`)}
        >
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-3">
                <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/300x450?text=No+Image';
                    }}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Promoted Badge */}
                {isPromoted && (
                    <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg uppercase tracking-wider z-10 shadow-sm">
                        Promoted
                    </div>
                )}

                {/* Rating Overlay - Always Visible */}
                <div className="absolute bottom-0 left-0 right-0 bg-black flex justify-between items-center px-3 py-2 w-full">
                    <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-red-500 fill-red-500" />
                        <span className="text-white text-sm font-semibold">{movie.rating}/10</span>
                        <span className="text-white text-xs opacity-80">{movie.votes > 1000 ? `${(movie.votes / 1000).toFixed(1)}K` : movie.votes} Votes</span>
                    </div>
                </div>
            </div>

            <h3 className="text-gray-900 font-bold text-lg leading-tight mb-1 truncate group-hover:text-red-500 transition-colors">
                {movie.title}
            </h3>
            <p className="text-gray-500 text-sm truncate">{movie.genre}</p>
        </div>
    );
};

export default MovieCard;
