import React from 'react';
import { X } from 'lucide-react';

interface SeatQuantityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (quantity: number) => void;
}

const SeatQuantityModal: React.FC<SeatQuantityModalProps> = ({ isOpen, onClose, onSelect }) => {
    if (!isOpen) return null;

    const quantities = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const categories = [
        { name: "Recliner", price: 350, status: "Available" },
        { name: "First Class", price: 190, status: "Available" },
        { name: "Second Class", price: 60, status: "Available" }
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900">How many seats?</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 text-center">

                    {/* Vehicle/Transport Icons */}
                    <div className="mb-8 flex justify-center h-24 items-end pb-4 border-b border-dotted border-gray-300">
                        <img
                            src="https://cdn-icons-png.flaticon.com/512/3063/3063822.png"
                            alt="Vehicle"
                            className="h-20 opacity-80"
                        />
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex justify-center gap-2 mb-8">
                        {quantities.map(num => (
                            <button
                                key={num}
                                onClick={() => onSelect(num)}
                                className="w-10 h-10 rounded-full font-bold text-sm transition-all hover:bg-red-500 hover:text-white focus:bg-red-500 focus:text-white bg-gray-100 text-gray-700"
                            >
                                {num}
                            </button>
                        ))}
                    </div>

                    {/* Pricing Summary */}
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm font-medium text-gray-500 border-b border-gray-100 pb-2">
                            <span>Category</span>
                            <span>Price</span>
                        </div>
                        {categories.map(cat => (
                            <div key={cat.name} className="flex justify-between items-center text-sm">
                                <span className="font-semibold text-gray-800">{cat.name}</span>
                                <div className="flex flex-col items-end">
                                    <span className="font-bold text-gray-900">₹{cat.price}</span>
                                    <span className="text-[10px] text-green-500 uppercase">{cat.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 p-4 border-t border-gray-200 text-center">
                    <button
                        onClick={() => onSelect(2)} // Default action
                        className="bg-red-500 hover:bg-red-600 text-white w-full py-3 rounded-lg font-bold shadow-lg shadow-red-500/30 transition-transform active:scale-95"
                    >
                        Select Seats
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SeatQuantityModal;
