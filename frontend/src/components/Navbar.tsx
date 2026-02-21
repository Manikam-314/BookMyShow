import React, { useState } from 'react';
import { Search, ChevronDown, Menu, MapPin, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import LocationModal from './LocationModal';

const Navbar: React.FC = () => {
    const [selectedCity, setSelectedCity] = useState('Mumbai');
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);

    const handleCitySelect = (city: string) => {
        setIsLocationModalOpen(false);
        setIsUpdatingLocation(true);

        // Simulate loading state
        setTimeout(() => {
            setSelectedCity(city);
            setIsUpdatingLocation(false);
        }, 1500);
    };

    return (
        <>
            {/* Location Update Loader Overlay */}
            {isUpdatingLocation && (
                <div className="fixed inset-0 z-[70] bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-200">
                    <div className="bg-slate-900 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-red-500 fill-red-500 animate-bounce" />
                        <span className="font-medium">Your location is updated to {selectedCity}.</span>
                    </div>
                </div>
            )}

            <LocationModal
                isOpen={isLocationModalOpen}
                onClose={() => setIsLocationModalOpen(false)}
                onSelectCity={handleCitySelect}
            />

            <nav className="bg-white text-gray-900 sticky top-0 z-50 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo and Search */}
                        <div className="flex items-center gap-8 flex-1">
                            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                                <span className="text-2xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                                    MovieBooky
                                </span>
                            </Link>

                            <div className="hidden md:block flex-1 max-w-xl">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-red-300 focus:ring-1 focus:ring-red-200 sm:text-sm transition-colors duration-200"
                                        placeholder="Search for Movies, Events, Plays, Sports and Activities"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right actions */}
                        <div className="flex items-center gap-6">
                            <div
                                onClick={() => setIsLocationModalOpen(true)}
                                className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 cursor-pointer transition-colors"
                            >
                                <span>{selectedCity}</span>
                                <ChevronDown className="h-4 w-4" />
                            </div>

                            <Link to="/admin" className="hidden md:flex bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-1.5 rounded text-xs font-semibold tracking-wide transition-colors border border-gray-200">
                                Admin
                            </Link>
                            <button className="hidden md:flex bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded text-xs font-semibold tracking-wide transition-colors shadow-lg shadow-red-500/20">
                                Sign In
                            </button>

                            <div className="md:hidden">
                                <Menu className="h-6 w-6 text-gray-700" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Secondary Navbar for Categories (Desktop) */}
                <div className="hidden md:block bg-gray-50 text-sm border-t border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between py-2">
                            <div className="flex gap-6 text-gray-600">
                                <Link to="/movies" className="hover:text-gray-900 transition-colors">Movies</Link>
                                <Link to="/stream" className="hover:text-gray-900 transition-colors">Stream</Link>
                                <Link to="/events" className="hover:text-gray-900 transition-colors">Events</Link>
                                <Link to="/sports" className="hover:text-gray-900 transition-colors">Sports</Link>
                                <Link to="/activities" className="hover:text-gray-900 transition-colors">Activities</Link>
                            </div>
                            <div className="flex gap-6 text-gray-600">
                                <Link to="/list-show" className="hover:text-gray-900 transition-colors">ListYourShow</Link>
                                <Link to="/corporates" className="hover:text-gray-900 transition-colors">Corporates</Link>
                                <Link to="/offers" className="hover:text-gray-900 transition-colors">Offers</Link>
                                <Link to="/gift-cards" className="hover:text-gray-900 transition-colors">Gift Cards</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Navbar;
