import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday } from 'date-fns';

interface CustomDatePickerProps {
    value: string; // YYYY-MM-DD
    onChange: (date: string) => void;
    label?: string;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ value, onChange, label = "Select Date" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(value ? new Date(value) : null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (value) {
            setSelectedDate(new Date(value));
            setCurrentMonth(new Date(value));
        } else {
            setSelectedDate(null);
        }
    }, [value]);

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

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const onDateClick = (day: Date) => {
        setSelectedDate(day);
        onChange(format(day, 'yyyy-MM-dd'));
        setIsOpen(false);
    };

    const renderHeader = () => {
        return (
            <div className="flex justify-between items-center mb-4 px-2">
                <button onClick={prevMonth} className="p-1 hover:bg-slate-700 rounded-full text-gray-300">
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="text-white font-bold text-lg">
                    {format(currentMonth, 'MMMM yyyy')}
                </div>
                <button onClick={nextMonth} className="p-1 hover:bg-slate-700 rounded-full text-gray-300">
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        );
    };

    const renderDays = () => {
        const days = [];
        const dateFormat = "EEE";
        const startDate = startOfWeek(currentMonth);

        for (let i = 0; i < 7; i++) {
            days.push(
                <div className="text-center text-xs font-semibold text-gray-500 uppercase py-2" key={i}>
                    {format(addDays(startDate, i), dateFormat)}
                </div>
            );
        }
        return <div className="grid grid-cols-7 mb-2">{days}</div>;
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = "";

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, 'd');
                const cloneDay = day;
                const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                const isCurrentMonth = isSameMonth(day, monthStart);

                days.push(
                    <div
                        key={day.toString()}
                        onClick={() => onDateClick(cloneDay)}
                        className={`
                            h-10 w-10 flex items-center justify-center rounded-full cursor-pointer transition-all mx-auto text-sm
                            ${!isCurrentMonth ? 'text-slate-600' : ''}
                            ${isSelected
                                ? 'bg-red-600 text-white font-bold shadow-lg shadow-red-600/30 transform scale-110'
                                : isCurrentMonth ? 'text-gray-200 hover:bg-slate-700' : ''}
                            ${isToday(day) && !isSelected ? 'border border-blue-500 text-blue-400' : ''}
                        `}
                    >
                        {formattedDate}
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div className="grid grid-cols-7 gap-y-2" key={day.toString()}>
                    {days}
                </div>
            );
            days = [];
        }
        return <div className="space-y-2">{rows}</div>;
    };

    return (
        <div className="relative" ref={containerRef}>
            <label className="block text-gray-400 mb-2">{label}</label>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-full bg-slate-900 mx-auto cursor-pointer p-3 rounded-lg border 
                    flex items-center justify-between transition-colors
                    ${isOpen ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-600 hover:border-slate-500'}
                `}
            >
                <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className={value ? "text-white font-medium" : "text-gray-500"}>
                        {value ? format(new Date(value), 'PPP') : "Select a date..."}
                    </span>
                </div>
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 z-50 w-[320px] bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-200">
                    {renderHeader()}
                    {renderDays()}
                    {renderCells()}
                </div>
            )}
        </div>
    );
};

export default CustomDatePicker;
