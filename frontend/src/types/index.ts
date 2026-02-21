export interface Movie {
    id: number;
    title: string;
    description: string;
    language: string;
    genre: string;
    duration: number; // in minutes
    releaseDate: string;
    posterUrl: string;
    bannerUrl: string;
    rating: number;
    votes: number;
    sensorRating?: string; // U, UA, A
    format?: string[]; // 2D, 3D, IMAX
}

export interface Theatre {
    id: number;
    name: string;
    city: string;
    address: string;
    facilities?: string[];
    showTimings?: string; // Comma separated: "10:00,14:00"
}

export interface Show {
    id: number;
    movieId: number;
    movie: Movie;
    theaterId: number;
    theater: Theatre;
    showTime: string; // ISO date string
    type: string; // 2D, 3D
    language: string;
    minPrice: number;
    maxPrice: number;
    theaterResource?: Theatre;
}

export interface ShowSeat {
    id: number;
    row: string;
    number: number;
    type: 'RECLINER' | 'FIRST_CLASS' | 'SECOND_CLASS';
    price: number;
    status: 'AVAILABLE' | 'BOOKED' | 'LOCKED' | 'SOLD';
}
