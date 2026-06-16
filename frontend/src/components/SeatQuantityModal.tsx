import React from 'react';
import { X, Smartphone } from 'lucide-react';

interface SeatQuantityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (quantity: number) => void;
}

const SeatQuantityModal: React.FC<SeatQuantityModalProps> = ({ isOpen, onClose, onSelect }) => {
    if (!isOpen) return null;

    const quantities = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const categories = [
        { name: "Executive Recliner", price: 350, status: "Premium" },
        { name: "Gold Circle", price: 190, status: "Comfort" },
        { name: "Silver Plus", price: 60, status: "Budget" }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl animate-in fade-in duration-300 px-4">
            <div className="bg-[#121216] w-full max-w-lg rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden border border-white/10 animate-in zoom-in-95 duration-500">

                {/* Header */}
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5 shadow-inner">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-red-500 rounded-full" />
                        <h3 className="text-xl font-bold text-white tracking-tight uppercase mb-0">Select Seats</h3>
                    </div>
                    <button onClick={onClose} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-slate-500 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-10 text-center">

                    {/* Quantity Visualization */}
                    <div className="mb-10 flex flex-col items-center">
                        <div className="w-24 h-24 bg-red-600/10 rounded-full flex items-center justify-center border border-red-500/20 mb-6 group">
                            <Smartphone className="w-10 h-10 text-red-500 group-hover:scale-110 transition-transform" />
                        </div>
                        <p className="text-xs text-slate-500 font-semibold tracking-wide">How many seats would you like?</p>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex flex-wrap justify-center gap-3 mb-12">
                        {quantities.map(num => (
                            <button
                                key={num}
                                onClick={() => onSelect(num)}
                                className="w-11 h-11 rounded-2xl font-bold text-sm transition-all bg-white/5 text-slate-400 border border-white/10 hover:border-red-500/50 hover:text-red-500 hover:bg-red-500/10 active:scale-95 flex items-center justify-center"
                            >
                                {num}
                            </button>
                        ))}
                    </div>

                    {/* Advanced Category Info */}
                    <div className="bg-white/5 rounded-3xl border border-white/10 p-6 space-y-5 text-left">
                        <div className="flex justify-between text-[11px] font-semibold text-slate-600 tracking-wide border-b border-white/5 pb-3">
                            <span>Experience Layer</span>
                            <span>Starting Price</span>
                        </div>
                        {categories.map(cat => (
                            <div key={cat.name} className="flex justify-between items-center group">
                                <span className="font-semibold text-white text-xs tracking-tight group-hover:text-red-400 transition-colors">{cat.name}</span>
                                <div className="flex flex-col items-end">
                                    <span className="font-bold text-white text-sm">₹{cat.price}</span>
                                    <span className="text-[10px] text-emerald-500 font-medium tracking-wide mt-0.5">{cat.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-8 pt-0 text-center">
                    <button
                        onClick={() => onSelect(2)}
                        className="w-full py-4 bg-white/5 hover:bg-white/10 text-slate-400 font-bold rounded-2xl border border-white/10 transition-all text-sm tracking-tight"
                    >
                        Skip for Now
                    </button>
                    <p className="mt-4 text-[9px] text-slate-700 font-semibold uppercase tracking-widest">Premium Selection Guaranteed</p>
                </div>
            </div>
        </div>
    );
};

export default SeatQuantityModal;
