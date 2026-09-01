import axios from 'axios';

// Get API URL from env or use default localhost during development
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        let token = null;
        try {
            const session = localStorage.getItem('mock_current_session');
            if (session) {
                const parsed = JSON.parse(session);
                token = parsed.token;
            }
        } catch(e) {}
        
        if (!token) {
            token = localStorage.getItem('token');
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for global errors
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Handle unauthorized globally, maybe emit an event or clear token
            localStorage.removeItem('mock_current_session');
            localStorage.removeItem('token');
            // window.location.href = '/login'; // Un-comment if strict redirect is needed
        }
        return Promise.reject(error);
    }
);

export default apiClient;
