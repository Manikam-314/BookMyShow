import React, { useState } from 'react';
import { Search, MapPin, X } from 'lucide-react';

interface LocationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectCity: (city: string) => void;
}

const POPULAR_CITIES = [
    { name: 'Mumbai', icon: 'https://in.bmscdn.com/m6/images/common-modules/regions/mumbai.png' },
    { name: 'Delhi-NCR', icon: 'https://in.bmscdn.com/m6/images/common-modules/regions/ncr.png' },
    { name: 'Bengaluru', icon: 'https://in.bmscdn.com/m6/images/common-modules/regions/bang.png' },
    { name: 'Hyderabad', icon: 'https://in.bmscdn.com/m6/images/common-modules/regions/hyd.png' },
    { name: 'Ahmedabad', icon: 'https://in.bmscdn.com/m6/images/common-modules/regions/ahd.png' },
    { name: 'Chandigarh', icon: 'https://in.bmscdn.com/m6/images/common-modules/regions/chd.png' },
    { name: 'Chennai', icon: 'https://in.bmscdn.com/m6/images/common-modules/regions/chen.png' },
    { name: 'Pune', icon: 'https://in.bmscdn.com/m6/images/common-modules/regions/pune.png' },
    { name: 'Kolkata', icon: 'https://in.bmscdn.com/m6/images/common-modules/regions/kolk.png' },
    { name: 'Kochi', icon: 'https://in.bmscdn.com/m6/images/common-modules/regions/koch.png' },
];

const OTHER_CITIES = [
    'Agra', 'Ajmer', 'Aligarh', 'Amritsar', 'Aurangabad', 'Bhopal', 'Bhubaneswar',
    'Coimbatore', 'Dehradun', 'Goa', 'Guwahati', 'Indore', 'Jaipur', 'Jalandhar',
    'Jamshedpur', 'Kanpur', 'Lucknow', 'Ludhiana', 'Madurai', 'Mangaluru',
    'Mysuru', 'Nagpur', 'Nashik', 'Patna', 'Raipur', 'Rajkot', 'Ranchi',
    'Surat', 'Thiruvananthapuram', 'Vadodara', 'Varanasi', 'Vijayawada', 'Visakhapatnam'
];

const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose, onSelectCity }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showAllCities, setShowAllCities] = useState(false);

    if (!isOpen) return null;

    const filteredCities = OTHER_CITIES.filter(city =>
        city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-4xl rounded-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

                {/* Search Header */}
                <div className="p-4 border-b border-gray-200">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search for your city"
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-gray-700"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button onClick={onClose} className="absolute right-0 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                    {searchTerm.length === 0 && (
                        <div className="flex items-center gap-2 text-red-500 mt-4 cursor-pointer hover:underline">
                            <MapPin className="w-5 h-5" />
                            <span className="font-medium">Detect my location</span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="overflow-y-auto p-6">
                    {searchTerm.length === 0 ? (
                        <>
                            <div className="text-center mb-8">
                                <h3 className="text-sm font-semibold text-gray-700 mb-6 uppercase tracking-wider">Popular Cities</h3>
                                <div className="flex flex-wrapjustify-center gap-4 md:gap-8">
                                    <div className="grid grid-cols-5 md:grid-cols-10 gap-x-4 gap-y-8 w-full">
                                        {POPULAR_CITIES.map(city => (
                                            <div
                                                key={city.name}
                                                className="flex flex-col items-center gap-2 cursor-pointer group"
                                                onClick={() => onSelectCity(city.name)}
                                            >
                                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border border-gray-200 p-1 group-hover:border-gray-400 transition-colors">
                                                    {/* Using generic placeholders if real images fail, but ideally these work */}
                                                    <img src={city.icon} alt={city.name} className="w-full h-full object-contain" onError={(e) => (e.currentTarget.src = 'https://cdn-icons-png.flaticon.com/512/484/484167.png')} />
                                                </div>
                                                <span className="text-xs text-gray-600 font-medium group-hover:text-gray-900">{city.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="text-center">
                                {!showAllCities ? (
                                    <button
                                        onClick={() => setShowAllCities(true)}
                                        className="text-red-500 font-medium hover:underline text-sm"
                                    >
                                        View All Cities
                                    </button>
                                ) : (
                                    <div className="animate-in slide-in-from-bottom-4 duration-300">
                                        <h3 className="text-sm font-semibold text-gray-700 mb-6 uppercase tracking-wider">Other Cities</h3>
                                        <div className="grid grid-cols-4 md:grid-cols-6 gap-4 text-left">
                                            {OTHER_CITIES.map(city => (
                                                <div
                                                    key={city}
                                                    onClick={() => onSelectCity(city)}
                                                    className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer hover:font-medium"
                                                >
                                                    {city}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">Search Results</h3>
                            <div className="grid grid-cols-4 md:grid-cols-6 gap-4 text-left">
                                {filteredCities.map(city => (
                                    <div
                                        key={city}
                                        onClick={() => onSelectCity(city)}
                                        className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer hover:font-medium py-1"
                                    >
                                        {city}
                                    </div>
                                ))}
                                {filteredCities.length === 0 && (
                                    <div className="col-span-full text-center text-gray-500 py-8">
                                        No cities found matching "{searchTerm}"
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default LocationModal;
