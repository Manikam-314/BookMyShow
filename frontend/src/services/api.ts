import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:9099', // Adjust if backend runs on a different port
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
