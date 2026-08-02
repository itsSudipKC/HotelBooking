import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import * as authService from '../services/authService';

export const AuthContext = createContext(null);

const ROLES = ['user', 'owner', 'admin'];

const emptySessions = { user: null, owner: null, admin: null };
const initialLoading = { user: true, owner: true, admin: true };

// Holds one independent session per role (User / Owner / Admin), matching the
// backend's role-scoped refresh cookies — a single browser can be logged in
// as more than one role at once, e.g. an Owner testing the guest booking flow.
export const AuthProvider = ({ children }) => {
  const [sessions, setSessions] = useState(emptySessions);
  const [loading, setLoading] = useState(initialLoading);

  const setSession = useCallback((role, session) => {
    setSessions((current) => ({ ...current, [role]: session }));
  }, []);

  const setRoleLoading = useCallback((role, value) => {
    setLoading((current) => ({ ...current, [role]: value }));
  }, []);

  // On mount, try to silently resume each role's session from its httpOnly
  // refresh cookie (if present) — the access token itself only ever lives
  // in memory, never in localStorage, so a hard refresh needs this to avoid
  // bouncing an already-logged-in user back to the login page.
  useEffect(() => {
    ROLES.forEach(async (role) => {
      try {
        const { data } = await authService.refreshToken(role);
        const me = await authService.getMe(role, data.accessToken);
        setSession(role, { account: me.data.account, accessToken: data.accessToken });
      } catch {
        setSession(role, null);
      } finally {
        setRoleLoading(role, false);
      }
    });
  }, [setSession, setRoleLoading]);

  const loginAs = useCallback(
    async (role, credentials) => {
      const { data } = await authService.login(role, credentials);
      setSession(role, { account: data.account, accessToken: data.accessToken });
      return data;
    },
    [setSession]
  );

  const logoutAs = useCallback(
    async (role) => {
      try {
        await authService.logout(role);
      } finally {
        setSession(role, null);
      }
    },
    [setSession]
  );

  const refreshAs = useCallback(
    async (role) => {
      const { data } = await authService.refreshToken(role);
      setSessions((current) => ({
        ...current,
        [role]: current[role] ? { ...current[role], accessToken: data.accessToken } : current[role],
      }));
      return data.accessToken;
    },
    []
  );

  const value = useMemo(
    () => ({ sessions, loading, loginAs, logoutAs, refreshAs }),
    [sessions, loading, loginAs, logoutAs, refreshAs]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
