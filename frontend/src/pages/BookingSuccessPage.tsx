import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Home, Download } from 'lucide-react';

const BookingSuccessPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { movie, theatre, show, selectedSeats, amountPayable, bookingId } = location.state || {};

    if (!movie || !theatre || !show) return <div className="p-10 text-center dark:text-white">Booking not found (or direct access).</div>;

    const seatsStr = selectedSeats?.map((s: any) => `${s.row}${s.number}`).join(', ') || '';

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">

            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative">

                {/* Visual Header */}
                <div className="bg-red-500 h-32 flex items-center justify-center relative">
                    <div className="bg-white p-4 rounded-full shadow-lg animate-in fade-in zoom-in duration-300">
                        <CheckCircle className="w-12 h-12 text-red-500 fill-white" />
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
                    <p className="text-gray-500 text-sm mb-8">Your ticket has been sent to your email and mobile number.</p>

                    {/* Ticket Details */}
                    <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left border border-gray-100 relative">
                        {/* Perforated Edge Effect */}
                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-50 rounded-full"></div>
                        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-50 rounded-full"></div>

                        <div className="flex gap-4 border-b border-dashed border-gray-300 pb-4 mb-4">
                            <img
                                src={movie.posterUrl}
                                alt="Poster"
                                className="w-16 h-24 object-cover rounded"
                            />
                            <div>
                                <h3 className="font-bold text-gray-900">{movie.title}</h3>
                                <p className="text-xs text-gray-500 mt-1">{movie.language}, {show.type || '2D'}</p>
                                <p className="text-xs text-gray-500">{theatre.name}: {theatre.city}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-xs text-gray-400">Date & Time</p>
                                <p className="font-semibold text-gray-800">
                                    {(() => {
                                        let timeStr = show.showTime;
                                        if (timeStr && timeStr.length > 23) {
                                            const parts = timeStr.split('.');
                                            if (parts.length > 2) {
                                                timeStr = `${parts[0]}.${parts[1]}`;
                                            }
                                        }
                                        return new Date(timeStr).toLocaleString();
                                    })()}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Seats</p>
                                <p className="font-semibold text-gray-800">{seatsStr}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Booking ID</p>
                                <p className="font-semibold text-gray-800">{bookingId}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Amount Paid</p>
                                <p className="font-semibold text-gray-800">₹{amountPayable?.toFixed(2)}</p>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-dashed border-gray-300 flex justify-center">
                            <img src={`https://bwipjs-api.metafloor.com/?bcid=qrcode&text=${bookingId}&scale=3`} alt="QR Code" className="w-24 h-24 mix-blend-multiply p-1 rounded" />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors">
                            <Download className="w-4 h-4" /> Download
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 transition-colors"
                        >
                            <Home className="w-4 h-4" /> Home
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default BookingSuccessPage;
