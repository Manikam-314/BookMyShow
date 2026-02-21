import React, { useState, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';
import type { Show } from '../types';

interface TimeInputWithScheduleProps {
    value: string;
    onChange: (value: string) => void;
    existingShows: Show[];
    standardTimings?: string[];
}

const TimeInputWithSchedule: React.FC<TimeInputWithScheduleProps> = ({ value, onChange, existingShows, standardTimings = [] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Format existing shows for display
    const sortedShows = [...existingShows].sort((a, b) =>
        new Date(a.showTime).getTime() - new Date(b.showTime).getTime()
    );

    const handleSelectTime = (time: string) => {
        let cleanTime = time.trim();
        // If time is like "9:30", pad it to "09:30"
        if (/^\d:\d{2}$/.test(cleanTime)) {
            cleanTime = "0" + cleanTime;
        }
        onChange(cleanTime);
        setIsOpen(false);
    };

    return (
        <div className="relative w-full" ref={containerRef}>
            <div className="relative">
                <input
                    type="time"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    className="w-full bg-slate-900 text-white p-2 pl-10 rounded border border-slate-600 focus:border-red-500 outline-none transition-colors"
                />
                <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 z-50 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                    {/* Standard Timings Section */}
                    {standardTimings.length > 0 && (
                        <>
                            <div className="p-3 border-b border-slate-700 bg-slate-900 font-semibold text-xs text-blue-400 uppercase tracking-wider">
                                Standard Timings
                            </div>
                            <div className="p-2 grid grid-cols-3 gap-2 border-b border-slate-700">
                                {standardTimings.map((time, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSelectTime(time)}
                                        className="bg-slate-700 hover:bg-blue-600 hover:text-white text-gray-300 text-xs py-1 px-2 rounded transition-colors"
                                    >
                                        {time.trim()}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Existing Schedule Section */}
                    <div className="p-3 border-b border-slate-700 bg-slate-900 font-semibold text-xs text-gray-400 uppercase tracking-wider">
                        Existing Schedule
                    </div>
                    {sortedShows.length > 0 ? (
                        <div className="max-h-48 overflow-y-auto">
                            {sortedShows.map((show) => (
                                <div key={show.id} className="p-3 border-b border-slate-700/50 hover:bg-slate-700 transition-colors last:border-0 opacity-75">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-red-400 font-bold text-sm">
                                            {new Date(show.showTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <span className="text-xs text-slate-500 border border-slate-600 px-1 rounded">
                                            {show.type || '2D'}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-300 truncate" title={show.movie?.title}>
                                        {show.movie?.title || 'Unknown Movie'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 text-center text-sm text-gray-400">
                            No shows scheduled yet.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TimeInputWithSchedule;
