import api from './api';

export const paymentService = {
    createOrder: async (amount: number, bookingResource: any) => {
        try {
            const response = await api.post('/payment/create-order', { amount, bookingResource });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    verifyPayment: async (verificationData: any) => {
        try {
            const response = await api.post('/payment/verify', verificationData);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};
