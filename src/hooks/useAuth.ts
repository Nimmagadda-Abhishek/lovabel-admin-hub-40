import { useState, useEffect } from 'react';

const ADMIN_EMAIL = "selflovernani000@gmail.com";
const SESSION_KEY = "adminSession";
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface AdminSession {
  email: string;
  timestamp: number;
  expiresAt: number;
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check if session is valid
  const checkSession = (): boolean => {
    try {
      const sessionData = localStorage.getItem(SESSION_KEY);
      if (!sessionData) return false;

      const session: AdminSession = JSON.parse(sessionData);
      const now = Date.now();

      if (session.expiresAt > now && session.email === ADMIN_EMAIL) {
        return true;
      }

      // Session expired, remove it
      localStorage.removeItem(SESSION_KEY);
      return false;
    } catch {
      localStorage.removeItem(SESSION_KEY);
      return false;
    }
  };

  // Create new session
  const createSession = (): void => {
    const now = Date.now();
    const session: AdminSession = {
      email: ADMIN_EMAIL,
      timestamp: now,
      expiresAt: now + SESSION_DURATION,
    };
    
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setIsAuthenticated(true);
  };

  // Clear session
  const clearSession = (): void => {
    localStorage.removeItem(SESSION_KEY);
    setIsAuthenticated(false);
  };

  // Initialize auth state
  useEffect(() => {
    console.log("useAuth: initializing auth state");
    const isValid = checkSession();
    console.log("useAuth: session check result:", isValid);
    setIsAuthenticated(isValid);
    setIsLoading(false);
    console.log("useAuth: initialization complete");
  }, []);

  return {
    isAuthenticated,
    isLoading,
    adminEmail: ADMIN_EMAIL,
    createSession,
    clearSession,
    checkSession,
  };
}