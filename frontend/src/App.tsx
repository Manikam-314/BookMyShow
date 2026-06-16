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
import AdminTheatreRequestsPage from './pages/admin/AdminTheatreRequestsPage';

// Auth & New Pages
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import TheatreOwnerRegisterPage from './pages/TheatreOwnerRegisterPage';
import OwnerLayout from './layouts/OwnerLayout';
import OwnerOverviewPage from './pages/owner/OwnerOverviewPage';
import OwnerMoviesPage from './pages/owner/OwnerMoviesPage';
import OwnerSchedulePage from './pages/owner/OwnerSchedulePage';
import OwnerShowsPage from './pages/owner/OwnerShowsPage';
import OwnerSeatsPage from './pages/owner/OwnerSeatsPage';
import OwnerSettingsPage from './pages/owner/OwnerSettingsPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public standalone pages */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/theatre/register" element={<TheatreOwnerRegisterPage />} />
          <Route path="/unauthorized" element={
            <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-center">
              <div>
                <h1 className="text-4xl font-bold mb-4">403 — Forbidden</h1>
                <p className="text-slate-400 mb-6">You don't have permission to access this page.</p>
                <a href="/" className="text-red-400 hover:underline">← Go Home</a>
              </div>
            </div>
          } />

          {/* ───── Theatre Owner Portal ───── */}
          <Route path="/owner" element={
            <ProtectedRoute requiredRole="THEATRE_OWNER">
              <OwnerLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<OwnerOverviewPage />} />
            <Route path="movies" element={<OwnerMoviesPage />} />
            <Route path="schedule" element={<OwnerSchedulePage />} />
            <Route path="shows" element={<OwnerShowsPage />} />
            <Route path="seats" element={<OwnerSeatsPage />} />
            <Route path="settings" element={<OwnerSettingsPage />} />
          </Route>

          {/* Main public layout */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="movies" element={<HomePage />} />
            <Route path="movie/:id" element={<MovieDetailPage />} />
            <Route path="buy-tickets/:movieId" element={<TheatreListingPage />} />
            <Route path="book/:showId" element={<SeatSelectionPage />} />
            <Route path="payment" element={<BookingSummaryPage />} />
            <Route path="booking-success" element={<BookingSuccessPage />} />
            <Route path="theatre/:id" element={<TheatreDetailPage />} />
            <Route path="*" element={<div className="p-10 text-center">Page Not Found</div>} />
          </Route>

          {/* Admin Routes — ADMIN role required */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="movies" element={<ManageMoviesPage />} />
            <Route path="movies/add" element={<AddMoviePage />} />
            <Route path="theatres" element={<ManageTheatresPage />} />
            <Route path="theatres/add" element={<AddTheatrePage />} />
            <Route path="theatres/edit/:id" element={<EditTheatrePage />} />
            <Route path="shows" element={<div className="text-white p-10">Shows List (Coming Soon) <br /> <a href="/admin/shows/add" className="text-blue-400">Schedule Show</a> <br /> <a href="/admin/shows/bulk" className="text-green-400">Bulk Schedule</a></div>} />
            <Route path="shows/add" element={<AddShowPage />} />
            <Route path="shows/bulk" element={<BulkSchedulePage />} />
            <Route path="theatre-requests" element={<AdminTheatreRequestsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
