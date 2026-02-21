import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CreditCard, Wallet, Smartphone, Gift, Monitor, Clock, Crown, ChevronDown, CheckCircle2, Loader2 } from 'lucide-react';
import { bookingService } from '../services/bookingService';

const BookingSummaryPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { movie, theatre, show, selectedSeats, totalPrice, ticketCount } = location.state || {};

    const [activeTab, setActiveTab] = useState('UPI');
    const [isProcessing, setIsProcessing] = useState(false);
    const [bookingError, setBookingError] = useState<string | null>(null);

    if (!movie || !theatre || !show) return <div className="p-10 text-center">No booking details found.</div>;

    const baseConvenienceFee = 70.80; // Example fixed fee
    const donation = 2.00;
    const [isDonationActive, setIsDonationActive] = useState(true);

    const finalAmount = totalPrice + baseConvenienceFee + (isDonationActive ? donation : 0);

    const handlePayment = async () => {
        setIsProcessing(true);
        setBookingError(null);
        try {
            // Determine seatType from the first selected seat
            const seatType = selectedSeats?.[0]?.type || 'RECLINER';

            // Build seat numbers like "J1", "J2" from row + number
            const seatsNumbers: string[] = selectedSeats?.map((s: any) => `${s.row}${s.number}`) || [];

            // Fetch the first real user from the backend (since no login session exists)
            let userId = 1;
            try {
                const usersResponse = await import('../services/api').then(m => m.default.get('/user/all'));
                const users = usersResponse.data;
                if (users && users.length > 0) {
                    userId = users[0].id;
                }
            } catch {
                // fallback to 1 if fetch fails
            }

            const result = await bookingService.bookTickets({
                userId,
                showId: show.id,
                seatsNumbers,
                seatType,
            });

            // result.id is the real ticket ID from the DB
            const realBookingId = result?.id ? `BMS-${result.id}` : `BMS-${Math.floor(Math.random() * 1000000)}`;

            navigate('/booking-success', {
                state: { movie, theatre, show, selectedSeats, amountPayable: finalAmount, ticketCount, bookingId: realBookingId }
            });
        } catch (err: any) {
            const message = err?.response?.data || err?.message || 'Booking failed. Please try again.';
            setBookingError(message);
        } finally {
            setIsProcessing(false);
        }
    };

    const paymentMethods = [
        { id: 'UPI', label: 'Pay by any UPI App', icon: <Smartphone className="w-5 h-5" /> },
        { id: 'Card', label: 'Debit/Credit Card', icon: <CreditCard className="w-5 h-5" /> },
        { id: 'Wallet', label: 'Mobile Wallets', icon: <Wallet className="w-5 h-5" /> },
        { id: 'Gift', label: 'Gift Voucher', icon: <Gift className="w-5 h-5" /> },
        { id: 'NetBanking', label: 'Net Banking', icon: <Monitor className="w-5 h-5" /> },
        { id: 'PayLater', label: 'Pay Later', icon: <Clock className="w-5 h-5" /> },
        { id: 'Redeem', label: 'Redeem Points', icon: <Crown className="w-5 h-5" /> },
    ];

    return (
        <div className="bg-slate-50 min-h-screen font-sans text-gray-800 pb-20">

            {/* Header */}
            <div className="bg-white p-4 sticky top-0 z-50 shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="hover:bg-gray-100 p-2 rounded-full transition-colors">
                            <ChevronLeft className="w-6 h-6 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="font-semibold text-lg flex items-center gap-2">
                                {movie.title} <span className="text-xs border border-gray-400 rounded px-1 text-gray-500 uppercase">{movie.sensorRating || 'UA'}</span>
                            </h1>
                            <p className="text-xs text-gray-500">
                                {theatre.name}: {theatre.city} | {new Date(show.showTime).toLocaleDateString()} at {new Date(show.showTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Column: Payment Options (Tabs) */}
                <div className="lg:col-span-8 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row min-h-[500px]">
                    {/* Sidebar Tabs */}
                    <div className="w-full md:w-1/3 bg-gray-50 border-r border-gray-200">
                        <div className="p-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Payment options</div>
                        <div className="flex flex-col">
                            {paymentMethods.map(method => (
                                <button
                                    key={method.id}
                                    onClick={() => setActiveTab(method.id)}
                                    className={`
                                        flex items-center gap-4 p-4 text-sm font-medium transition-all text-left relative
                                        ${activeTab === method.id ? 'bg-white text-red-500 shadow-[inset_4px_0_0_0_#ef4444]' : 'text-gray-600 hover:bg-gray-100'}
                                    `}
                                >
                                    <span className={activeTab === method.id ? 'text-red-500' : 'text-gray-400'}>{method.icon}</span>
                                    {method.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 p-8 bg-white">
                        {activeTab === 'UPI' && (
                            <div className="animate-in fade-in duration-300">
                                <h2 className="text-lg font-semibold mb-6">Pay by any UPI App</h2>

                                <div className="space-y-4">
                                    <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <img src="https://cdn-icons-png.flaticon.com/512/6124/6124998.png" alt="GPay" className="w-8 h-8" />
                                            <span className="font-medium">Google Pay</span>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-red-500" />
                                    </div>

                                    <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-full border border-dashed border-red-300 flex items-center justify-center text-red-500">+</div>
                                            <div>
                                                <div className="font-medium text-red-500">Add new UPI ID</div>
                                                <div className="text-xs text-gray-400">You need to have a registered UPI ID</div>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-red-500" />
                                    </div>

                                    <div className="flex items-center gap-4 my-8">
                                        <div className="h-px bg-gray-200 flex-1"></div>
                                        <span className="text-gray-400 text-sm">Or</span>
                                        <div className="h-px bg-gray-200 flex-1"></div>
                                    </div>

                                    <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <img src="https://cdn-icons-png.flaticon.com/512/1041/1041916.png" alt="QR" className="w-8 h-8 opacity-60" />
                                            <div>
                                                <div className="font-medium">Scan QR code</div>
                                                <div className="text-xs text-gray-400">Scan using any UPI app</div>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-red-500" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'Card' && (
                            <div className="animate-in fade-in duration-300">
                                <h2 className="text-lg font-semibold mb-6">Internal Server Error</h2>
                                <p className="text-gray-500 text-sm">This is a demo. Please use UPI options or simply click proceed.</p>
                            </div>
                        )}

                        {/* Placeholder for other tabs */}
                        {!['UPI', 'Card'].includes(activeTab) && (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 animate-in fade-in duration-300">
                                <Monitor className="w-16 h-16 mb-4 opacity-20" />
                                <p>Coming Soon</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Order Summary */}
                <div className="lg:col-span-4 space-y-4">

                    {/* Summary Card */}
                    <div className="bg-white rounded-md shadow-sm border border-gray-200 p-5">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-red-500 text-lg mb-1">{movie.title}</h3>
                                <p className="text-sm font-medium text-gray-700 block mb-1">
                                    {new Date(show.showTime).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })} | {new Date(show.showTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                                <p className="text-xs text-gray-500 mb-2">{movie.language}, 2D</p>
                                <div className="text-xs text-gray-500">
                                    {theatre.name}: {theatre.city}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-light text-gray-400">{ticketCount}</div>
                                <div className="text-[10px] text-red-500 uppercase font-bold tracking-wide">M-Ticket</div>
                            </div>
                        </div>

                        {/* Cancellation Warning */}
                        <div className="bg-orange-50 border border-orange-100 rounded px-3 py-2 mb-4">
                            <h4 className="text-xs font-bold text-orange-800 mb-0.5">Cancellation Unavailable</h4>
                            <p className="text-[10px] text-orange-700">This venue does not support booking cancellation.</p>
                        </div>

                        <div className="border-t border-dashed border-gray-200 my-4"></div>

                        {/* Pricing */}
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-center text-gray-600">
                                <span>Ticket(s) price</span>
                                <span className="text-gray-900 font-medium">₹{totalPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-gray-600">
                                <span className="flex items-center gap-1">Convenience fees <ChevronDown className="w-3 h-3" /></span>
                                <span className="text-gray-900 font-medium">₹{baseConvenienceFee.toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between items-center text-gray-600 mt-3 pt-3 border-t border-dashed border-gray-200">
                                <div>
                                    <div className="font-medium text-gray-800">Donate to Charity</div>
                                    <div className="text-[10px] text-gray-400">(₹1 per ticket) <span className="underline cursor-pointer">View T&C</span></div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-900 font-medium">₹{donation.toFixed(2)}</span>
                                    <button
                                        onClick={() => setIsDonationActive(!isDonationActive)}
                                        className={`w-4 h-4 rounded border flex items-center justify-center ${isDonationActive ? 'bg-red-500 border-red-500' : 'border-gray-300'}`}
                                    >
                                        {isDonationActive && <CheckCircle2 className="w-3 h-3 text-white" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 my-4 pt-4 flex justify-between items-center bg-yellow-50 -mx-5 -mb-5 px-5 py-3 mt-4 border-b rounded-b-md">
                            <span className="font-bold text-gray-800">Order Total</span>
                            <span className="font-bold text-gray-900 text-lg">₹{finalAmount.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Contact Details */}
                    <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4 relative">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-sm font-bold text-gray-800">For Sending Booking Details</h3>
                            <button className="text-red-500 text-xs font-semibold flex items-center gap-1 hover:underline">Edit</button>
                        </div>
                        <p className="text-xs text-gray-600 mb-1">+91 9876543210  |  manik@example.com</p>
                        <p className="text-[10px] text-gray-400">Tamil Nadu (for GST purposes)</p>
                    </div>

                    {/* Offers */}
                    <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50">
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center text-[10px] font-bold text-white">%</div>
                            <span className="text-sm font-bold text-gray-800">Apply Offers</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>

                    {/* Disclaimer */}
                    <p className="text-[10px] text-gray-500 mt-4 px-2">
                        By proceeding, I express my consent to complete this transaction.
                    </p>

                    {/* Error Message */}
                    {bookingError && (
                        <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                            ⚠️ {bookingError}
                        </div>
                    )}

                    {/* Amount Payable - Sticky for Mobile */}
                    <div className="mt-4 bg-white md:bg-transparent p-4 md:p-0 border-t md:border-0 fixed md:static bottom-0 left-0 right-0 z-50 flex justify-between items-center shadow-lg md:shadow-none">
                        <div className="md:hidden">
                            <div className="text-xs text-gray-500">Amount Payable</div>
                            <div className="text-xl font-bold">₹{finalAmount.toFixed(2)}</div>
                        </div>
                        <button
                            onClick={handlePayment}
                            disabled={isProcessing}
                            className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-bold py-3 px-8 rounded-lg shadow-lg shadow-red-500/30 w-full md:w-auto transition-transform active:scale-95 flex items-center justify-center gap-2"
                        >
                            {isProcessing ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                            ) : (
                                <>
                                    <span className="md:hidden">Proceed</span>
                                    <span className="hidden md:inline">Amount Payable ₹{finalAmount.toFixed(2)}</span>
                                </>
                            )}
                        </button>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default BookingSummaryPage;
