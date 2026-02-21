import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ChevronLeft, ZoomIn, ZoomOut, X } from 'lucide-react';
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

    // Data states
    const [show, setShow] = useState<Show | null>(null);
    const [movie, setMovie] = useState<Movie | null>(null);
    const [theatre, setTheatre] = useState<Theatre | null>(null);
    const [loading, setLoading] = useState(true);

    // Dynamic Seat Layout State
    const [seatLayout, setSeatLayout] = useState<{
        recliner: ShowSeat[];
        firstClass: ShowSeat[];
        secondClass: ShowSeat[];
    }>({ recliner: [], firstClass: [], secondClass: [] });

    React.useEffect(() => {
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

                // Process and categorize seats from backend
                const processedLayout = processSeats(seatsData);
                setSeatLayout(processedLayout);

            } catch (error) {
                console.error("Failed to load session data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [showId]);

    // Helper to process backend seat data into frontend layout
    const processSeats = (backendSeats: any[]): { recliner: ShowSeat[]; firstClass: ShowSeat[]; secondClass: ShowSeat[] } => {
        const layout = { recliner: [] as ShowSeat[], firstClass: [] as ShowSeat[], secondClass: [] as ShowSeat[] };

        backendSeats.forEach(seat => {
            // Parse seat number (e.g., "A1" -> Row "A", Number 1)
            const match = seat.seatNumber.match(/([A-Z]+)(\d+)/);
            const row = match ? match[1] : '';
            const number = match ? parseInt(match[2], 10) : 0;

            const contentSeat: ShowSeat = {
                id: seat.id,
                row: row,
                number: number,
                type: seat.seatType,
                price: seat.rate,
                status: seat.booked ? 'BOOKED' : 'AVAILABLE'
            };

            if (seat.seatType === 'RECLINER') {
                layout.recliner.push(contentSeat);
            } else if (seat.seatType === 'FIRST_CLASS') {
                layout.firstClass.push(contentSeat);
            } else if (seat.seatType === 'SECOND_CLASS') {
                layout.secondClass.push(contentSeat);
            }
        });

        // Sort seats by row and number for correct display
        const sortFn = (a: ShowSeat, b: ShowSeat) => {
            if (a.row === b.row) return a.number - b.number;
            return a.row.localeCompare(b.row);
        };

        layout.recliner.sort(sortFn);
        layout.firstClass.sort(sortFn);
        layout.secondClass.sort(sortFn);

        return layout;
    };

    const toggleSeat = (startSeat: ShowSeat) => {
        if (startSeat.status !== 'AVAILABLE') return;

        // If clicking an already selected seat, just deselect everything to start over or deselect that block
        if (selectedSeats.find(s => s.id === startSeat.id)) {
            setSelectedSeats([]);
            return;
        }

        // Try to find N contiguous seats in the same row
        const rowSeats = getAllSeats().filter(s => s.row === startSeat.row).sort((a, b) => a.number - b.number);
        const startIndex = rowSeats.findIndex(s => s.id === startSeat.id);

        if (startIndex === -1) return;

        const potentialSeats = [];
        for (let i = 0; i < ticketCount; i++) {
            const nextSeat = rowSeats[startIndex + i];
            if (nextSeat && nextSeat.status === 'AVAILABLE') {
                potentialSeats.push(nextSeat);
            } else {
                break; // Stop if we hit a gap or booked seat
            }
        }

        // Only select if we found the exact number of requested seats (strict) or at least 1 (lenient) - let's be lenient but try best effort
        if (potentialSeats.length > 0) {
            setSelectedSeats(potentialSeats);
        }
    };

    // Helper to flatten the seat structure for easier searching
    const getAllSeats = () => {
        return [
            ...seatLayout.recliner,
            ...seatLayout.firstClass,
            ...seatLayout.secondClass
        ];
    };

    const handleQuantitySelect = (qty: number) => {
        setTicketCount(qty);
        setShowQuantityModal(false);
    };

    const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

    const handleProceed = () => {
        navigate('/payment', {
            state: {
                movie,
                theatre,
                show,
                selectedSeats,
                totalPrice,
                ticketCount
            }
        });
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center dark:text-white">Loading seat layout...</div>;
    if (!show || !movie || !theatre) return <div className="min-h-screen flex items-center justify-center dark:text-white">Session not found</div>;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col overflow-hidden text-gray-900">

            <SeatQuantityModal
                isOpen={showQuantityModal}
                onClose={() => setShowQuantityModal(false)}
                onSelect={handleQuantitySelect}
            />

            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center z-40 relative shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
                        <ChevronLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                            {movie.title} <span className="text-xs font-normal border border-gray-300 rounded px-1 text-gray-500">{movie.sensorRating || 'UA'}</span>
                        </h1>
                        <p className="text-xs text-gray-500">
                            {theatre.name}: {theatre.city} | {new Date(show.showTime).toLocaleDateString()} {new Date(show.showTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowQuantityModal(true)}
                        className="px-4 py-1 border border-red-500 text-red-500 rounded text-sm font-medium hover:bg-red-50 transition-colors"
                    >
                        {ticketCount} Tickets
                    </button>
                    <button onClick={() => navigate(-1)} className="p-2">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden relative">

                {/* Seat Map Container */}
                <div
                    className="flex-1 overflow-auto relative bg-white flex items-center justify-center p-10 cursor-grab active:cursor-grabbing scroller"
                    id="seat-map-container"
                >

                    {/* Scale Transform Wrapper */}
                    <div style={{ transform: `scale(${scale})` }} className="transition-transform duration-200 origin-center text-center pb-32">

                        {/* Screen (Bottom in reference usually, but sticking to top as implemented unless requested, user didn't complain about pos) */}
                        {/* Actually reference shows screen at bottom "All eyes this way please". Let's move it to bottom? 
                            The user's reference screenshot has it at the bottom. I will move it to the bottom of the grid. 
                        */}

                        {/* Render Sections with Aisles */}
                        <div className="flex flex-col gap-8">
                            {seatLayout.recliner.length > 0 && (
                                <SeatSection
                                    title={`Recliner - ₹${seatLayout.recliner[0]?.price}`}
                                    seats={seatLayout.recliner}
                                    selectedSeats={selectedSeats}
                                    onToggle={toggleSeat}
                                />
                            )}

                            {seatLayout.firstClass.length > 0 && (
                                <SeatSection
                                    title={`First Class - ₹${seatLayout.firstClass[0]?.price}`}
                                    seats={seatLayout.firstClass}
                                    selectedSeats={selectedSeats}
                                    onToggle={toggleSeat}
                                />
                            )}

                            {seatLayout.secondClass.length > 0 && (
                                <SeatSection
                                    title={`Second Class - ₹${seatLayout.secondClass[0]?.price}`}
                                    seats={seatLayout.secondClass}
                                    selectedSeats={selectedSeats}
                                    onToggle={toggleSeat}
                                />
                            )}
                        </div>

                        {/* Screen Indicator - Moved to Bottom matching reference */}
                        <div className="mt-16 mb-8">
                            <p className="text-xs text-gray-400 mb-2">All eyes this way please</p>
                            <div className="w-[600px] h-12 bg-gradient-to-t from-blue-300/20 to-transparent border-b-4 border-blue-400 mx-auto transform perspective-[500px] rotateX-[30deg] shadow-[0_20px_50px_rgba(59,130,246,0.2)]"></div>
                        </div>

                    </div>
                </div>

                {/* Professional Minimap - Top Right Overlay */}
                <div className="absolute top-4 right-4 z-20 bg-black/80 backdrop-blur-sm p-2 rounded-lg border border-white/10 shadow-2xl w-48 hidden md:block">
                    <p className="text-[10px] text-white/70 mb-2 font-medium tracking-wider uppercase text-center">Minimap</p>
                    <div className="bg-white/5 rounded p-2 h-32 relative overflow-hidden flex items-center justify-center">
                        {/* Schematic view of seats */}
                        <div className="grid gap-[1px] transform scale-75 origin-center">
                            {[...seatLayout.recliner, ...seatLayout.firstClass, ...seatLayout.secondClass].map(seat => (
                                <div
                                    key={`mini-${seat.id}`}
                                    className={`w-[2px] h-[2px] rounded-full ${seat.status === 'BOOKED' ? 'bg-gray-600' :
                                            selectedSeats.find(s => s.id === seat.id) ? 'bg-green-500' : 'bg-white/50'
                                        }`}
                                    style={{
                                        gridColumn: seat.number,
                                        gridRow: seat.row.charCodeAt(0) - 64
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

            </div>

            {/* Footer / Booking Action - Fixed at bottom */}
            {selectedSeats.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-5px_15px_rgba(0,0,0,0.1)] z-[100]">
                    <div className="max-w-4xl mx-auto flex justify-center">
                        <button
                            onClick={handleProceed}
                            className="bg-red-500 hover:bg-red-600 text-white px-20 py-3 rounded-lg font-bold text-lg shadow-lg shadow-red-500/30 transition-transform hover:scale-105 flex items-center gap-2"
                        >
                            Pay ₹{totalPrice}
                        </button>
                    </div>
                </div>
            )}

            {/* Zoom Controls */}
            <div className="absolute bottom-24 right-8 z-40 flex flex-col gap-2">
                <button onClick={() => setScale(s => Math.min(s + 0.1, 1.5))} className="p-2 bg-white rounded shadow-md border border-gray-200 hover:bg-gray-50 text-gray-600">
                    <ZoomIn className="w-5 h-5" />
                </button>
                <button onClick={() => setScale(s => Math.max(s - 0.1, 0.5))} className="p-2 bg-white rounded shadow-md border border-gray-200 hover:bg-gray-50 text-gray-600">
                    <ZoomOut className="w-5 h-5" />
                </button>
            </div>

        </div>
    );
};

// Component to render a section of seats with aisles
const SeatSection = ({ title, seats, selectedSeats, onToggle }: { title: string, seats: ShowSeat[], selectedSeats: ShowSeat[], onToggle: (s: ShowSeat) => void }) => {
    // Group seats by row
    const rows = React.useMemo(() => {
        const map = new Map<string, ShowSeat[]>();
        seats.forEach(s => {
            if (!map.has(s.row)) map.set(s.row, []);
            map.get(s.row)?.push(s);
        });
        return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    }, [seats]);

    return (
        <div className="mb-4">
            <p className="text-xs text-gray-400 mb-4 font-medium uppercase tracking-widest">{title}</p>
            <div className="flex flex-col gap-3">
                {rows.map(([rowLabel, rowSeats]) => (
                    <div key={rowLabel} className="flex items-center justify-center gap-6">
                        {/* Row Alphabet - Prominent and Aligned */}
                        <div className="w-6 flex justify-end">
                            <span className="text-sm text-gray-500 font-medium">{rowLabel}</span>
                        </div>

                        <div className="flex gap-4">
                            {/* Simple visual grouping */}
                            <div className="flex gap-1.5">
                                {rowSeats.map(seat => {
                                    const isSelected = !!selectedSeats.find(s => s.id === seat.id);
                                    const isBooked = seat.status === 'BOOKED';

                                    return (
                                        <button
                                            key={seat.id}
                                            disabled={isBooked}
                                            onClick={() => onToggle(seat)}
                                            className={`
                                                w-7 h-7 rounded text-[10px] font-medium flex items-center justify-center transition-all duration-200
                                                ${isBooked
                                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                    : isSelected
                                                        ? 'bg-green-500 text-white shadow-md transform scale-105'
                                                        : 'bg-white border border-green-500 text-green-600 hover:bg-green-50'
                                                }
                                            `}
                                        >
                                            {seat.number}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Sub-component for individual seat
const Seat = ({ seat, isSelected, onClick }: { seat: ShowSeat, isSelected: boolean, onClick: () => void }) => {
    const isBooked = seat.status === 'BOOKED';

    let seatColor = 'bg-white border-green-500 text-green-500 hover:bg-green-50'; // Available
    if (isBooked) seatColor = 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed'; // Booked
    if (isSelected) seatColor = 'bg-green-500 border-green-500 text-white shadow-md transform scale-105'; // Selected

    return (
        <button
            disabled={isBooked}
            onClick={onClick}
            className={`
                w-7 h-7 md:w-8 md:h-8 rounded-sm md:rounded-md border text-[10px] md:text-xs font-medium flex items-center justify-center transition-all duration-200
                ${seatColor} 
                ${isSelected ? '!bg-green-500 !border-green-500 !text-white' : ''}
            `}
        >
            {seat.row}{seat.number}
        </button>
    );
};

export default SeatSelectionPage;
