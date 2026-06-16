import axios from 'axios';

const API_URL = 'http://localhost:9099/payment';

export const paymentService = {
    createOrder: async (amount: number, bookingResource: any) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/create-order`, 
                { amount, bookingResource },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    verifyPayment: async (verificationData: any) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/verify`, 
                verificationData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};
