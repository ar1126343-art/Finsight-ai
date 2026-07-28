import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  tier: 'Elite Pro Member' | 'Institutional Analyst' | 'Private Investor';
  memberSince?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, name?: string, tier?: UserProfile['tier']) => void;
  signup: (name: string, email: string, tier?: UserProfile['tier']) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: () => {},
  signup: () => {},
  logout: () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('finsight_user');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load user session:", e);
    }
    // Default logged-in user profile so user work is automatically saved
    return {
      name: 'Ahmed Raza',
      email: 'ahmed.raza@finsight.ai',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      tier: 'Elite Pro Member',
      memberSince: 'July 2026'
    };
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('finsight_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('finsight_user');
    }
  }, [user]);

  const login = (email: string, name?: string, tier: UserProfile['tier'] = 'Elite Pro Member') => {
    const newUser: UserProfile = {
      name: name || (email.split('@')[0].replace('.', ' ').toUpperCase()),
      email,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      tier,
      memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    };
    setUser(newUser);
  };

  const signup = (name: string, email: string, tier: UserProfile['tier'] = 'Elite Pro Member') => {
    const newUser: UserProfile = {
      name,
      email,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      tier,
      memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    };
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
