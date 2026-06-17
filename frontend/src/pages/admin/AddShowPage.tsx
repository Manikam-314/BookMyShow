import React, { useState } from 'react';
import { Save } from 'lucide-react';

import { movieService } from '../../services/movieService';
import { theatreService } from '../../services/theatreService';
import { showService } from '../../services/showService';
import type { Movie, Theatre } from '../../types';

const AddShowPage: React.FC = () => {
    const [formData, setFormData] = useState({
        movieId: '', theatreId: '', date: '', priceMin: '', priceMax: ''
    });
    const [movies, setMovies] = useState<Movie[]>([]);
    const [theatres, setTheatres] = useState<Theatre[]>([]);

    React.useEffect(() => {
        const fetchResources = async () => {
            try {
                const [moviesData, theatresData] = await Promise.all([
                    movieService.getAllMovies(),
                    theatreService.getAllTheatres()
                ]);
                setMovies(moviesData);
                setTheatres(theatresData);
            } catch (error) {
                console.error("Failed to load resources:", error);
            }
        };
        fetchResources();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [selectedSlots, setSelectedSlots] = useState<string[]>([]);

    // Fetch available slots when Theatre and Date are selected
    React.useEffect(() => {
        if (formData.theatreId && formData.date) {
            const fetchSlots = async () => {
                try {
                    const slots = await showService.getAvailableSlots(formData.theatreId, formData.date);
                    setAvailableSlots(slots);
                } catch (error) {
                    console.error("Failed to fetch slots", error);
                }
            };
            fetchSlots();
        }
    }, [formData.theatreId, formData.date]);

    // Handle slot toggling
    const toggleSlot = (slot: string) => {
        if (selectedSlots.includes(slot)) {
            setSelectedSlots(selectedSlots.filter(s => s !== slot));
        } else {
            setSelectedSlots([...selectedSlots, slot]);
        }
    };

    const formatTimeStrictly = (timeRaw: string): string | null => {
        try {
            // Remove any whitespace
            const time = timeRaw.trim();

            let hours: number;
            let minutes: number;

            if (time.includes(':')) {
                const parts = time.split(':');
                hours = parseInt(parts[0], 10);
                minutes = parseInt(parts[1], 10);
            } else {
                // Assume hours if no colon
                hours = parseInt(time, 10);
                minutes = 0;
            }

            if (isNaN(hours) || hours < 0 || hours > 23) return null;
            if (isNaN(minutes) || minutes < 0 || minutes > 59) return null;

            // Strict HH:mm:ss format
            const hh = hours.toString().padStart(2, '0');
            const mm = minutes.toString().padStart(2, '0');

            return `${hh}:${mm}:00`;
        } catch (e) {
            return null;
        }
    };

    // Update handleSubmit to use the correct format and batching
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedSlots.length === 0) {
            alert("Please select at least one time slot.");
            return;
        }

        try {
            // Create a promise for each selected slot
            const validRequests = selectedSlots.map(time => {
                const formattedTime = formatTimeStrictly(time);
                if (!formattedTime) {
                    console.warn(`Skipping invalid time format: ${time}`);
                    return null;
                }

                const isoDateTime = `${formData.date}T${formattedTime}`;

                return showService.addShow({
                    movieId: Number(formData.movieId),
                    theaterId: Number(formData.theatreId),
                    showTime: isoDateTime,
                    minPrice: Number(formData.priceMin),
                    maxPrice: Number(formData.priceMax)
                });
            }).filter(Boolean); // Filter out nulls

            if (validRequests.length === 0) {
                alert("No valid time slots selected. Please check formatting.");
                return;
            }

            // @ts-ignore
            await Promise.all(validRequests);

            alert(`${validRequests.length} Shows Scheduled Successfully!`);

            // Refresh slots
            const slots = await showService.getAvailableSlots(formData.theatreId, formData.date);
            setAvailableSlots(slots);
            setSelectedSlots([]); // Clear selection

        } catch (error: any) {
            console.error("Failed to add shows:", error);
            const msg = error.response?.data?.message || "Check console for details.";
            alert(`Failed to add shows: ${msg}`);
        }
    };

    const [existingShows, setExistingShows] = useState<any[]>([]);
    const [showScheduleModal, setShowScheduleModal] = useState(false);

    const fetchExistingShows = async () => {
        if (!formData.theatreId) {
            alert("Please select a theatre first.");
            return;
        }
        try {
            const theatre = theatres.find(t => t.id === Number(formData.theatreId));
            if (!theatre) return;

            // Search shows by theater name
            const shows = await showService.searchShows("", "", theatre.name);

            // Filter by selected date if available, otherwise show all upcoming?
            // User likely wants to see schedule for the selected date to avoid checking.
            let filtered = shows;
            if (formData.date) {
                filtered = shows.filter(s => s.showTime.startsWith(formData.date));
            }
            // Sort by time
            filtered.sort((a, b) => new Date(a.showTime).getTime() - new Date(b.showTime).getTime());

            setExistingShows(filtered);
            setShowScheduleModal(true);
        } catch (error) {
            console.error("Failed to fetch existing shows", error);
            alert("Could not load schedule.");
        }
    };

    return (
        <div className="max-w-4xl mx-auto relative">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Schedule New Show</h2>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Movie</label>
                        <select name="movieId" required onChange={handleChange} className="w-full p-3 border rounded-lg dark:bg-slate-900 dark:border-gray-600 dark:text-white">
                            <option value="">Choose a movie...</option>
                            {movies.map(movie => (
                                <option key={movie.id} value={movie.id}>{movie.title}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Theatre</label>
                        <select name="theatreId" required onChange={handleChange} className="w-full p-3 border rounded-lg dark:bg-slate-900 dark:border-gray-600 dark:text-white">
                            <option value="">Choose a theatre...</option>
                            {theatres.map(theatre => (
                                <option key={theatre.id} value={theatre.id}>{theatre.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                        <input type="date" name="date" required onChange={handleChange} className="w-full p-3 border rounded-lg dark:bg-slate-900 dark:border-gray-600 dark:text-white" />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Available Time Slots</label>
                            <button type="button" onClick={fetchExistingShows} className="text-xs text-blue-500 hover:text-blue-600 underline">
                                Check Existing Schedule
                            </button>
                        </div>
                        {availableSlots.length > 0 ? (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {availableSlots.map(slot => (
                                    <button
                                        key={slot}
                                        type="button"
                                        onClick={() => toggleSlot(slot)}
                                        className={`px-4 py-2 rounded-lg border transition-all ${selectedSlots.includes(slot)
                                            ? 'bg-red-500 text-white border-red-500 shadow-md transform scale-105'
                                            : 'bg-gray-100 dark:bg-slate-700 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                                            }`}
                                    >
                                        {slot}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="mt-2 text-sm text-gray-500">
                                {formData.theatreId && formData.date ? "No standard slots available or configured for this theatre." : "Select Theatre and Date first."}
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Price (₹)</label>
                        <input type="number" name="priceMin" required onChange={handleChange} className="w-full p-3 border rounded-lg dark:bg-slate-900 dark:border-gray-600 dark:text-white" placeholder="60" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Price (₹)</label>
                        <input type="number" name="priceMax" required onChange={handleChange} className="w-full p-3 border rounded-lg dark:bg-slate-900 dark:border-gray-600 dark:text-white" placeholder="200" />
                    </div>
                </div>

                <div className="flex justify-end gap-4 border-t border-gray-200 dark:border-gray-700 pt-6">
                    <button type="button" className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                    <button type="submit" className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold shadow-lg shadow-red-500/20 transition-transform active:scale-95 flex items-center gap-2">
                        <Save className="w-4 h-4" /> Schedule Show
                    </button>
                </div>

            </form>

            {/* Existing Shows Schedule Modal */}
            {showScheduleModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Existing Schedule</h3>
                            <button onClick={() => setShowScheduleModal(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                                X
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            {existingShows.length === 0 ? (
                                <div className="text-center text-gray-500 py-8">No shows scheduled for this date.</div>
                            ) : (
                                <div className="space-y-4">
                                    {existingShows.map((show, idx) => (
                                        <div key={idx} className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-slate-900">
                                            <div className="text-lg font-bold text-red-500 w-24">
                                                {new Date(show.showTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-bold text-gray-900 dark:text-white">{show.movie?.title || "Unknown Movie"}</div>
                                                <div className="text-sm text-gray-500">{show.type || "2D"} • {show.language}</div>
                                            </div>
                                            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                ₹{show.minPrice} - ₹{show.maxPrice}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-900 text-right">
                            <button onClick={() => setShowScheduleModal(false)} className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddShowPage;
