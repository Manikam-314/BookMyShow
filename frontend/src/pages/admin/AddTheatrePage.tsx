import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { theatreService } from '../../services/theatreService';

const AddTheatrePage: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '', city: '', address: '', facilities: '', showTimings: '', totalRows: 10, totalColumns: 15
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await theatreService.addTheatre({
                ...formData,
                facilities: formData.facilities.split(',').map(f => f.trim()),
                seatsConfigured: false
            });
            alert("Theatre Added Successfully!");
        } catch (error) {
            console.error("Failed to add theatre:", error);
            alert("Failed to add theatre");
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Add New Theatre</h2>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Theatre Name</label>
                        <input type="text" name="name" required onChange={handleChange} className="w-full p-3 border rounded-lg dark:bg-slate-900 dark:border-gray-600 dark:text-white" placeholder="e.g. Inox Cinemas" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                        <input type="text" name="city" required onChange={handleChange} className="w-full p-3 border rounded-lg dark:bg-slate-900 dark:border-gray-600 dark:text-white" placeholder="e.g. Madurai" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                    <textarea name="address" rows={3} required onChange={handleChange} className="w-full p-3 border rounded-lg dark:bg-slate-900 dark:border-gray-600 dark:text-white" placeholder="Full address..."></textarea>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Facilities (comma separated)</label>
                    <input type="text" name="facilities" onChange={handleChange} className="w-full p-3 border rounded-lg dark:bg-slate-900 dark:border-gray-600 dark:text-white" placeholder="e.g. Parking, Dolby Atmos, 4K" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Standard Show Timings (comma separated)</label>
                    <input type="text" name="showTimings" onChange={handleChange} className="w-full p-3 border rounded-lg dark:bg-slate-900 dark:border-gray-600 dark:text-white" placeholder="e.g. 10:00, 14:00, 18:00, 22:00" />
                    <p className="text-xs text-gray-500 mt-1">These will be used as available slots when scheduling shows.</p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-900/30 space-y-4">
                    <h3 className="font-semibold text-blue-800 dark:text-blue-300">Seat Configuration</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Rows</label>
                            <input type="number" name="totalRows" min="1" max="26" onChange={(e) => setFormData({ ...formData, totalRows: parseInt(e.target.value) || 10 })} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-blue-800 dark:text-white" placeholder="10" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Columns</label>
                            <input type="number" name="totalColumns" min="1" max="20" onChange={(e) => setFormData({ ...formData, totalColumns: parseInt(e.target.value) || 15 })} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-blue-800 dark:text-white" placeholder="15" />
                        </div>
                    </div>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                        Total Capacity: <b>{(formData.totalRows || 0) * (formData.totalColumns || 0)} Seats</b>. Layout will be generated automatically.
                    </p>
                </div>

                <div className="flex justify-end gap-4 border-t border-gray-200 dark:border-gray-700 pt-6">
                    <button type="button" className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                    <button type="submit" className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold shadow-lg shadow-red-500/20 transition-transform active:scale-95 flex items-center gap-2">
                        <Save className="w-4 h-4" /> Save Theatre
                    </button>
                </div>

            </form>
        </div>
    );
};

export default AddTheatrePage;
