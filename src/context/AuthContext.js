// src/context/AuthContext.js
import React, { createContext, useEffect, useState } from 'react';
import { initDatabase, getLoggedInUser, logoutAllUsers } from '../db/database';

export const AuthContext = createContext({
  currentUser: null,
  setCurrentUser: () => {},
  logout: () => {},
});

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      await initDatabase();
      const u = await getLoggedInUser();
      setCurrentUser(u || null);
      setReady(true);
    })();
  }, []);

  async function logout() {
    await logoutAllUsers();
    setCurrentUser(null);
  }

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, logout, ready }}>
      {children}
    </AuthContext.Provider>
  );
}