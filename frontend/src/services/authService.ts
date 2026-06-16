import api from './api';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface UserRegisterRequest {
    name: string;
    email: string;
    phone: string;
    password: string;
    otp: string;
}

export interface AuthResponse {
    token: string;
    role: string;
    email: string;
    name: string;
    userId: number;
}

export interface TheatreRegisterRequest {
    theatreName: string;
    ownerName: string;
    email: string;
    phone: string;
    city: string;
    address: string;
    screensCount: number;
    verificationDocUrl?: string;
    password: string;
    otp: string;
}

export const authService = {
    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const response = await api.post('/auth/login', data);
        return response.data;
    },

    register: async (data: UserRegisterRequest): Promise<AuthResponse> => {
        const response = await api.post('/auth/register', data);
        return response.data;
    },

    registerTheatre: async (data: TheatreRegisterRequest): Promise<AuthResponse> => {
        const response = await api.post('/auth/register-theatre', data);
        return response.data;
    },

    requestOtp: async (email: string): Promise<void> => {
        await api.post(`/auth/request-otp?email=${email}`);
    },
};
