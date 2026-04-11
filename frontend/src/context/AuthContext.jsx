import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const tokenRef = useRef(token);
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  });
  const [authLoading, setAuthLoading] = useState(true);

  const persistAuth = useCallback((nextToken, nextUser) => {
    if (nextToken) {
      localStorage.setItem('token', nextToken);
      setToken(nextToken);
      tokenRef.current = nextToken;
    } else {
      localStorage.removeItem('token');
      setToken(null);
      tokenRef.current = null;
    }

    if (nextUser) {
      localStorage.setItem('user', JSON.stringify(nextUser));
      setUser(nextUser);
    } else {
      localStorage.removeItem('user');
      setUser(null);
    }
  }, []);

  const logout = useCallback(() => {
    persistAuth(null, null);
  }, [persistAuth]);

  const refreshMe = useCallback(async (incomingToken) => {
    const activeToken = incomingToken ?? tokenRef.current;
    if (!activeToken) {
      setAuthLoading(false);
      return null;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
      });

      if (!res.ok) {
        logout();
        setAuthLoading(false);
        return null;
      }

      const data = await res.json();
      persistAuth(activeToken, data);
      setAuthLoading(false);
      return data;
    } catch {
      logout();
      setAuthLoading(false);
      return null;
    }
  }, [logout, persistAuth]);

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  const login = useCallback(async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');

    persistAuth(data.token, data.user);
    setAuthLoading(false);
    return data.user;
  }, [persistAuth]);

  const register = useCallback(async (name, email, password, role) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await res.json();
    if (!res.ok) {
      const msg = data.errors?.[0]?.msg || data.message || 'Registration failed';
      throw new Error(msg);
    }

    persistAuth(data.token, data.user);
    setAuthLoading(false);
    return data.user;
  }, [persistAuth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        authLoading,
        login,
        register,
        logout,
        refreshMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useAuth() {
  return useContext(AuthContext);
}