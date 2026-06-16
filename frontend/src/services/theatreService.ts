import api from './api';
import type { Theatre } from '../types';

export const theatreService = {
    getAllTheatres: async () => {
        const response = await api.get<Theatre[]>('/theater/all');
        return response.data;
    },
    getTheatreById: async (id: string) => {
        const response = await api.get<Theatre>(`/theater/${id}`);
        return response.data;
    },
    addTheatre: async (theatre: Omit<Theatre, 'id'>) => {
        const response = await api.post<Theatre>('/theater/add', theatre);
        return response.data;
    },
    updateTheatre: async (id: number, theatre: Partial<Theatre>) => {
        const response = await api.put<Theatre>(`/theater/update/${id}`, theatre);
        return response.data;
    },
    deleteTheatre: async (id: number) => {
        const response = await api.delete(`/theater/delete/${id}`);
        return response.data;
    }
};
