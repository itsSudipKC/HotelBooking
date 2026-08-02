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
import DashboardPage from './pages/DashboardPage';
import BookingComingSoonPage from './pages/user/BookingComingSoonPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

const ROLES = ['user', 'owner', 'admin'];
const GUEST_ROLES = ['user', 'owner']; // Admin has no self-registration flow

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

            {ROLES.map((role) => (
              <Route key={role} path={`/${role}`}>
                <Route path="login" element={<LoginPage role={role} />} />
                <Route path="verify-email/:token" element={<VerifyEmailPage role={role} />} />
                <Route path="forgot-password" element={<ForgotPasswordPage role={role} />} />
                <Route path="reset-password/:token" element={<ResetPasswordPage role={role} />} />

                <Route element={<ProtectedRoute role={role} />}>
                  <Route path="dashboard" element={<DashboardPage role={role} />} />
                  {role === 'user' && <Route path="bookings/new" element={<BookingComingSoonPage />} />}
                </Route>

                <Route index element={<Navigate to={`/${role}/login`} replace />} />
              </Route>
            ))}
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
