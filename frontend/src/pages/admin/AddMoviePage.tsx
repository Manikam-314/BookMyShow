import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { movieService } from '../../services/movieService';

const AddMoviePage: React.FC = () => {
    const [formData, setFormData] = useState({
        title: '', description: '', language: '', genre: '', duration: '', releaseDate: '', posterUrl: '', bannerUrl: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await movieService.addMovie({
                ...formData,
                rating: 0,
                votes: 0,
                duration: Number(formData.duration)
            });
            alert("Movie Added Successfully!");
            // Reset form or redirect
        } catch (error) {
            console.error("Failed to add movie:", error);
            alert("Failed to add movie");
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Add New Movie</h2>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Movie Title</label>
                        <input type="text" name="title" required onChange={handleChange} className="w-full p-3 border rounded-lg dark:bg-slate-900 dark:border-gray-600 dark:text-white" placeholder="e.g. Leo" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Language</label>
                        <input type="text" name="language" required onChange={handleChange} className="w-full p-3 border rounded-lg dark:bg-slate-900 dark:border-gray-600 dark:text-white" placeholder="e.g. Tamil, Telugu" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Genre</label>
                        <input type="text" name="genre" required onChange={handleChange} className="w-full p-3 border rounded-lg dark:bg-slate-900 dark:border-gray-600 dark:text-white" placeholder="e.g. Action/Thriller" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (mins)</label>
                        <input type="number" name="duration" required onChange={handleChange} className="w-full p-3 border rounded-lg dark:bg-slate-900 dark:border-gray-600 dark:text-white" placeholder="e.g. 150" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Release Date</label>
                        <input type="date" name="releaseDate" required onChange={handleChange} className="w-full p-3 border rounded-lg dark:bg-slate-900 dark:border-gray-600 dark:text-white" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                    <textarea name="description" rows={4} required onChange={handleChange} className="w-full p-3 border rounded-lg dark:bg-slate-900 dark:border-gray-600 dark:text-white" placeholder="Movie synopsis..."></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Poster URL</label>
                        <input type="url" name="posterUrl" required onChange={handleChange} className="w-full p-3 border rounded-lg dark:bg-slate-900 dark:border-gray-600 dark:text-white" placeholder="https://..." />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Banner URL</label>
                        <input type="url" name="bannerUrl" required onChange={handleChange} className="w-full p-3 border rounded-lg dark:bg-slate-900 dark:border-gray-600 dark:text-white" placeholder="https://..." />
                    </div>
                </div>

                <div className="flex justify-end gap-4 border-t border-gray-200 dark:border-gray-700 pt-6">
                    <button type="button" className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                    <button type="submit" className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold shadow-lg shadow-red-500/20 transition-transform active:scale-95 flex items-center gap-2">
                        <Save className="w-4 h-4" /> Save Movie
                    </button>
                </div>

            </form>
        </div>
    );
};

export default AddMoviePage;
