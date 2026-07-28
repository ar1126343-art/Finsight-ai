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
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; message?: string; isNewAccount?: boolean }>;
  signup: (name: string, email: string, password: string, tier?: UserProfile['tier'], rememberMe?: boolean) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => ({ success: false }),
  signup: async () => ({ success: false }),
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
    // Default active profile
    return {
      name: 'Ahmed Raza',
      email: 'ahmed.raza@finsight.ai',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      tier: 'Elite Pro Member',
      memberSince: 'July 2026'
    };
  });

  const login = async (email: string, password: string, rememberMe: boolean = true) => {
    const cleanEmail = email.toLowerCase().trim();

    // 1. Try Backend REST API Authentication first
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password })
      });
      if (res.ok) {
        const data = await res.json();
        const loggedUser: UserProfile = {
          name: data.user.name,
          email: data.user.email,
          avatar: data.user.avatar,
          tier: data.user.tier || 'Elite Pro Member',
          memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        };
        setUser(loggedUser);
        if (rememberMe) {
          localStorage.setItem('finsight_user', JSON.stringify(loggedUser));
        }
        return { success: true };
      }
    } catch (err) {
      console.warn("Backend auth API unreachable, using local database fallback.");
    }

    // 2. Check local users database
    const localUsers = JSON.parse(localStorage.getItem('finsight_users_db') || '{}');
    if (localUsers[cleanEmail]) {
      if (localUsers[cleanEmail].password === password) {
        const loggedUser = localUsers[cleanEmail].user;
        setUser(loggedUser);
        if (rememberMe) {
          localStorage.setItem('finsight_user', JSON.stringify(loggedUser));
        }
        return { success: true };
      } else {
        return { success: false, message: 'Incorrect password. Please verify and try again.' };
      }
    }

    // 3. Match demo account
    if (cleanEmail === 'ahmed.raza@finsight.ai' && password === 'password123') {
      const loggedUser: UserProfile = {
        name: 'Ahmed Raza',
        email: 'ahmed.raza@finsight.ai',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        tier: 'Elite Pro Member',
        memberSince: 'July 2026'
      };
      setUser(loggedUser);
      if (rememberMe) {
        localStorage.setItem('finsight_user', JSON.stringify(loggedUser));
      }
      return { success: true };
    }

    // 4. Auto-register new email seamlessly so user account is created & logged in!
    const autoUser: UserProfile = {
      name: cleanEmail.split('@')[0].replace(/[\._]/g, ' ').toUpperCase(),
      email: cleanEmail,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      tier: 'Elite Pro Member',
      memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    };

    localUsers[cleanEmail] = { password, user: autoUser };
    localStorage.setItem('finsight_users_db', JSON.stringify(localUsers));
    
    setUser(autoUser);
    if (rememberMe) {
      localStorage.setItem('finsight_user', JSON.stringify(autoUser));
    }
    return { success: true, isNewAccount: true };
  };

  const signup = async (
    name: string, 
    email: string, 
    password: string, 
    tier: UserProfile['tier'] = 'Elite Pro Member', 
    rememberMe: boolean = true
  ) => {
    const cleanEmail = email.toLowerCase().trim();
    const newUser: UserProfile = {
      name: name.trim() || cleanEmail.split('@')[0].toUpperCase(),
      email: cleanEmail,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      tier,
      memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    };

    // Save to local database
    try {
      const localUsers = JSON.parse(localStorage.getItem('finsight_users_db') || '{}');
      localUsers[cleanEmail] = { password, user: newUser };
      localStorage.setItem('finsight_users_db', JSON.stringify(localUsers));
    } catch (e) {
      console.error("Local user save error:", e);
    }

    // Register on backend database
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: cleanEmail, password, tier })
      });
      if (res.ok) {
        const data = await res.json();
        newUser.name = data.user.name || newUser.name;
      }
    } catch (err) {
      console.warn("Backend register sync fallback:", err);
    }

    setUser(newUser);
    if (rememberMe) {
      localStorage.setItem('finsight_user', JSON.stringify(newUser));
    }
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('finsight_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
