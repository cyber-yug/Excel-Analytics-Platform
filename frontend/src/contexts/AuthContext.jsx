import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../utils/api';

// Auth context
const AuthContext = createContext();

// Auth reducer
const authReducer = (state, action) => {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_USER':
            return { ...state, user: action.payload, isAuthenticated: !!action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload };
        case 'CLEAR_ERROR':
            return { ...state, error: null };
        case 'LOGOUT':
            return { ...state, user: null, isAuthenticated: false, error: null };
        default:
            return state;
    }
};

// Initial state
const initialState = {
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null
};

// Auth provider component
export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    const setLoading = (loading) => {
        dispatch({ type: 'SET_LOADING', payload: loading });
    };

    const setUser = (user) => {
        dispatch({ type: 'SET_USER', payload: user });
    };

    const setError = (error) => {
        dispatch({ type: 'SET_ERROR', payload: error });
    };

    const clearError = () => {
        dispatch({ type: 'CLEAR_ERROR' });
    };

    const checkAuth = useCallback(async () => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            
            // Try to refresh token and get user info
            const response = await api.post('/auth/refresh');
            dispatch({ type: 'SET_USER', payload: response.data.user });
            console.log('✅ Session restored successfully');
        } catch (error) {
            // No valid refresh token, user not logged in - this is normal on first visit
            // Only log if it's not a 401 (which is expected when not logged in)
            if (error.response?.status !== 401) {
                console.error('Auth check failed:', error.message);
            }
            // 401 is expected when not logged in, so we silently handle it
            dispatch({ type: 'LOGOUT' });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, []);
    
    // Check if user is logged in on app start
    // This useEffect must come AFTER the checkAuth function is defined
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const login = async (credentials, rememberMe = false) => {
        try {
            setLoading(true);
            clearError();
            
            const response = await api.post('/auth/login', {
                ...credentials,
                keepLoggedIn: rememberMe
            });
            
            const { user, message } = response.data;
            setUser(user);
            
            return { success: true, message };
        } catch (error) {
            console.error('Login error:', error);
            const message = error.response?.data?.error || error.message || 'Login failed';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    };

    const signup = async (userData, profilePhoto) => {
        try {
            setLoading(true);
            clearError();
            
            console.log('🚀 Starting signup process...', { userData, hasPhoto: !!profilePhoto });
            
            const formData = new FormData();
            
            // Add user data
            Object.keys(userData).forEach(key => {
                formData.append(key, userData[key]);
                console.log(`📝 Added ${key}:`, userData[key]);
            });
            
            // Add profile photo if provided
            if (profilePhoto) {
                formData.append('profilePhoto', profilePhoto);
                console.log('📸 Added profile photo:', profilePhoto.name);
            }
            
            console.log('🌐 Making API call to /auth/signup...');
            
            const response = await api.post('/auth/signup', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            console.log('✅ Signup successful:', response.data);
            
            const { user, message } = response.data;
            setUser(user);
            
            return { success: true, message };
        } catch (error) {
            console.error('❌ Signup error:', error);
            console.error('Response data:', error.response?.data);
            console.error('Status:', error.response?.status);
            const message = error.response?.data?.error || error.message || 'Signup failed';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            dispatch({ type: 'LOGOUT' });
        }
    };

    const logoutAll = async () => {
        try {
            await api.post('/auth/logout-all');
        } catch (error) {
            console.error('Logout all error:', error);
        } finally {
            dispatch({ type: 'LOGOUT' });
        }
    };

    const updateProfile = async (profileData, newPhoto) => {
        try {
            setLoading(true);
            clearError();
            
            const formData = new FormData();
            
            // Add profile data
            Object.keys(profileData).forEach(key => {
                formData.append(key, profileData[key]);
            });
            
            // Add new photo if provided
            if (newPhoto) {
                formData.append('profilePhoto', newPhoto);
            }
            
            const response = await api.put('/auth/profile', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            const { user, message } = response.data;
            setUser(user);
            
            return { success: true, message };
        } catch (error) {
            const message = error.response?.data?.message || 'Profile update failed';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    };

    const changePassword = async (currentPassword, newPassword) => {
        try {
            setLoading(true);
            clearError();
            
            const response = await api.put('/auth/change-password', {
                currentPassword,
                newPassword
            });
            
            const { message } = response.data;
            
            // Password change logs user out of all devices
            dispatch({ type: 'LOGOUT' });
            
            return { success: true, message };
        } catch (error) {
            const message = error.response?.data?.message || 'Password change failed';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    };

    const removeProfilePhoto = async () => {
        try {
            await api.delete('/auth/profile-photo');
            
            // Update user state to remove profile photo
            const updatedUser = { ...state.user };
            delete updatedUser.profilePhoto;
            setUser(updatedUser);
            
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to remove profile photo';
            setError(errorMessage);
            throw error;
        }
    };

    const value = {
        ...state,
        login,
        signup,
        logout,
        logoutAll,
        updateProfile,
        changePassword,
        removeProfilePhoto,
        clearError,
        checkAuth
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// HOC for protected routes
export const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};
