import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { movieService } from '../../services/movieService';
import { theatreService } from '../../services/theatreService';
import { showService } from '../../services/showService';
import type { Movie, Theatre, Show } from '../../types';
import CustomDatePicker from '../../components/CustomDatePicker';
import TimeInputWithSchedule from '../../components/TimeInputWithSchedule';
import TheatreScheduleModal from '../../components/TheatreScheduleModal';

interface ShowRow {
    id: number;
    movieId: string;
    time: string;
    priceMin: string;
    priceMax: string;
}

const BulkSchedulePage: React.FC = () => {
    const [theatres, setTheatres] = useState<Theatre[]>([]);
    const [movies, setMovies] = useState<Movie[]>([]);
    const [selectedTheatreId, setSelectedTheatreId] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [existingShows, setExistingShows] = useState<Show[]>([]);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

    // Rows state
    const [rows, setRows] = useState<ShowRow[]>([
        { id: 1, movieId: '', time: '', priceMin: '', priceMax: '' }
    ]);

    useEffect(() => {
        const loadResources = async () => {
            try {
                const [tData, mData] = await Promise.all([
                    theatreService.getAllTheatres(),
                    movieService.getAllMovies()
                ]);
                setTheatres(tData);
                setMovies(mData);
            } catch (error) {
                console.error("Failed to load resources", error);
            }
        };
        loadResources();
    }, []);

    // Fetch existing shows when theatre or date changes
    useEffect(() => {
        const fetchSchedule = async () => {
            if (!selectedTheatreId || !selectedDate) {
                setExistingShows([]);
                return;
            }
            try {
                const theatre = theatres.find(t => t.id === Number(selectedTheatreId));
                if (theatre) {
                    const allShows = await showService.searchShows("", "", theatre.name);
                    const dailyShows = allShows.filter(s => s.showTime.startsWith(selectedDate));
                    setExistingShows(dailyShows);
                }
            } catch (error) {
                console.error("Failed to fetch schedule", error);
            }
        };
        fetchSchedule();
    }, [selectedTheatreId, selectedDate, theatres]);

    const addRow = () => {
        const newId = rows.length > 0 ? Math.max(...rows.map(r => r.id)) + 1 : 1;
        setRows([...rows, { id: newId, movieId: '', time: '', priceMin: '', priceMax: '' }]);
    };

    const removeRow = (id: number) => {
        if (rows.length === 1) return;
        setRows(rows.filter(r => r.id !== id));
    };

    const updateRow = (id: number, field: keyof ShowRow, value: string) => {
        setRows(rows.map(r => r.id === id ? { ...r, [field]: value } : r));
    };

    const handleSubmit = async () => {
        if (!selectedTheatreId || !selectedDate) {
            alert("Please select a theatre and date.");
            return;
        }

        const validRows = rows.filter(r => r.movieId && r.time && r.priceMin && r.priceMax);
        if (validRows.length === 0) {
            alert("Please fill in at least one show detail.");
            return;
        }

        try {
            const promises = validRows.map(row => {
                // Construct ISO Date Time
                // Assuming time is HH:mm
                const dateTime = `${selectedDate}T${row.time}:00`;

                return showService.addShow({
                    movieId: Number(row.movieId),
                    theaterId: Number(selectedTheatreId),
                    showTime: dateTime,
                    minPrice: Number(row.priceMin),
                    maxPrice: Number(row.priceMax)
                });
            });

            await Promise.all(promises);
            alert("All shows scheduled successfully!");
            // Reset rows but keep theatre/date? Or reset all?
            setRows([{ id: 1, movieId: '', time: '', priceMin: '', priceMax: '' }]);

            // Refresh schedule
            const theatre = theatres.find(t => t.id === Number(selectedTheatreId));
            if (theatre) {
                const allShows = await showService.searchShows("", "", theatre.name);
                const dailyShows = allShows.filter(s => s.showTime.startsWith(selectedDate));
                setExistingShows(dailyShows);
            }

        } catch (error) {
            console.error("Failed to batch schedule", error);
            alert("Some shows failed to schedule. Check console.");
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-white">Bulk Schedule Shows</h1>
            </div>

            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-gray-400 mb-2">Select Theatre</label>
                        <select
                            value={selectedTheatreId}
                            onChange={(e) => {
                                setSelectedTheatreId(e.target.value);
                                if (e.target.value) setIsScheduleModalOpen(true);
                            }}
                            className="w-full bg-slate-900 text-white p-3 rounded-lg border border-slate-600 focus:border-red-500 outline-none"
                        >
                            <option value="">Choose Theatre...</option>
                            {theatres.map(t => (
                                <option key={t.id} value={t.id}>{t.name} ({t.city})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-2">Select Date</label>
                        <CustomDatePicker
                            value={selectedDate}
                            onChange={setSelectedDate}
                            label="Select Date"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-900 text-gray-400">
                        <tr>
                            <th className="p-4">Movie</th>
                            <th className="p-4">Time (HH:mm)</th>
                            <th className="p-4">Min Price</th>
                            <th className="p-4">Max Price</th>
                            <th className="p-4 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {rows.map((row) => (
                            <tr key={row.id}>
                                <td className="p-4">
                                    <select
                                        value={row.movieId}
                                        onChange={(e) => updateRow(row.id, 'movieId', e.target.value)}
                                        className="w-full bg-slate-900 text-white p-2 rounded border border-slate-600"
                                    >
                                        <option value="">Select Movie</option>
                                        {movies.map(m => (
                                            <option key={m.id} value={m.id}>{m.title}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="p-4 relative">
                                    <TimeInputWithSchedule
                                        value={row.time}
                                        onChange={(val) => updateRow(row.id, 'time', val)}
                                        existingShows={existingShows}
                                        standardTimings={theatres.find(t => t.id === Number(selectedTheatreId))?.showTimings?.split(',') || []}
                                    />
                                </td>
                                <td className="p-4">
                                    <input
                                        type="number"
                                        value={row.priceMin}
                                        onChange={(e) => updateRow(row.id, 'priceMin', e.target.value)}
                                        className="w-full bg-slate-900 text-white p-2 rounded border border-slate-600 w-24"
                                        placeholder="Min"
                                    />
                                </td>
                                <td className="p-4">
                                    <input
                                        type="number"
                                        value={row.priceMax}
                                        onChange={(e) => updateRow(row.id, 'priceMax', e.target.value)}
                                        className="w-full bg-slate-900 text-white p-2 rounded border border-slate-600 w-24"
                                        placeholder="Max"
                                    />
                                </td>
                                <td className="p-4 text-center">
                                    <button
                                        onClick={() => removeRow(row.id)}
                                        className="text-red-500 hover:bg-slate-700 p-2 rounded"
                                        title="Remove Row"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="p-4 bg-slate-900 flex justify-between">
                    <button
                        onClick={addRow}
                        className="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium px-4 py-2"
                    >
                        <Plus className="w-4 h-4" /> Add Another Show
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-red-600/20"
                    >
                        <Save className="w-4 h-4" /> Save Schedule ({rows.filter(r => r.movieId && r.time).length})
                    </button>
                </div>
            </div>
            {selectedTheatreId && (
                <TheatreScheduleModal
                    isOpen={isScheduleModalOpen}
                    onClose={() => setIsScheduleModalOpen(false)}
                    theatreName={theatres.find(t => t.id === Number(selectedTheatreId))?.name || ''}
                    theatreId={Number(selectedTheatreId)}
                />
            )}
        </div>
    );
};

export default BulkSchedulePage;
