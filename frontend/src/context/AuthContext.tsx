import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../services/api';

interface AuthUser {
    token: string;
    role: string;       // 'ADMIN' | 'THEATRE_OWNER' | 'USER'
    email: string;
    name: string;
    userId: number;
}

interface AuthContextType {
    user: AuthUser | null;
    login: (userData: AuthUser) => void;
    logout: () => void;
    isAuthenticated: () => boolean;
    hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(() => {
        const stored = localStorage.getItem('auth_user');
        return stored ? JSON.parse(stored) : null;
    });

    // Inject JWT into every axios request when user is logged in
    useEffect(() => {
        if (user?.token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
        } else {
            delete api.defaults.headers.common['Authorization'];
        }
    }, [user]);

    const login = (userData: AuthUser) => {
        console.log("Logged in user:", userData);
        setUser(userData);
        localStorage.setItem('auth_user', JSON.stringify(userData));
        if (userData.token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('auth_user');
        delete api.defaults.headers.common['Authorization'];
    };

    const isAuthenticated = () => !!user;
    const hasRole = (role: string) => {
        const match = user?.role === role;
        console.log(`Checking role: ${role}. Current user role: ${user?.role}. Match: ${match}`);
        return match;
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated, hasRole }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
