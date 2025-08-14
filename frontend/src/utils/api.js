import axios from 'axios';

// Create axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
    withCredentials: true, // Include cookies (refresh token)
    timeout: 10000
});

console.log('🌐 API Base URL:', import.meta.env.VITE_API_URL || 'http://localhost:3001/api');

// In-memory storage for access token
let accessToken = null;

// Set access token
export const setAccessToken = (token) => {
    accessToken = token;
};

// Get access token
export const getAccessToken = () => {
    return accessToken;
};

// Clear access token
export const clearAccessToken = () => {
    accessToken = null;
};

// Request interceptor to add auth header
api.interceptors.request.use(
    (config) => {
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and we haven't already tried to refresh and not a refresh endpoint itself
        if (
            error.response?.status === 401 && 
            !originalRequest._retry && 
            !originalRequest.url.includes('/auth/refresh')
        ) {
            originalRequest._retry = true;

            try {
                // Attempt to refresh token
                const refreshResponse = await axios.post(
                    `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/auth/refresh`,
                    {},
                    { withCredentials: true }
                );

                const newAccessToken = refreshResponse.data.accessToken;
                setAccessToken(newAccessToken);

                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(originalRequest);

            } catch (refreshError) {
                // Refresh failed, clear token but don't auto-redirect
                // This prevents infinite redirects and allows routes to handle authentication state
                clearAccessToken();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// Auth API methods
export const authAPI = {
    // Login
    login: async (emailOrUsername, password, keepLoggedIn = false) => {
        const response = await api.post('/auth/login', {
            emailOrUsername,
            password,
            keepLoggedIn
        });
        
        if (response.data.accessToken) {
            setAccessToken(response.data.accessToken);
        }
        
        return response.data;
    },

    // Signup
    signup: async (userData, profilePhoto = null) => {
        const formData = new FormData();
        
        // Add user data
        Object.keys(userData).forEach(key => {
            formData.append(key, userData[key]);
        });
        
        // Add profile photo if provided
        if (profilePhoto) {
            formData.append('profilePhoto', profilePhoto);
        }

        const response = await api.post('/auth/signup', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        
        if (response.data.accessToken) {
            setAccessToken(response.data.accessToken);
        }
        
        return response.data;
    },

    // Logout
    logout: async () => {
        try {
            await api.post('/auth/logout');
        } finally {
            clearAccessToken();
        }
    },

    // Logout from all devices
    logoutAll: async () => {
        try {
            await api.post('/auth/logout-all');
        } finally {
            clearAccessToken();
        }
    },

    // Get current user
    getMe: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    // Update profile
    updateProfile: async (profileData, profilePhoto = null) => {
        const formData = new FormData();
        
        Object.keys(profileData).forEach(key => {
            if (profileData[key] !== undefined && profileData[key] !== null) {
                formData.append(key, profileData[key]);
            }
        });
        
        if (profilePhoto) {
            formData.append('profilePhoto', profilePhoto);
        }

        const response = await api.put('/auth/profile', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        
        return response.data;
    },

    // Remove profile photo
    removeProfilePhoto: async () => {
        const response = await api.delete('/auth/profile-photo');
        return response.data;
    },

    // Refresh token (manual call if needed)
    refresh: async () => {
        const response = await api.post('/auth/refresh');
        
        if (response.data.accessToken) {
            setAccessToken(response.data.accessToken);
        }
        
        return response.data;
    }
};

// File upload API (existing functionality with auth)
export const fileAPI = {
    // Upload file
    upload: async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        
        return response.data;
    },

    // Get files
    getFiles: async () => {
        const response = await api.get('/upload/files');
        return response.data;
    },

    // Get specific file
    getFile: async (fileId) => {
        const response = await api.get(`/upload/files/${fileId}`);
        return response.data;
    }
};

// Analytics API
export const analyticsAPI = {
    // Get stats
    getStats: async (fileId) => {
        const response = await api.get(`/analytics/stats/${fileId}`);
        return response.data;
    },

    // Generate chart
    generateChart: async (fileId, chartConfig) => {
        const response = await api.post(`/analytics/chart/${fileId}`, chartConfig);
        return response.data;
    },

    // Get suggestions
    getSuggestions: async (fileId) => {
        const response = await api.get(`/analytics/suggest/${fileId}`);
        return response.data;
    }
};

export default api;
