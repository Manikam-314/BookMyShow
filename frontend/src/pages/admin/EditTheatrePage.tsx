import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { theatreService } from '../../services/theatreService';
import type { Theatre } from '../../types';

const EditTheatrePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState<Partial<Theatre>>({
        name: '', city: '', address: '', facilities: []
    });

    useEffect(() => {
        if (id) {
            loadTheatre(id);
        }
    }, [id]);

    const loadTheatre = async (theatreId: string) => {
        try {
            const data = await theatreService.getTheatreById(theatreId);
            setFormData(data);
        } catch (error) {
            console.error("Failed to load theatre", error);
            alert("Failed to load theatre details");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFacilitiesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, facilities: e.target.value.split(',').map(f => f.trim()) });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        try {
            await theatreService.updateTheatre(parseInt(id), formData);
            alert("Theatre Updated Successfully!");
            navigate('/admin/theatres');
        } catch (error) {
            console.error("Failed to update theatre", error);
            alert("Failed to update theatre");
        }
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <button onClick={() => navigate('/admin/theatres')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white mb-6">
                <ArrowLeft className="w-4 h-4" /> Back to Theatres
            </button>

            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Edit Theatre</h2>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Theatre Name</label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full p-3 border rounded-lg dark:bg-slate-900 dark:border-gray-600 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                        <input
                            type="text"
                            name="city"
                            required
                            value={formData.city}
                            onChange={handleChange}
                            className="w-full p-3 border rounded-lg dark:bg-slate-900 dark:border-gray-600 dark:text-white"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                    <textarea
                        name="address"
                        rows={3}
                        required
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full p-3 border rounded-lg dark:bg-slate-900 dark:border-gray-600 dark:text-white"
                    ></textarea>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Facilities (comma separated)</label>
                    <input
                        type="text"
                        name="facilities"
                        value={formData.facilities?.join(', ')}
                        onChange={handleFacilitiesChange}
                        className="w-full p-3 border rounded-lg dark:bg-slate-900 dark:border-gray-600 dark:text-white"
                    />
                </div>

                <div className="flex justify-end gap-4 border-t border-gray-200 dark:border-gray-700 pt-6">
                    <button type="button" onClick={() => navigate('/admin/theatres')} className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                    <button type="submit" className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold shadow-lg shadow-red-500/20 transition-transform active:scale-95 flex items-center gap-2">
                        <Save className="w-4 h-4" /> Save Changes
                    </button>
                </div>

            </form>
        </div>
    );
};

export default EditTheatrePage;
