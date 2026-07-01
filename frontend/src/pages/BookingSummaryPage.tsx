import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CreditCard, Wallet, Smartphone, Gift, Monitor, Clock, ChevronDown, CheckCircle2, Loader2, ShieldCheck, Zap, Calendar } from 'lucide-react';
import { paymentService } from '../services/paymentService';

const BookingSummaryPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { movie, theatre, show, selectedSeats, totalPrice, ticketCount } = location.state || {};

    const [activeTab, setActiveTab] = useState('UPI');
    const [isProcessing, setIsProcessing] = useState(false);
    const [bookingError, setBookingError] = useState<string | null>(null);

    React.useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        return () => { document.body.removeChild(script); };
    }, []);

    if (!movie || !theatre || !show) return <div className="p-10 text-center bg-[#0a0a0f] text-slate-500 h-screen">No booking details found.</div>;

    const baseConvenienceFee = 70.80;
    const donation = 2.00;
    const [isDonationActive, setIsDonationActive] = useState(true);

    const finalAmount = totalPrice + baseConvenienceFee + (isDonationActive ? donation : 0);

    const handlePayment = async () => {
        setIsProcessing(true);
        setBookingError(null);
        try {
            const rawSeatType = selectedSeats?.[0]?.type || 'RECLINER';
            const seatType = rawSeatType;
            const seatsNumbers: string[] = selectedSeats?.map((s: any) => `${s.row}${s.number}`) || [];

            let userId = 1;
            try {
                const stored = localStorage.getItem('auth_user');
                if (stored) {
                    userId = JSON.parse(stored).userId;
                }
            } catch { }

            const bookingResource = {
                userId,
                showId: show.id,
                seatsNumbers,
                seatType,
            };

            // 1. Create Order on Backend
            const orderResult = await paymentService.createOrder(finalAmount, bookingResource);

            // Mock Mode: Bypass Razorpay Modal if using mock keys
            if (orderResult.orderId.startsWith('order_mock_')) {
                console.log("Mock Payment Mode Detected. Simulating success...");
                setTimeout(async () => {
                    try {
                        const ticket = await paymentService.verifyPayment({
                            razorpayOrderId: orderResult.orderId,
                            razorpayPaymentId: 'pay_mock_' + Math.random().toString(36).substring(7),
                            razorpaySignature: 'mock_sig_' + Math.random().toString(36).substring(7),
                            bookingResource: bookingResource
                        });
                        
                        navigate('/booking-success', {
                            state: { movie, theatre, show, selectedSeats, amountPayable: finalAmount, ticketCount, bookingId: ticket.id }
                        });
                    } catch (verifyErr: any) {
                        setBookingError("Payment verification failed! Please contact support.");
                        setIsProcessing(false);
                    }
                }, 1500);
                return;
            }

            // 2. Open Razorpay Checkout
            const options = {
                key: orderResult.razorpayKeyId, // Dynamic key from backend
                amount: orderResult.amount * 100, // paise
                currency: orderResult.currency,
                name: "MovieShark Premium",
                description: `Booking for ${movie.title}`,
                order_id: orderResult.orderId,
                handler: async function (response: any) {
                    try {
                        setIsProcessing(true);
                        // 3. Verify on Backend
                        const ticket = await paymentService.verifyPayment({
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                            bookingResource: bookingResource
                        });
                        
                        navigate('/booking-success', {
                            state: { movie, theatre, show, selectedSeats, amountPayable: finalAmount, ticketCount, bookingId: ticket.id }
                        });
                    } catch (verifyErr: any) {
                        setBookingError("Payment verification failed! Please contact support.");
                        setIsProcessing(false);
                    }
                },
                theme: { color: "#ef4444" }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', function (response: any){
                setBookingError("Payment Failed: " + response.error.description);
                setIsProcessing(false);
            });
            rzp.open();
        } catch (err: any) {
            const message = err?.response?.data || err?.message || 'Payment initiation failed. Please try again.';
            setBookingError(message);
            setIsProcessing(false);
        }
    };

    const paymentMethods = [
        { id: 'UPI', label: 'UPI App', icon: <Smartphone className="w-5 h-5" /> },
        { id: 'Card', label: 'Debit/Credit Card', icon: <CreditCard className="w-5 h-5" /> },
        { id: 'Wallet', label: 'Mobile Wallets', icon: <Wallet className="w-5 h-5" /> },
        { id: 'Gift', label: 'Gift Voucher', icon: <Gift className="w-5 h-5" /> },
        { id: 'NetBanking', label: 'Net Banking', icon: <Monitor className="w-5 h-5" /> },
    ];

    return (
        <div className="bg-[#0a0a0f] min-h-screen font-sans text-slate-300 pb-20">

            {/* Header */}
            <div className="bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/10 sticky top-16 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="bg-white/5 hover:bg-white/10 p-2 rounded-xl border border-white/10 transition-colors group">
                            <ChevronLeft className="w-6 h-6 text-slate-400 group-hover:text-white" />
                        </button>
                        <div>
                            <h1 className="font-bold text-xl text-white tracking-tight flex items-center gap-2">
                                {movie.title} <span className="text-[10px] border border-white/20 rounded-md px-1.5 py-0.5 text-slate-500 uppercase font-bold">{movie.sensorRating || 'UA'}</span>
                            </h1>
                            <p className="text-[10px] text-slate-500 font-semibold tracking-wide mt-0.5">
                                {theatre.name} • {new Date(show.showTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </p>
                        </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 text-emerald-400 font-black text-[10px] tracking-widest uppercase bg-emerald-400/10 px-3 py-1.5 rounded-full border border-emerald-400/20">
                        <ShieldCheck className="w-4 h-4" /> Secure Checkout
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-4 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* Left Column: Payment Options */}
                <div className="lg:col-span-8 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 overflow-hidden flex flex-col md:flex-row min-h-[540px]">
                    {/* Sidebar Tabs */}
                    <div className="w-full md:w-1/3 bg-black/20 border-r border-white/10 text-left">
                        <div className="p-6 font-semibold text-slate-600 text-[10px] uppercase tracking-widest">Select Payment</div>
                        <div className="flex flex-col">
                            {paymentMethods.map(method => (
                                <button
                                    key={method.id}
                                    onClick={() => setActiveTab(method.id)}
                                    className={`
                                        flex items-center gap-4 p-5 text-sm font-semibold transition-all text-left relative tracking-tight
                                        ${activeTab === method.id ? 'bg-red-500 text-white shadow-xl shadow-red-500/20' : 'text-slate-400 hover:bg-white/5'}
                                    `}
                                >
                                    <span className={activeTab === method.id ? 'text-white' : 'text-slate-600'}>{method.icon}</span>
                                    {method.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 p-10">
                        {activeTab === 'UPI' ? (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">Pay by UPI</h2>
                                <p className="text-slate-500 text-xs mb-8 font-medium">Fast, secure, and zero convenience hidden costs.</p>

                                <div className="space-y-4">
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between cursor-pointer hover:bg-white/10 hover:border-red-500/30 transition-all group">
                                        <div className="flex items-center gap-5">
                                            <div className="bg-white p-2 rounded-xl">
                                                <img src="https://cdn-icons-png.flaticon.com/512/6124/6124998.png" alt="GPay" className="w-6 h-6" />
                                            </div>
                                            <span className="font-bold text-white text-sm tracking-tight">Google Pay</span>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
                                    </div>

                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between cursor-pointer hover:bg-white/10 hover:border-red-500/30 transition-all group">
                                        <div className="flex items-center gap-5">
                                            <div className="w-10 h-10 rounded-xl border border-dashed border-red-500/40 flex items-center justify-center text-red-500 font-bold">+</div>
                                            <div>
                                                <div className="font-bold text-red-400 text-sm tracking-tight">Add new UPI ID</div>
                                                <div className="text-[10px] text-slate-600 font-semibold tracking-wide">Requires registered VPA</div>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
                                    </div>

                                    <div className="flex items-center gap-6 my-10">
                                        <div className="h-px bg-white/10 flex-1"></div>
                                        <span className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">Or</span>
                                        <div className="h-px bg-white/10 flex-1"></div>
                                    </div>

                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between cursor-pointer hover:bg-white/10 hover:border-red-500/30 transition-all group">
                                        <div className="flex items-center gap-5">
                                            <div className="bg-white p-2 rounded-xl">
                                                <img src="https://cdn-icons-png.flaticon.com/512/1041/1041916.png" alt="QR" className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-white text-sm tracking-tight">Scan QR code</div>
                                                <div className="text-[10px] text-slate-600 font-semibold tracking-wide">Scan using any UPI App</div>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-600 animate-in fade-in duration-500">
                                <Zap className="w-16 h-16 mb-4 opacity-10 text-red-500" />
                                <h3 className="font-black uppercase tracking-widest text-xs">Payment Method Restricted</h3>
                                <p className="text-[10px] mt-2 font-bold opacity-50">PLEASE USE UPI FOR INSTANT BOOKING</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Order Summary */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Summary Card */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden relative group">
                        <div className="absolute -right-10 -top-10 w-32 h-32 bg-red-500/5 rounded-full blur-3xl transition-transform group-hover:scale-150" />

                        <div className="flex justify-between items-start mb-6 border-b border-white/5 pb-6">
                            <div>
                                <h3 className="font-bold text-red-500 text-2xl tracking-tight uppercase mb-2 leading-none">{movie.title}</h3>
                                <p className="text-xs font-semibold text-white flex items-center gap-2 mb-1">
                                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                    {new Date(show.showTime).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
                                </p>
                                <p className="text-xs font-semibold text-white flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                                    {new Date(show.showTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-4xl font-black text-white/10 border-b border-white/5 pb-1 mb-1">{ticketCount}</div>
                                <div className="text-[10px] text-red-500 uppercase font-black tracking-widest bg-red-500/10 px-2 py-0.5 rounded-sm">Tickets</div>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-1 mb-6">
                            <p className="text-[10px] font-semibold uppercase text-slate-500 tracking-wider">Venue</p>
                            <p className="text-sm font-semibold text-white">{theatre.name}, {theatre.city}</p>
                        </div>

                        <div className="border-t border-white/5 my-6"></div>

                        {/* Pricing */}
                        <div className="space-y-4 text-xs">
                            <div className="flex justify-between items-center text-slate-400 font-bold uppercase tracking-tight">
                                <span>Subtotal</span>
                                <span className="text-white">₹{totalPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-400 font-bold uppercase tracking-tight">
                                <span className="flex items-center gap-1.5">Fees <ChevronDown className="w-3 h-3 text-slate-600" /></span>
                                <span className="text-white">₹{baseConvenienceFee.toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                                <div>
                                    <div className="font-bold text-white text-xs tracking-tight">Charity Donation</div>
                                    <div className="text-[9px] text-slate-500 font-semibold uppercase mt-0.5 tracking-wide">Supporting foundations</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-white font-black">₹{donation.toFixed(2)}</span>
                                    <button
                                        onClick={() => setIsDonationActive(!isDonationActive)}
                                        className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${isDonationActive ? 'bg-red-500 border-red-500' : 'bg-transparent border-white/20 hover:border-white/40'}`}
                                    >
                                        {isDonationActive && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Total */}
                        <div className="mt-8 bg-gradient-to-r from-red-600/20 to-transparent -mx-6 -mb-6 p-6 flex justify-between items-center border-t border-white/10">
                            <div>
                                <span className="font-semibold text-slate-500 text-[10px] uppercase tracking-widest block mb-1">Total Payable</span>
                                <span className="font-bold text-white text-3xl tracking-tight">₹{finalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Contact Details */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 group hover:border-white/20 transition-all text-left">
                        <div className="flex justify-between items-center mb-1">
                            <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Booking Recipient</h3>
                            <button className="text-red-500 text-[10px] font-bold uppercase hover:text-red-400 transition-colors">Edit</button>
                        </div>
                        <p className="text-sm font-semibold text-white tracking-tight leading-none">+91 9876543210</p>
                        <p className="text-[10px] text-slate-500 font-semibold mt-2 tracking-tight">manik@example.com</p>
                    </div>

                    {/* Disclaimer */}
                    <p className="text-[9px] text-slate-600 mt-6 px-4 font-bold uppercase tracking-widest text-center">
                        Secure transaction powered by MovieShark Logic
                    </p>

                    {/* Error Message */}
                    {bookingError && (
                        <div className="animate-in zoom-in-95 duration-300 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-[10px] text-red-400 font-black uppercase tracking-wider text-center">
                            ⚠️ {bookingError}
                        </div>
                    )}

                    {/* Proceed Button */}
                    <button
                        onClick={handlePayment}
                        disabled={isProcessing}
                        className="w-full relative group/pay overflow-hidden bg-red-500 hover:bg-red-600 disabled:bg-red-900/50 text-white font-bold py-5 rounded-3xl shadow-2xl shadow-red-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 tracking-tight text-lg"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/pay:translate-x-full transition-transform duration-1000" />
                        {isProcessing ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> Authorizing...</>
                        ) : (
                            <>Proceed To Pay ₹{finalAmount.toFixed(2)}</>
                        )}
                    </button>

                </div>

            </div>
        </div>
    );
};

export default BookingSummaryPage;
