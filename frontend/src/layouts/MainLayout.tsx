import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

const MainLayout: React.FC = () => {
    const { user } = useAuth();

    // Theatre owners should never land on the customer site
    if (user?.role === 'THEATRE_OWNER') {
        return <Navigate to="/owner/dashboard" replace />;
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 text-gray-900">
            <Navbar />
            <main className="flex-grow">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default MainLayout;
