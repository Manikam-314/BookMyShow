import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import MovieDetailPage from './pages/MovieDetailPage';
import TheatreListingPage from './pages/TheatreListingPage';
import TheatreDetailPage from './pages/TheatreDetailPage';
import SeatSelectionPage from './pages/SeatSelectionPage';
import BookingSummaryPage from './pages/BookingSummaryPage';
import BookingSuccessPage from './pages/BookingSuccessPage';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageMoviesPage from './pages/admin/ManageMoviesPage';
import AddMoviePage from './pages/admin/AddMoviePage';
import ManageTheatresPage from './pages/admin/ManageTheatresPage';
import EditTheatrePage from './pages/admin/EditTheatrePage';
import AddTheatrePage from './pages/admin/AddTheatrePage';
import AddShowPage from './pages/admin/AddShowPage';
import BulkSchedulePage from './pages/admin/BulkSchedulePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="movie/:id" element={<MovieDetailPage />} />
          <Route path="buy-tickets/:movieId" element={<TheatreListingPage />} />
          <Route path="book/:showId" element={<SeatSelectionPage />} />
          <Route path="payment" element={<BookingSummaryPage />} />
          <Route path="booking-success" element={<BookingSuccessPage />} />
          <Route path="theatre/:id" element={<TheatreDetailPage />} />
          {/* Add more routes here later */}
          <Route path="*" element={<div className="p-10 text-center">Page Not Found</div>} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="movies" element={<ManageMoviesPage />} />
          <Route path="movies/add" element={<AddMoviePage />} />
          <Route path="theatres" element={<ManageTheatresPage />} />
          <Route path="theatres/add" element={<AddTheatrePage />} />
          <Route path="theatres/edit/:id" element={<EditTheatrePage />} />
          <Route path="shows" element={<div className="text-white p-10">Shows List (Coming Soon) <br /> <a href="/admin/shows/add" className="text-blue-400">Schedule Show</a> <br /> <a href="/admin/shows/bulk" className="text-green-400">Bulk Schedule</a></div>} />
          <Route path="shows/add" element={<AddShowPage />} />
          <Route path="shows/bulk" element={<BulkSchedulePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
