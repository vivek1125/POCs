import React, { createContext, useState, useContext, useEffect } from 'react';

interface UserShape {
  userName: string;
  email?: string;
  role?: string;
}

interface AuthContextType {
  user: UserShape | null;
  token: string | null;
  // accept either a username string or a full user object
  login: (user: string | UserShape, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserShape | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Restore auth state from localStorage on app startup
  useEffect(() => {
    const storedToken = localStorage.getItem('jwtToken');
    const storedUser = localStorage.getItem('userData');
    
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        console.log('Auth restored from localStorage:', { user: parsedUser, hasToken: !!storedToken });
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        // Clear invalid data
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('userData');
      }
    } else if (storedToken && !storedUser) {
      // Handle case where we have token but no user data
      console.log('Found token but no user data, keeping token for API calls');
      setToken(storedToken);
    }
  }, []);

  const login = (userParam: string | UserShape, token: string) => {
    // If a string is passed, treat it as the userName
    const userObj: UserShape = typeof userParam === 'string' ? { userName: userParam } : userParam;
    setUser(userObj);
    setToken(token);
    localStorage.setItem('jwtToken', token);
    localStorage.setItem('userData', JSON.stringify(userObj));
    console.log('User logged in:', { user: userObj, hasToken: !!token });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userData');
    console.log('User logged out');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
