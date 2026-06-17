import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash, Plus } from 'lucide-react';
import { theatreService } from '../../services/theatreService';
import type { Theatre } from '../../types';

const ManageTheatresPage: React.FC = () => {
    const navigate = useNavigate();
    const [theatres, setTheatres] = useState<Theatre[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTheatres();
    }, []);

    const loadTheatres = async () => {
        try {
            const data = await theatreService.getAllTheatres();
            setTheatres(data);
        } catch (error) {
            console.error("Failed to load theatres", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this theatre?")) return;
        try {
            await theatreService.deleteTheatre(id);
            setTheatres(theatres.filter(t => t.id !== id));
        } catch (error) {
            console.error("Failed to delete theatre", error);
            alert("Failed to delete theatre");
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Theatres</h2>
                <button
                    onClick={() => navigate('/admin/theatres/add')}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Add Theatre
                </button>
            </div>

            {loading ? (
                <div className="text-center py-10">Loading...</div>
            ) : (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-slate-700">
                            <tr>
                                <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-300">ID</th>
                                <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-300">Name</th>
                                <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-300">City</th>
                                <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-300">Address</th>
                                <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {theatres.map(theatre => (
                                <tr key={theatre.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                                    <td className="p-4 text-gray-900 dark:text-white">#{theatre.id}</td>
                                    <td className="p-4 text-gray-900 dark:text-white font-medium">{theatre.name}</td>
                                    <td className="p-4 text-gray-600 dark:text-gray-300">{theatre.city}</td>
                                    <td className="p-4 text-gray-600 dark:text-gray-300">{theatre.address}</td>
                                    <td className="p-4 flex gap-3">
                                        <button
                                            onClick={() => navigate(`/admin/theatres/edit/${theatre.id}`)}
                                            className="text-blue-500 hover:text-blue-600"
                                            title="Edit"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(theatre.id)}
                                            className="text-red-500 hover:text-red-600"
                                            title="Delete"
                                        >
                                            <Trash className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                    {theatres.length === 0 && (
                        <div className="text-center py-8 text-gray-500">No theatres found.</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ManageTheatresPage;
