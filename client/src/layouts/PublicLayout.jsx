import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Hotel, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/hotels', label: 'Hotels' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

const PublicLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { session, isAuthenticated, logout } = useAuth('user');
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    toast.info('Logged out.');
    navigate('/');
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="sticky top-0 z-40 bg-white/90 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold text-brand-600">
            <Hotel className="h-6 w-6" />
            StayNepal
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `text-sm font-medium transition ${
                    isActive ? 'text-brand-600' : 'text-gray-600 hover:text-brand-600'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              to="/owner/login"
              className="text-sm font-medium text-gray-500 hover:text-brand-600"
            >
              List your property
            </Link>
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600">Hi, {session?.account?.name?.split(' ')[0]}</span>
                <Link
                  to="/user/dashboard"
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-brand-500 hover:text-brand-600"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 hover:shadow"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/user/login"
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-brand-500 hover:text-brand-600"
                >
                  Sign in
                </Link>
                <Link
                  to="/user/register"
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 hover:shadow"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="p-2 text-gray-600 md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-gray-200 px-4 py-4 md:hidden">
            <nav className="flex flex-col gap-4">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  onClick={() => setMenuOpen(false)}
                  className="text-sm font-medium text-gray-600"
                >
                  {link.label}
                </NavLink>
              ))}
              <hr className="border-gray-200" />
              <Link
                to="/owner/login"
                onClick={() => setMenuOpen(false)}
                className="text-sm font-medium text-gray-600"
              >
                List your property
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    to="/user/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="text-sm font-medium text-brand-600"
                  >
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-lg bg-brand-600 px-4 py-2 text-center text-sm font-medium text-white"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/user/login"
                    onClick={() => setMenuOpen(false)}
                    className="text-sm font-medium text-brand-600"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/user/register"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-lg bg-brand-600 px-4 py-2 text-center text-sm font-medium text-white"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
          <div>
            <p className="flex items-center gap-2 text-lg font-semibold text-brand-600">
              <Hotel className="h-5 w-5" /> StayNepal
            </p>
            <p className="mt-3 text-sm text-gray-500">
              Find and book the perfect hotel for your next trip, anywhere in Nepal.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">Explore</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-500">
              <li>
                <Link to="/hotels" className="hover:text-brand-600">
                  All Hotels
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-brand-600">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-brand-600">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-brand-600">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">Legal</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-500">
              <li>
                <Link to="/privacy-policy" className="hover:text-brand-600">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-brand-600">
                  Terms &amp; Conditions
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">For Partners</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-500">
              <li>
                <Link to="/owner/login" className="hover:text-brand-600">
                  Hotel Owner Login
                </Link>
              </li>
              <li>
                <Link to="/owner/register" className="hover:text-brand-600">
                  List Your Property
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 py-4 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} StayNepal. Built as a Final Year BCA Project.
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
