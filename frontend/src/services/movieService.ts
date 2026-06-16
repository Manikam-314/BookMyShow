import api from './api';
import type { Movie } from '../types';

export const movieService = {
    getAllMovies: async () => {
        const response = await api.get<Movie[]>('/movie/all');
        return response.data;
    },
    getMovieById: async (id: string) => {
        try {
            const response = await api.get<Movie>(`/movie/${id}`);
            const movie = response.data;

            // Hardcode images for "Madesh: The PlayBoy"
            if (movie.title && (movie.title.toLowerCase().includes('madesh') || movie.title.toLowerCase().includes('playboy'))) {
                movie.posterUrl = '/assets/madesh-poster.jpg';
                // If the Movie type has a banner field, we could set it too, but we'll handle banner in UI
            }
            return movie;
        } catch (error) {
            console.error("Error fetching movie:", error);
            throw error;
        }
    },
    searchMovies: async (keyword: string) => {
        const response = await api.get<Movie[]>(`/movie/search?keyword=${keyword}`);
        return response.data;
    },
    addMovie: async (movie: Omit<Movie, 'id'>) => {
        const response = await api.post<Movie>('/movie/add', movie);
        return response.data;
    }
};
