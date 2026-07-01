import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, X, Sun, Moon } from 'lucide-react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { ShowSeat, Show, Movie, Theatre } from '../types';
import SeatQuantityModal from '../components/SeatQuantityModal';
import { showService } from '../services/showService';
import { movieService } from '../services/movieService';
import { theatreService } from '../services/theatreService';

const SeatSelectionPage: React.FC = () => {
    const { showId } = useParams<{ showId: string }>();
    const navigate = useNavigate();
    const [scale, setScale] = useState(1);
    const [selectedSeats, setSelectedSeats] = useState<ShowSeat[]>([]);
    const [showQuantityModal, setShowQuantityModal] = useState(true);
    const [ticketCount, setTicketCount] = useState(2);
    const [stompClient, setStompClient] = useState<Client | null>(null);
    const [isLightTheme, setIsLightTheme] = useState(false);

    const [show, setShow] = useState<Show | null>(null);
    const [movie, setMovie] = useState<Movie | null>(null);
    const [theatre, setTheatre] = useState<Theatre | null>(null);
    const [loading, setLoading] = useState(true);

    const [seatLayout, setSeatLayout] = useState<{
        recliner: ShowSeat[];
        firstClass: ShowSeat[];
        secondClass: ShowSeat[];
    }>({ recliner: [], firstClass: [], secondClass: [] });

    useEffect(() => {
        const fetchData = async () => {
            if (!showId) return;
            try {
                const showData = await showService.getShowById(showId);
                setShow(showData);

                const [movieData, theatreData, seatsData] = await Promise.all([
                    movieService.getMovieById(String(showData.movieId)),
                    theatreService.getTheatreById(String(showData.theaterId)),
                    showService.getSeatsForShow(showId)
                ]);

                setMovie(movieData);
                setTheatre(theatreData);
                setSeatLayout(processSeats(seatsData));

            } catch (error) {
                console.error("Failed to load session data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [showId]);

    useEffect(() => {
        if (!showId) return;

        const token = localStorage.getItem('token') || '';
        const client = new Client({
            webSocketFactory: () => new SockJS(`${import.meta.env.VITE_API_URL || ''}/ws`),
            connectHeaders: { Authorization: `Bearer ${token}` },
            debug: (str) => console.log('STOMP DEBUG: ', str),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = () => {
            console.log('STOMP Connected');
            client.subscribe(`/topic/seats/${showId}`, (message) => {
                const incomingSeat = JSON.parse(message.body);
                updateSeatStatus(incomingSeat);
            });
        };

        client.activate();
        setStompClient(client);

        return () => {
            if (client.active) {
                client.deactivate();
            }
        };
    }, [showId]);

    const updateSeatStatus = (incomingSeat: any) => {
        setSeatLayout((prev) => {
            const updateSection = (section: ShowSeat[]) =>
                section.map(s => s.id === incomingSeat.id ? { ...s, status: incomingSeat.status as "AVAILABLE" | "LOCKED" | "BOOKED" } : s);

            return {
                recliner: updateSection(prev.recliner),
                firstClass: updateSection(prev.firstClass),
                secondClass: updateSection(prev.secondClass)
            };
        });

        if (incomingSeat.status !== 'AVAILABLE') {
            setSelectedSeats(prev => prev.filter(s => s.id !== incomingSeat.id));
        }
    };

    const processSeats = (backendSeats: any[]) => {
        const layout = { recliner: [] as ShowSeat[], firstClass: [] as ShowSeat[], secondClass: [] as ShowSeat[] };
        backendSeats.forEach(seat => {
            const match = seat.seatNumber.match(/([A-Z]+)(\d+)/);
            const row = match ? match[1] : '';
            const number = match ? parseInt(match[2], 10) : 0;
            const contentSeat: ShowSeat = {
                id: seat.id, row, number, type: seat.seatType, price: seat.rate,
                status: seat.status || (seat.booked ? 'BOOKED' : 'AVAILABLE')
            };
            if (seat.seatType === 'RECLINER') layout.recliner.push(contentSeat);
            else if (seat.seatType === 'FIRST_CLASS') layout.firstClass.push(contentSeat);
            else if (seat.seatType === 'SECOND_CLASS') layout.secondClass.push(contentSeat);
        });
        const sortFn = (a: ShowSeat, b: ShowSeat) => a.row === b.row ? a.number - b.number : a.row.localeCompare(b.row);
        layout.recliner.sort(sortFn);
        layout.firstClass.sort(sortFn);
        layout.secondClass.sort(sortFn);
        return layout;
    };

    const toggleSeat = (startSeat: ShowSeat) => {
        if (startSeat.status !== 'AVAILABLE') return;

        const token = localStorage.getItem('token') || '';

        // If deselecting currently selected block
        if (selectedSeats.find(s => s.id === startSeat.id)) {
            selectedSeats.forEach(s => {
                if (stompClient?.connected) {
                    stompClient.publish({
                        destination: '/app/seats.toggle',
                        body: JSON.stringify({ showId: Number(showId), seatId: s.id, action: 'UNLOCK', token })
                    });
                }
            });
            setSelectedSeats([]);
            return;
        }

        // Before selecting NEW seats, release old ones
        selectedSeats.forEach(s => {
            if (stompClient?.connected) {
                stompClient.publish({
                    destination: '/app/seats.toggle',
                    body: JSON.stringify({ showId: Number(showId), seatId: s.id, action: 'UNLOCK', token })
                });
            }
        });

        const allSeats = [...seatLayout.recliner, ...seatLayout.firstClass, ...seatLayout.secondClass];
        const rowSeats = allSeats.filter(s => s.row === startSeat.row).sort((a, b) => a.number - b.number);
        const startIndex = rowSeats.findIndex(s => s.id === startSeat.id);
        if (startIndex === -1) return;
        
        const potentialSeats = [];
        for (let i = 0; i < ticketCount; i++) {
            const nextSeat = rowSeats[startIndex + i];
            if (nextSeat && nextSeat.status === 'AVAILABLE') potentialSeats.push(nextSeat);
            else break;
        }
        
        if (potentialSeats.length > 0) {
            setSelectedSeats(potentialSeats);
            // Lock new seats
            potentialSeats.forEach(s => {
                if (stompClient?.connected) {
                    stompClient.publish({
                        destination: '/app/seats.toggle',
                        body: JSON.stringify({ showId: Number(showId), seatId: s.id, action: 'LOCK', token })
                    });
                }
            });
        }
    };

    const handleQuantitySelect = (qty: number) => {
        setTicketCount(qty);
        setShowQuantityModal(false);
    };

    const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

    const handleProceed = () => {
        navigate('/payment', { state: { movie, theatre, show, selectedSeats, totalPrice, ticketCount } });
    };

    if (loading) return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                <p className="text-slate-500 text-xs font-semibold tracking-wide">Scanning Grid...</p>
            </div>
        </div>
    );

    if (!show || !movie || !theatre) return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-slate-500 font-semibold tracking-wide lowercase italic">Session Expired</div>;

    return (
        <div className={`min-h-screen flex flex-col overflow-hidden font-sans overflow-x-hidden transition-colors duration-300 ${isLightTheme ? 'bg-[#f2f3f6] text-slate-800' : 'bg-[#0a0a0f] text-slate-300'}`}>
            <SeatQuantityModal isOpen={showQuantityModal} onClose={() => setShowQuantityModal(false)} onSelect={handleQuantitySelect} />

            {/* Header */}
            <header className={`backdrop-blur-xl border-b px-3 sm:px-6 py-3 sm:py-4 flex justify-between items-center z-50 sticky top-16 shadow-2xl transition-colors duration-300 ${isLightTheme ? 'bg-white/80 border-slate-200' : 'bg-[#0a0a0f]/80 border-white/10'}`}>
                <div className="flex items-center gap-3 sm:gap-6 min-w-0">
                    <button onClick={() => navigate(-1)} className={`p-2.5 rounded-2xl border transition-all group ${isLightTheme ? 'bg-slate-100 hover:bg-slate-200 border-slate-200' : 'bg-white/5 hover:bg-white/10 border-white/10'}`}>
                        <ChevronLeft className={`w-6 h-6 ${isLightTheme ? 'text-slate-600 group-hover:text-slate-900' : 'text-slate-400 group-hover:text-white'}`} />
                    </button>
                    <div>
                        <h1 className={`text-sm sm:text-lg md:text-xl font-bold flex items-center gap-2 sm:gap-3 tracking-tight truncate ${isLightTheme ? 'text-slate-950' : 'text-white'}`}>
                            {movie.title}
                            <span className={`text-[10px] font-bold border rounded-md px-2 py-0.5 tracking-wider ${isLightTheme ? 'border-slate-300 text-slate-600' : 'border-white/20 text-slate-500'}`}>{movie.sensorRating || 'UA'}</span>
                        </h1>
                        <p className={`text-[10px] font-medium tracking-wider mt-1 ${isLightTheme ? 'text-slate-500' : 'text-slate-500'}`}>
                            {theatre.name} • {new Date(show.showTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
                    {/* Legend */}
                    <div className={`hidden lg:flex items-center gap-6 text-[11px] font-medium mr-4 ${isLightTheme ? 'text-slate-600' : 'text-slate-400'}`}>
                        <div className="flex items-center gap-2">
                            <div className={`w-3.5 h-3.5 rounded-sm border ${isLightTheme ? 'bg-white border-[#15a850]' : 'bg-transparent border-[#15a850]/40'}`} /> Available
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`w-3.5 h-3.5 rounded-sm ${isLightTheme ? 'bg-[#ebebeb]' : 'bg-[#252530]'}`} /> Sold
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3.5 h-3.5 rounded-sm bg-[#15a850]" /> Selected
                        </div>
                    </div>
                    <button onClick={() => setShowQuantityModal(true)} className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-2 rounded-xl border border-red-500/30 text-xs font-semibold tracking-tight transition-all whitespace-nowrap">
                        {ticketCount} Tickets
                    </button>
                    <button onClick={() => navigate(-1)} className="hover:text-white transition-colors">
                        <X className={`w-5 h-5 ${isLightTheme ? 'text-slate-400 hover:text-slate-800' : 'text-slate-600 hover:text-white'}`} />
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden relative">
                <div className={`flex-1 overflow-auto relative flex items-center justify-center p-4 sm:p-10 md:p-20 cursor-grab active:cursor-grabbing scroller transition-colors duration-300 ${isLightTheme ? 'bg-[#f2f3f6]' : 'bg-[#0a0a0f]'}`} id="seat-map-container">
                    <div style={{ transform: `scale(${scale})` }} className="transition-transform duration-300 origin-center text-center pb-40">
                        <div className="flex flex-col gap-12">
                            {seatLayout.recliner.length > 0 && <SeatRowSection title="Recliner" price={seatLayout.recliner[0].price} seats={seatLayout.recliner} selectedSeats={selectedSeats} onToggle={toggleSeat} isLightTheme={isLightTheme} />}
                            {seatLayout.firstClass.length > 0 && <SeatRowSection title="First Class" price={seatLayout.firstClass[0].price} seats={seatLayout.firstClass} selectedSeats={selectedSeats} onToggle={toggleSeat} isLightTheme={isLightTheme} />}
                            {seatLayout.secondClass.length > 0 && <SeatRowSection title="Second Class" price={seatLayout.secondClass[0].price} seats={seatLayout.secondClass} selectedSeats={selectedSeats} onToggle={toggleSeat} isLightTheme={isLightTheme} />}
                        </div>

                        {/* Screen Indicator */}
                        <div className="mt-24 mb-10 opacity-70">
                            <p className="text-[11px] font-semibold text-slate-500 mb-6 tracking-[0.3em] uppercase">All eyes this way please</p>
                            <div className={`w-[90vw] max-w-[700px] h-2 rounded-full mx-auto blur-[1px] ${isLightTheme ? 'bg-[#00c2e0] shadow-[0_10px_40px_rgba(0,194,224,0.6)]' : 'bg-red-600 shadow-[0_10px_40px_rgba(239,68,68,0.6)]'}`}></div>
                            <div className={`w-[80vw] max-w-[600px] h-16 mx-auto mt-2 rounded-b-[100%] ${isLightTheme ? 'bg-gradient-to-t from-[#00c2e0]/10 to-transparent' : 'bg-gradient-to-t from-red-600/10 to-transparent'}`}></div>
                        </div>
                    </div>
                </div>

                {/* Minimap Overlay */}
                <div className={`absolute top-10 right-10 z-20 p-4 rounded-3xl shadow-2xl w-52 hidden lg:block group border transition-all duration-300 ${isLightTheme ? 'bg-white border-slate-200' : 'bg-black/60 border-white/10 backdrop-blur-2xl'}`}>
                    <p className={`text-[9px] mb-4 font-black tracking-[0.3em] uppercase text-center group-hover:text-red-500 transition-colors ${isLightTheme ? 'text-slate-400' : 'text-white/40'}`}>Tactical View</p>
                    <div className={`rounded-2xl p-4 h-32 relative overflow-hidden flex items-center justify-center border ${isLightTheme ? 'bg-slate-50 border-slate-100' : 'bg-black/40 border-white/5'}`}>
                        <div className="grid gap-[2px] transform scale-90 origin-center">
                            {[...seatLayout.recliner, ...seatLayout.firstClass, ...seatLayout.secondClass].map(seat => (
                                <div key={`mini-${seat.id}`} className={`w-[3px] h-[3px] rounded-full transition-all ${seat.status === 'BOOKED' || seat.status === 'SOLD' ? (isLightTheme ? 'bg-slate-200' : 'bg-white/10') : selectedSeats.find(s => s.id === seat.id) ? 'bg-[#15a850] shadow-[0_0_5px_rgba(21,168,80,1)]' : (isLightTheme ? 'bg-[#15a850]/30' : 'bg-white/30')}`} style={{ gridColumn: seat.number, gridRow: seat.row.charCodeAt(0) - 64 }} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Checkout Bar */}
            {selectedSeats.length > 0 && (
                <div className={`fixed bottom-0 left-0 right-0 border-t p-4 sm:p-6 z-[100] animate-in slide-in-from-bottom-10 duration-500 transition-all duration-300 ${isLightTheme ? 'bg-white border-slate-200 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]' : 'bg-black/40 border-white/10 backdrop-blur-3xl'}`}>
                    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4 sm:gap-10">
                            <div>
                                <p className={`text-[10px] font-medium tracking-wide mb-1 ${isLightTheme ? 'text-slate-400' : 'text-slate-500'}`}>Seats Selected</p>
                                <div className="flex gap-2">
                                    {selectedSeats.map(s => (
                                        <span key={s.id} className={`px-2 py-1 rounded text-xs font-semibold border uppercase ${isLightTheme ? 'bg-slate-100 border-slate-200 text-slate-800' : 'bg-white/5 border-white/10 text-white'}`}>{s.row}{s.number}</span>
                                    ))}
                                </div>
                            </div>
                            <div className={`h-10 w-px hidden sm:block ${isLightTheme ? 'bg-slate-200' : 'bg-white/10'}`} />
                            <div className="hidden sm:block">
                                <p className={`text-[10px] font-medium tracking-wide mb-1 ${isLightTheme ? 'text-slate-400' : 'text-slate-500'}`}>Total Savings</p>
                                <p className="text-xs font-semibold text-emerald-500">₹0.00 <span className="text-[9px] text-slate-500 font-normal">(Promo Ready)</span></p>
                            </div>
                        </div>
                        <button onClick={handleProceed} className="bg-[#f84464] hover:bg-[#f84464]/90 text-white px-6 sm:px-12 py-3 sm:py-4 rounded-2xl font-bold text-sm tracking-tight shadow-2xl shadow-red-500/25 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-3 group/pay w-full sm:w-auto justify-center">
                            Pay ₹{totalPrice}
                            <div className="bg-white/20 p-1 rounded-md group-hover/pay:bg-white/30 transition-colors">
                                <ChevronRight className="w-4 h-4" />
                            </div>
                        </button>
                    </div>
                </div>
            )}

            {/* Float Controls */}
            <div className="absolute bottom-28 right-4 sm:right-10 z-40 flex flex-col gap-3">
                <button onClick={() => setIsLightTheme(v => !v)} className={`p-3 rounded-2xl border transition-all shadow-2xl ${isLightTheme ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'}`} title="Toggle Theme">
                    {isLightTheme ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </button>
                <button onClick={() => setScale(s => Math.min(s + 0.1, 1.5))} className={`p-3 rounded-2xl border transition-all shadow-2xl ${isLightTheme ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'}`}>
                    <ZoomIn className="w-5 h-5" />
                </button>
                <button onClick={() => setScale(s => Math.max(s - 0.1, 0.5))} className={`p-3 rounded-2xl border transition-all shadow-2xl ${isLightTheme ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'}`}>
                    <ZoomOut className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

const SeatRowSection = ({ title, price, seats, selectedSeats, onToggle, isLightTheme }: any) => {
    const rows = useMemo(() => {
        const map = new Map<string, ShowSeat[]>();
        seats.forEach((s: any) => { if (!map.has(s.row)) map.set(s.row, []); map.get(s.row)?.push(s); });
        return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    }, [seats]);

    // Find the max seat number across all seats to align columns perfectly
    const maxCol = useMemo(() => {
        return Math.max(...seats.map((s: any) => s.number), 10);
    }, [seats]);

    return (
        <div className="mb-8">
            <div className={`text-[11px] mb-8 font-semibold tracking-[0.2em] uppercase flex items-center justify-center gap-4 ${isLightTheme ? 'text-slate-500' : 'text-slate-500'}`}>
                <div className={`h-px w-20 ${isLightTheme ? 'bg-slate-200' : 'bg-white/5'}`} />
                {title} — ₹{price}
                <div className={`h-px w-20 ${isLightTheme ? 'bg-slate-200' : 'bg-white/5'}`} />
            </div>
            <div className="flex flex-col gap-3">
                {rows.map(([rowLabel, rowSeats]) => {
                    // Group seats into left block (1-10) and right block (11+)
                    const leftCols = [];
                    const rightCols = [];

                    for (let c = 1; c <= maxCol; c++) {
                        const seat = rowSeats.find((s: any) => s.number === c);
                        if (c <= 10) {
                            leftCols.push({ colNum: c, seat });
                        } else {
                            rightCols.push({ colNum: c, seat });
                        }
                    }

                    return (
                        <div key={rowLabel} className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6">
                            {/* Left Row Label */}
                            <div className={`w-6 text-right font-bold text-xs uppercase ${isLightTheme ? 'text-slate-400' : 'text-slate-600'}`}>
                                {rowLabel}
                            </div>

                            {/* Left block of seats */}
                            <div className="flex gap-1.5 sm:gap-2">
                                {leftCols.map(({ colNum, seat }) => {
                                    if (!seat) {
                                        return <div key={`empty-${colNum}`} className="w-7 h-7 sm:w-8 sm:h-8" />;
                                    }
                                    const isSelected = !!selectedSeats.find((s: any) => s.id === seat.id);
                                    const isBooked = seat.status === 'BOOKED' || seat.status === 'SOLD';
                                    return (
                                        <button
                                            key={seat.id}
                                            disabled={isBooked}
                                            onClick={() => onToggle(seat)}
                                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md text-[9px] sm:text-[10px] font-medium flex items-center justify-center transition-all duration-200 border
                                                ${isBooked 
                                                    ? isLightTheme 
                                                        ? 'bg-[#ebebeb] border-transparent text-[#bababa] cursor-not-allowed'
                                                        : 'bg-[#252530] border-transparent text-slate-700 cursor-not-allowed'
                                                    : isSelected 
                                                        ? 'bg-[#15a850] border-[#15a850] text-white shadow-[0_0_12px_rgba(21,168,80,0.4)] scale-105 z-10' 
                                                        : isLightTheme
                                                            ? 'bg-white border-[#15a850]/40 text-[#15a850] hover:bg-[#15a850] hover:text-white hover:border-[#15a850]'
                                                            : 'bg-transparent border-[#15a850]/40 text-[#15a850] hover:bg-[#15a850] hover:text-white hover:border-[#15a850]'
                                                }`}
                                        >
                                            {String(seat.number).padStart(2, '0')}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Center Aisle / Spacer */}
                            {maxCol > 10 && <div className="w-4 sm:w-8" />}

                            {/* Right block of seats */}
                            {maxCol > 10 && (
                                <div className="flex gap-1.5 sm:gap-2">
                                    {rightCols.map(({ colNum, seat }) => {
                                        if (!seat) {
                                            return <div key={`empty-${colNum}`} className="w-7 h-7 sm:w-8 sm:h-8" />;
                                        }
                                        const isSelected = !!selectedSeats.find((s: any) => s.id === seat.id);
                                        const isBooked = seat.status === 'BOOKED' || seat.status === 'SOLD';
                                        return (
                                            <button
                                                key={seat.id}
                                                disabled={isBooked}
                                                onClick={() => onToggle(seat)}
                                                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md text-[9px] sm:text-[10px] font-medium flex items-center justify-center transition-all duration-200 border
                                                    ${isBooked 
                                                        ? isLightTheme 
                                                            ? 'bg-[#ebebeb] border-transparent text-[#bababa] cursor-not-allowed'
                                                            : 'bg-[#252530] border-transparent text-slate-700 cursor-not-allowed'
                                                        : isSelected 
                                                            ? 'bg-[#15a850] border-[#15a850] text-white shadow-[0_0_12px_rgba(21,168,80,0.4)] scale-105 z-10' 
                                                            : isLightTheme
                                                                ? 'bg-white border-[#15a850]/40 text-[#15a850] hover:bg-[#15a850] hover:text-white hover:border-[#15a850]'
                                                                : 'bg-transparent border-[#15a850]/40 text-[#15a850] hover:bg-[#15a850] hover:text-white hover:border-[#15a850]'
                                                    }`}
                                            >
                                                {String(seat.number).padStart(2, '0')}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Right Row Label */}
                            <div className={`w-6 text-left font-bold text-xs uppercase ${isLightTheme ? 'text-slate-400' : 'text-slate-600'}`}>
                                {rowLabel}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SeatSelectionPage;
