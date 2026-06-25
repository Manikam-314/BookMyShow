import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://54.242.144.155:9099',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Automatically attach JWT token to every request
api.interceptors.request.use((config) => {
    const stored = localStorage.getItem('auth_user');
    if (stored) {
        try {
            const userData = JSON.parse(stored);
            if (userData?.token) {
                config.headers.Authorization = `Bearer ${userData.token}`;
            }
        } catch (error) {
            console.error("Error parsing auth_user from localStorage", error);
        }
    }
    return config;
});

// Handle 401/403 responses (e.g. token expired)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Check if the current path is already login or register to prevent redirect loops
            const isAuthRoute = window.location.pathname === '/login' || window.location.pathname.startsWith('/auth');
            if (!isAuthRoute) {
                console.error("Authentication expired or unauthorized. Logging out...");
                localStorage.removeItem('auth_user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
