import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// Returns the session slice + actions for one specific role, so pages don't
// have to reach into `sessions.user` / `sessions.owner` themselves.
export const useAuth = (role) => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const { sessions, loading, loginAs, logoutAs, refreshAs } = ctx;

  return {
    session: sessions[role],
    isAuthenticated: !!sessions[role],
    isLoading: loading[role],
    login: (credentials) => loginAs(role, credentials),
    logout: () => logoutAs(role),
    refresh: () => refreshAs(role),
  };
};
