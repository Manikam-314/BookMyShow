import api from './api';
import type { MovieIndex } from '../types';

/**
 * Service to handle Elasticsearch search queries.
 */
export const searchService = {
    /**
     * Search movies, theatres, or cities via the unified Elasticsearch index.
     * @param query The search string
     */
    search: async (query: string): Promise<MovieIndex[]> => {
        try {
            const response = await api.get<MovieIndex[]>(`/api/search`, {
                params: { q: query }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching search results:', error);
            return [];
        }
    }
};

export default searchService;

