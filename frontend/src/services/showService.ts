import api from './api';
import type { Show } from '../types';

export const showService = {
    searchShows: async (city: string, movieName?: string, theaterName?: string) => {
        const params = new URLSearchParams();
        params.append("city", city);
        if (movieName) params.append("movieName", movieName);
        if (theaterName) params.append("theaterName", theaterName);

        const response = await api.get<Show[]>(`/show/search?${params.toString()}`);
        return response.data;
    },
    getShowById: async (id: string) => {
        const response = await api.get<Show>(`/show/${id}`);
        return response.data;
    },
    getSeatsForShow: async (showId: string) => {
        // As per plan /show/{id}/seats
        const response = await api.get<any>(`/show/${showId}/seats`); // specific type for seats later
        return response.data;
    },
    addShow: async (show: Partial<Show>) => {
        const response = await api.post<Show>('/show/add', show);
        return response.data;
    },
    getAvailableSlots: async (theaterId: string, date: string) => {
        console.log(`Fetching available slots for Date: ${date}, Theater ID: ${theaterId}`);
        const response = await api.get<string[]>(`/show/slots?theaterId=${theaterId}&date=${date}`);
        return response.data;
    }
};
