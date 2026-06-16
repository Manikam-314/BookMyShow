import React, { useEffect, useState } from 'react';
import { Search, ChevronDown, Menu, MapPin, LogOut, Film, X, Ticket } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import LocationModal from './LocationModal';
import { useAuth } from '../context/AuthContext';
import { searchService } from '../services/searchService';
import type { MovieIndex } from '../types';

const roleBadge: Record<string, string> = {
    ADMIN: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    THEATRE_OWNER: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    USER: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
};

const NAV_LINKS = [
    { label: 'Movies', href: '/movies' },
    { label: 'Events', href: '/events' },
    { label: 'Sports', href: '/sports' },
    { label: 'Activities', href: '/activities' },
];
const Navbar: React.FC = () => {
    const [selectedCity, setSelectedCity] = useState(() => {
        return localStorage.getItem('user_city') || 'Mumbai';
    });
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<MovieIndex[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);

    // Debounced search logic
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.length >= 2) {
                setIsSearching(true);
                const results = await searchService.search(searchQuery);
                setSearchResults(results);
                setIsSearching(false);
                setShowResults(true);
            } else {
                setSearchResults([]);
                setShowResults(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    // Close results dropdown when path changes
    useEffect(() => {
        setShowResults(false);
        setSearchQuery('');
    }, [location.pathname]);

    // Darken navbar on scroll
    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handler, { passive: true });
        return () => window.removeEventListener('scroll', handler);
    }, []);

    const handleCitySelect = (city: string) => {
        setIsLocationModalOpen(false);
        setIsUpdatingLocation(true);
        setTimeout(() => {
            setSelectedCity(city);
            localStorage.setItem('user_city', city);
            setIsUpdatingLocation(false);
            window.dispatchEvent(new Event('city_changed'));
        }, 1200);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isActive = (href: string) =>
        location.pathname === href || location.pathname.startsWith(href + '/');

    return (
        <>
            {/* Location update toast */}
            {isUpdatingLocation && (
                <div className="fixed inset-0 z-[70] flex items-end justify-center pb-8 pointer-events-none">
                    <div className="bg-slate-800 border border-white/10 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in">
                        <MapPin className="w-4 h-4 text-red-400 fill-red-400 animate-bounce flex-shrink-0" />
                        <span className="text-sm font-medium">Location updated to <span className="text-red-400 font-bold">{selectedCity}</span></span>
                    </div>
                </div>
            )}

            <LocationModal
                isOpen={isLocationModalOpen}
                onClose={() => setIsLocationModalOpen(false)}
                onSelectCity={handleCitySelect}
            />

            {/* Mobile menu overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-[60] md:hidden">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
                    <div className="absolute top-0 right-0 w-72 h-full bg-slate-900 border-l border-white/10 p-6 flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <span className="text-white font-bold text-lg">Menu</span>
                            <button onClick={() => setMobileMenuOpen(false)}>
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        <div className="border-t border-white/10 pt-4 relative">
                            <div className="relative w-full mb-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search movies..."
                                    className="w-full bg-white/5 border border-white/10 text-white text-sm placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>
                            
                            {/* Mobile Results */}
                            {showResults && searchResults.length > 0 && (
                                <div className="mb-4 max-h-60 overflow-y-auto bg-white/5 rounded-xl border border-white/10 divide-y divide-white/5">
                                    {searchResults.slice(0, 5).map(result => (
                                        <button 
                                            key={result.id}
                                            onClick={() => {
                                                navigate(`/movie/${result.movieId}`);
                                                setMobileMenuOpen(false);
                                            }}
                                            className="w-full p-3 text-left hover:bg-white/5 transition-colors"
                                        >
                                            <p className="text-sm font-medium text-white">{result.movieTitle}</p>
                                            <p className="text-[10px] text-slate-500">{result.theaterName}</p>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {NAV_LINKS.map(l => (
                                <Link key={l.label} to={l.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block py-2 text-slate-300 hover:text-white text-base font-medium transition-colors">
                                    {l.label}
                                </Link>
                            ))}
                        </div>
                        <div className="border-t border-white/10 pt-4 flex flex-col gap-3">
                            {user ? (
                                <>
                                    <span className="text-slate-400 text-sm">{user.name}</span>
                                    <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 text-sm">
                                        <LogOut className="w-4 h-4" /> Sign Out
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}
                                        className="bg-red-500 text-white text-center py-2.5 rounded-lg font-semibold">
                                        Sign In
                                    </Link>
                                    <Link to="/theatre/register" onClick={() => setMobileMenuOpen(false)}
                                        className="text-slate-400 text-center text-sm hover:text-white">
                                        List Your Theatre
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <nav className={`sticky top-0 z-50 w-full bg-[#0a0a0f] transition-all duration-500 ${scrolled
                ? 'border-b border-white/10 shadow-xl shadow-black/40'
                : 'border-b border-transparent'
                }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center h-16 gap-6">

                        {/* Logo */}
                        <Link to="/" className="flex-shrink-0 flex items-center gap-2.5 group">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-500/30">
                                <Film className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-lg font-bold tracking-tight">
                                <span className="text-white">Movie</span>
                                <span className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">Booky</span>
                            </span>
                        </Link>

                        {/* Search bar */}
                        <div className="hidden md:flex flex-1 max-w-md relative">
                            <div className="relative w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search movies, theatres, cities..."
                                    className="w-full bg-white/5 border border-white/10 text-white text-sm placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/40 focus:bg-white/8 transition-all"
                                />
                                {isSearching && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <div className="w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>

                            {/* Search Results Dropdown */}
                            {showResults && searchResults.length > 0 && (
                                <div className="absolute top-full left-0 w-full mt-2 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[100]">
                                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                        <div className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-white/5 bg-white/5">
                                            Top Matches
                                        </div>
                                        {searchResults.map((result) => (
                                            <button
                                                key={result.id}
                                                onClick={() => navigate(`/movie/${result.movieId}`)}
                                                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 group text-left"
                                            >
                                                <div className="w-8 h-10 rounded bg-slate-800 flex items-center justify-center flex-shrink-0 group-hover:bg-red-500/20 transition-colors">
                                                    <Film className="w-4 h-4 text-slate-500 group-hover:text-red-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-white truncate group-hover:text-red-400 transition-colors">
                                                        {result.movieTitle}
                                                    </p>
                                                    <p className="text-[11px] text-slate-400 truncate flex items-center gap-2">
                                                        <MapPin className="w-3 h-3 text-slate-600" />
                                                        {result.theaterName} • <span className="text-slate-500">{result.city}</span>
                                                    </p>
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="text-[10px] bg-white/10 text-slate-300 px-1.5 py-0.5 rounded font-bold">
                                                        {result.rating}
                                                    </span>
                                                    <span className="text-[9px] text-slate-500 italic">
                                                        {result.genre}
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {showResults && searchResults.length === 0 && !isSearching && searchQuery.length >= 2 && (
                                <div className="absolute top-full left-0 w-full mt-2 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-8 text-center animate-in fade-in slide-in-from-top-2 duration-200 z-[100]">
                                    <Search className="w-8 h-8 text-slate-700 mx-auto mb-3" />
                                    <p className="text-slate-400 text-sm italic">No results found for "{searchQuery}"</p>
                                </div>
                            )}
                        </div>

                        {/* Nav links (desktop) */}
                        <div className="hidden md:flex items-center gap-1">
                            {NAV_LINKS.map(l => (
                                <Link key={l.label} to={l.href}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isActive(l.href)
                                        ? 'text-white bg-white/10'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        }`}>
                                    {l.label}
                                </Link>
                            ))}
                        </div>

                        {/* Spacer */}
                        <div className="flex-1" />

                        {/* City picker */}
                        <button
                            onClick={() => setIsLocationModalOpen(true)}
                            className="hidden md:flex items-center gap-1.5 text-sm text-slate-300 hover:text-white transition-colors"
                        >
                            <MapPin className="w-3.5 h-3.5 text-red-400" />
                            <span>{selectedCity}</span>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                        </button>

                        {/* Right actions */}
                        <div className="hidden md:flex items-center gap-2">
                            {user ? (
                                <>
                                    {(user.role === 'ADMIN') && (
                                        <Link to="/admin"
                                            className="text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-lg border border-purple-500/30 text-purple-300 hover:bg-purple-500/10 transition-colors">
                                            Admin
                                        </Link>
                                    )}
                                    {(user.role === 'THEATRE_OWNER') && (
                                        <Link to="/owner/dashboard"
                                            className="text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-lg border border-amber-500/30 text-amber-300 hover:bg-amber-500/10 transition-colors">
                                            Dashboard
                                        </Link>
                                    )}
                                    <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${roleBadge[user.role] || 'bg-gray-800 text-gray-400 border-gray-600'}`}>
                                            {user.role === 'THEATRE_OWNER' ? 'OWNER' : user.role}
                                        </span>
                                        <span className="flex items-center gap-1.5 text-sm text-slate-300 font-medium">
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-xs font-bold text-white">
                                                {user.name?.charAt(0).toUpperCase()}
                                            </div>
                                            {user.name}
                                        </span>
                                        <button onClick={handleLogout}
                                            className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-400 transition-colors border border-white/10 hover:border-red-500/30 px-2 py-1.5 rounded-lg">
                                            <LogOut className="w-3 h-3" /> Out
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Link to="/theatre/register"
                                        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors font-medium">
                                        <Ticket className="w-4 h-4" /> List Theatre
                                    </Link>
                                    <Link to="/login"
                                        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-5 py-2 rounded-xl text-sm font-bold transition-all hover:shadow-lg hover:shadow-red-500/25">
                                        Sign In
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile hamburger */}
                        <button className="md:hidden text-slate-400 hover:text-white transition-colors"
                            onClick={() => setMobileMenuOpen(true)}>
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Navbar;
