import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, X } from 'lucide-react';
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
        <div className="min-h-screen bg-[#0a0a0f] flex flex-col overflow-hidden text-slate-300 font-sans">
            <SeatQuantityModal isOpen={showQuantityModal} onClose={() => setShowQuantityModal(false)} onSelect={handleQuantitySelect} />

            {/* Header */}
            <header className="bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex justify-between items-center z-50 sticky top-16 shadow-2xl">
                <div className="flex items-center gap-6">
                    <button onClick={() => navigate(-1)} className="bg-white/5 hover:bg-white/10 p-2.5 rounded-2xl border border-white/10 transition-all group">
                        <ChevronLeft className="w-6 h-6 text-slate-400 group-hover:text-white" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-white flex items-center gap-3 tracking-tight">
                            {movie.title}
                            <span className="text-[10px] font-bold border border-white/20 rounded-md px-2 py-0.5 text-slate-500 tracking-wider">{movie.sensorRating || 'UA'}</span>
                        </h1>
                        <p className="text-[10px] text-slate-500 font-medium tracking-wider mt-1">
                            {theatre.name} • {new Date(show.showTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="hidden lg:flex items-center gap-6 text-[11px] font-medium text-slate-400 mr-4">
                        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm bg-white/5 border border-white/10"></div> Available</div>
                        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm bg-white/20 border border-white/20"></div> Booked</div>
                        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm bg-red-600 shadow-[0_0_10px_rgba(239,68,68,0.4)]"></div> Selected</div>
                    </div>
                    <button onClick={() => setShowQuantityModal(true)} className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-2 rounded-xl border border-red-500/30 text-xs font-semibold tracking-tight transition-all whitespace-nowrap">
                        {ticketCount} Tickets
                    </button>
                    <button onClick={() => navigate(-1)} className="hover:text-white transition-colors">
                        <X className="w-5 h-5 text-slate-600" />
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden relative">
                <div className="flex-1 overflow-auto relative bg-[#0a0a0f] flex items-center justify-center p-20 cursor-grab active:cursor-grabbing scroller" id="seat-map-container">
                    <div style={{ transform: `scale(${scale})` }} className="transition-transform duration-300 origin-center text-center pb-40">
                        <div className="flex flex-col gap-12">
                            {seatLayout.recliner.length > 0 && <SeatRowSection title="Recliner" price={seatLayout.recliner[0].price} seats={seatLayout.recliner} selectedSeats={selectedSeats} onToggle={toggleSeat} />}
                            {seatLayout.firstClass.length > 0 && <SeatRowSection title="First Class" price={seatLayout.firstClass[0].price} seats={seatLayout.firstClass} selectedSeats={selectedSeats} onToggle={toggleSeat} />}
                            {seatLayout.secondClass.length > 0 && <SeatRowSection title="Second Class" price={seatLayout.secondClass[0].price} seats={seatLayout.secondClass} selectedSeats={selectedSeats} onToggle={toggleSeat} />}
                        </div>

                        {/* Screen Indicator */}
                        <div className="mt-24 mb-10 opacity-70">
                            <p className="text-[11px] font-semibold text-slate-600 mb-6 tracking-[0.3em] uppercase">Cinematic Stage</p>
                            <div className="w-[700px] h-2 bg-red-600 rounded-full mx-auto shadow-[0_10px_40px_rgba(239,68,68,0.6)] blur-[1px]"></div>
                            <div className="w-[600px] h-16 bg-gradient-to-t from-red-600/10 to-transparent mx-auto mt-2 rounded-b-[100%]"></div>
                        </div>
                    </div>
                </div>

                {/* Minimap Overlay */}
                <div className="absolute top-10 right-10 z-20 bg-black/60 backdrop-blur-2xl p-4 rounded-3xl border border-white/10 shadow-2xl w-52 hidden lg:block group">
                    <p className="text-[9px] text-white/40 mb-4 font-black tracking-[0.3em] uppercase text-center group-hover:text-red-500 transition-colors">Tactical View</p>
                    <div className="bg-black/40 rounded-2xl p-4 h-32 relative overflow-hidden flex items-center justify-center border border-white/5">
                        <div className="grid gap-[2px] transform scale-90 origin-center">
                            {[...seatLayout.recliner, ...seatLayout.firstClass, ...seatLayout.secondClass].map(seat => (
                                <div key={`mini-${seat.id}`} className={`w-[3px] h-[3px] rounded-full transition-all ${seat.status === 'BOOKED' ? 'bg-white/10' : selectedSeats.find(s => s.id === seat.id) ? 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,1)]' : 'bg-white/30'}`} style={{ gridColumn: seat.number, gridRow: seat.row.charCodeAt(0) - 64 }} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Checkout Bar */}
            {selectedSeats.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-black/40 backdrop-blur-3xl border-t border-white/10 p-6 z-[100] animate-in slide-in-from-bottom-10 duration-500">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-10">
                            <div>
                                <p className="text-[10px] text-slate-510 font-medium tracking-wide mb-1">Seats Selected</p>
                                <div className="flex gap-2">
                                    {selectedSeats.map(s => (
                                        <span key={s.id} className="bg-white/5 px-2 py-1 rounded text-xs font-semibold border border-white/10 text-white lowercase">{s.row}{s.number}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="h-10 w-px bg-white/10 hidden sm:block" />
                            <div className="hidden sm:block">
                                <p className="text-[10px] text-slate-510 font-medium tracking-wide mb-1">Total Savings</p>
                                <p className="text-xs font-semibold text-emerald-400">₹0.00 <span className="text-[9px] text-slate-600 font-normal">(Promo Ready)</span></p>
                            </div>
                        </div>
                        <button onClick={handleProceed} className="bg-red-600 hover:bg-red-700 text-white px-12 py-4 rounded-2xl font-bold text-sm tracking-tight shadow-2xl shadow-red-600/30 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-3 group/pay">
                            Checkout ₹{totalPrice}
                            <div className="bg-white/20 p-1 rounded-md group-hover/pay:bg-white/30 transition-colors">
                                <ChevronRight className="w-4 h-4" />
                            </div>
                        </button>
                    </div>
                </div>
            )}

            {/* Zoom Controls */}
            <div className="absolute bottom-28 right-10 z-40 flex flex-col gap-3">
                <button onClick={() => setScale(s => Math.min(s + 0.1, 1.5))} className="p-3 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 hover:bg-white/10 transition-all text-slate-400 hover:text-white shadow-2xl">
                    <ZoomIn className="w-5 h-5" />
                </button>
                <button onClick={() => setScale(s => Math.max(s - 0.1, 0.5))} className="p-3 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 hover:bg-white/10 transition-all text-slate-400 hover:text-white shadow-2xl">
                    <ZoomOut className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

const SeatRowSection = ({ title, price, seats, selectedSeats, onToggle }: any) => {
    const rows = useMemo(() => {
        const map = new Map<string, ShowSeat[]>();
        seats.forEach((s: any) => { if (!map.has(s.row)) map.set(s.row, []); map.get(s.row)?.push(s); });
        return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    }, [seats]);

    return (
        <div className="mb-8">
            <div className="text-[11px] text-slate-600 mb-8 font-medium tracking-[0.2em] uppercase flex items-center justify-center gap-4">
                <div className="h-px w-20 bg-white/5" /> {title} — ₹{price} <div className="h-px w-20 bg-white/5" />
            </div>
            <div className="flex flex-col gap-4">
                {rows.map(([rowLabel, rowSeats]) => (
                    <div key={rowLabel} className="flex items-center justify-center gap-10">
                        <div className="w-6 text-right font-semibold text-slate-700 text-xs lowercase">{rowLabel}</div>
                        <div className="flex gap-2">
                            {rowSeats.map(seat => {
                                const isSelected = !!selectedSeats.find((s: any) => s.id === seat.id);
                                const isBooked = seat.status === 'BOOKED';
                                return (
                                    <button
                                        key={seat.id} disabled={isBooked} onClick={() => onToggle(seat)}
                                        className={`w-8 h-8 rounded-lg text-[10px] font-semibold flex items-center justify-center transition-all duration-300 border
                                            ${isBooked ? 'bg-white/5 border-white/5 text-slate-800 cursor-not-allowed' :
                                                isSelected ? 'bg-red-600 border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] scale-105 z-10' :
                                                    'bg-transparent border-white/10 text-slate-500 hover:border-red-500/50 hover:text-red-500'}`}
                                    >
                                        {seat.number}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="w-6 text-left font-semibold text-slate-700 text-xs lowercase">{rowLabel}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SeatSelectionPage;
