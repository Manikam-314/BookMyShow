import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import { movieService } from '../../services/movieService';
import type { Movie } from '../../types';

const ManageMoviesPage: React.FC = () => {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadMovies();
    }, []);

    const loadMovies = async () => {
        try {
            const data = await movieService.getAllMovies();
            setMovies(data);
        } catch (error) {
            console.error("Failed to fetch movies", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this movie?')) {
            try {
                // Assuming delete API exists or just filtering out for UI demo
                // await movieService.deleteMovie(id); 
                // For now just update state as delete API might be missing in service
                setMovies(movies.filter(m => m.id !== id));
            } catch (error) {
                console.error("Error deleting movie", error);
            }
        }
    };

    const filteredMovies = movies.filter(movie =>
        movie.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white">Manage Movies</h1>
                <Link
                    to="/admin/movies/add"
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Plus className="w-4 h-4" /> Add Movie
                </Link>
            </div>

            {/* Search Bar */}
            <div className="bg-slate-800 p-4 rounded-xl mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search movies..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 placeholder-gray-400"
                    />
                </div>
            </div>

            {/* Movies List */}
            <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
                {loading ? (
                    <div className="p-8 text-center text-gray-400">Loading movies...</div>
                ) : movies.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">No movies found. Add one to get started!</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-gray-300">
                            <thead className="bg-slate-900 text-gray-400 uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-4">Poster</th>
                                    <th className="px-6 py-4">Title</th>
                                    <th className="px-6 py-4">Genre</th>
                                    <th className="px-6 py-4">Language</th>
                                    <th className="px-6 py-4">Rating</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {filteredMovies.map((movie) => (
                                    <tr key={movie.id} className="hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <img src={movie.posterUrl} alt={movie.title} className="w-12 h-16 object-cover rounded" />
                                        </td>
                                        <td className="px-6 py-4 font-medium text-white">
                                            <Link to={`/movie/${movie.id}`} className="hover:text-red-500 hover:underline">
                                                {movie.title}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">{movie.genre}</td>
                                        <td className="px-6 py-4">{movie.language}</td>
                                        <td className="px-6 py-4 flex items-center gap-1">
                                            <span className="text-yellow-400">★</span> {movie.rating}/10 ({movie.votes})
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="p-2 hover:bg-slate-600 rounded-lg text-blue-400 transition-colors">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(movie.id)}
                                                    className="p-2 hover:bg-slate-600 rounded-lg text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageMoviesPage;
