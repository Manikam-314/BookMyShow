import api from './api';

export interface BookingRequest {
    userId: number;
    showId: number;
    seatsNumbers: string[]; // e.g., ["J1", "J2"] - must match backend field name
    seatType: string;       // e.g., "RECLINER", "FIRST_CLASS", "SECOND_CLASS"
}

export const bookingService = {
    bookTickets: async (bookingData: BookingRequest) => {
        const response = await api.post('/ticket/book', bookingData);
        return response.data;
    }
};
