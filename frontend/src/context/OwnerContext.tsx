import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import api from '../services/api';
import type { Theatre } from '../types';

export interface TheatreApplication {
    id: number;
    theatreName: string;
    ownerName: string;
    email: string;
    city: string;
    address: string;
    screensCount: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
    rejectionReason?: string;
    createdAt: string;
}

interface OwnerContextType {
    app: TheatreApplication | null;
    myTheatre: Theatre | null;
    loading: boolean;
    isApproved: boolean;
    refetch: () => void;
}

const OwnerContext = createContext<OwnerContextType | undefined>(undefined);

/** Ensures the auth header is set from localStorage before any request fires. */
const ensureAuthHeader = () => {
    if (!api.defaults.headers.common['Authorization']) {
        const stored = localStorage.getItem('auth_user');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed?.token) {
                api.defaults.headers.common['Authorization'] = `Bearer ${parsed.token}`;
            }
        }
    }
};

export const OwnerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [app, setApp] = useState<TheatreApplication | null>(null);
    const [myTheatre, setMyTheatre] = useState<Theatre | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        // Fix: ensure JWT header is set before any API call (prevents refresh blank page)
        ensureAuthHeader();
        try {
            // 1. Get the owner's application status
            const { data: appData } = await api.get<TheatreApplication>('/theater/owner/status');
            setApp(appData);

            // 2. If APPROVED → use the backend endpoint to reliably get the Theatre entity
            //    (no fragile name-matching on the client side)
            if (appData.status === 'APPROVED') {
                try {
                    const { data: theatreData } = await api.get<Theatre>('/theater/owner/my-theatre');
                    setMyTheatre(theatreData);
                } catch {
                    // Theatre entity not yet created — treat as no theatre
                    setMyTheatre(null);
                }
            } else {
                setMyTheatre(null);
            }
        } catch {
            setApp(null);
            setMyTheatre(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    return (
        <OwnerContext.Provider value={{
            app,
            myTheatre,
            loading,
            isApproved: app?.status === 'APPROVED',
            refetch: fetchData,
        }}>
            {children}
        </OwnerContext.Provider>
    );
};

export const useOwner = (): OwnerContextType => {
    const ctx = useContext(OwnerContext);
    if (!ctx) throw new Error('useOwner must be used inside OwnerProvider');
    return ctx;
};
