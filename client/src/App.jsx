import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicLayout from './layouts/PublicLayout';
import HomePage from './pages/public/HomePage';
import HotelsPage from './pages/public/HotelsPage';
import HotelDetailsPage from './pages/public/HotelDetailsPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import FaqPage from './pages/public/FaqPage';
import PrivacyPolicyPage from './pages/public/PrivacyPolicyPage';
import TermsPage from './pages/public/TermsPage';
import NotFoundPage from './pages/NotFoundPage';
import UserDashboardPage from './pages/dashboard/UserDashboardPage';
import OwnerDashboardPage from './pages/dashboard/OwnerDashboardPage';
import AdminDashboardPage from './pages/dashboard/AdminDashboardPage';
import NewBookingPage from './pages/user/NewBookingPage';
import MyBookingsPage from './pages/user/MyBookingsPage';
import MyBookingDetailsPage from './pages/user/MyBookingDetailsPage';
import ProfilePage from './pages/user/ProfilePage';
import WishlistPage from './pages/user/WishlistPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import UserDetailsPage from './pages/admin/UserDetailsPage';
import OwnerManagementPage from './pages/admin/OwnerManagementPage';
import AddOwnerPage from './pages/admin/AddOwnerPage';
import OwnerDetailsPage from './pages/admin/OwnerDetailsPage';
import HotelManagementPage from './pages/admin/HotelManagementPage';
import AdminHotelDetailsPage from './pages/admin/AdminHotelDetailsPage';
import BookingManagementPage from './pages/admin/BookingManagementPage';
import AdminBookingDetailsPage from './pages/admin/AdminBookingDetailsPage';
import MyHotelsPage from './pages/owner/MyHotelsPage';
import HotelFormPage from './pages/owner/HotelFormPage';
import OwnerHotelDetailsPage from './pages/owner/OwnerHotelDetailsPage';
import RoomFormPage from './pages/owner/RoomFormPage';
import OwnerBookingRequestsPage from './pages/owner/OwnerBookingRequestsPage';
import OwnerBookingDetailsPage from './pages/owner/OwnerBookingDetailsPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

const ROLES = ['user', 'owner', 'admin'];
const GUEST_ROLES = ['user', 'owner']; // Admin has no self-registration flow
const DASHBOARD_PAGES = { user: UserDashboardPage, owner: OwnerDashboardPage, admin: AdminDashboardPage };

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/hotels" element={<HotelsPage />} />
              <Route path="/hotels/:id" element={<HotelDetailsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/faq" element={<FaqPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {GUEST_ROLES.map((role) => (
              <Route key={role} path={`/${role}/register`} element={<RegisterPage role={role} />} />
            ))}

            {ROLES.map((role) => {
              const RoleDashboard = DASHBOARD_PAGES[role];
              return (
                <Route key={role} path={`/${role}`}>
                  <Route path="login" element={<LoginPage role={role} />} />
                  <Route path="verify-email/:token" element={<VerifyEmailPage role={role} />} />
                  <Route path="forgot-password" element={<ForgotPasswordPage role={role} />} />
                  <Route path="reset-password/:token" element={<ResetPasswordPage role={role} />} />

                  <Route element={<ProtectedRoute role={role} />}>
                    <Route path="dashboard" element={<RoleDashboard />} />
                    {role === 'user' && (
                      <>
                        <Route path="bookings/new" element={<NewBookingPage />} />
                        <Route path="bookings" element={<MyBookingsPage />} />
                        <Route path="bookings/:id" element={<MyBookingDetailsPage />} />
                        <Route path="profile" element={<ProfilePage />} />
                        <Route path="wishlist" element={<WishlistPage />} />
                      </>
                    )}
                    {role === 'owner' && (
                      <>
                        <Route path="hotels" element={<MyHotelsPage />} />
                        <Route path="hotels/add" element={<HotelFormPage />} />
                        <Route path="hotels/:id" element={<OwnerHotelDetailsPage />} />
                        <Route path="hotels/:id/edit" element={<HotelFormPage />} />
                        <Route path="hotels/:hotelId/rooms/add" element={<RoomFormPage />} />
                        <Route path="rooms/:id/edit" element={<RoomFormPage />} />
                        <Route path="bookings" element={<OwnerBookingRequestsPage />} />
                        <Route path="bookings/:id" element={<OwnerBookingDetailsPage />} />
                      </>
                    )}
                    {role === 'admin' && (
                      <>
                        <Route path="users" element={<UserManagementPage />} />
                        <Route path="users/:id" element={<UserDetailsPage />} />
                        <Route path="owners" element={<OwnerManagementPage />} />
                        <Route path="owners/add" element={<AddOwnerPage />} />
                        <Route path="owners/:id" element={<OwnerDetailsPage />} />
                        <Route path="hotels" element={<HotelManagementPage />} />
                        <Route path="hotels/:id" element={<AdminHotelDetailsPage />} />
                        <Route path="bookings" element={<BookingManagementPage />} />
                        <Route path="bookings/:id" element={<AdminBookingDetailsPage />} />
                      </>
                    )}
                  </Route>

                  <Route index element={<Navigate to={`/${role}/login`} replace />} />
                </Route>
              );
            })}
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
