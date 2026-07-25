import React, { createContext, useContext, useState } from 'react';

interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  tier: 'Elite Pro Member' | 'Analyst';
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (name: string, email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: true,
  login: () => {},
  logout: () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>({
    name: 'Ahmed Raza',
    email: 'ahmed.raza@finsight.ai',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    tier: 'Elite Pro Member'
  });

  const login = (name: string, email: string) => {
    setUser({
      name,
      email,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      tier: 'Elite Pro Member'
    });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
