import { createContext, useState, useContext, useEffect, type PropsWithChildren } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: 'school' | 'company' | null;
  isDemo: boolean;
  login: (role: 'school' | 'company', isDemoUser?: boolean, tokenValue?: string) => void;
  logout: () => void;
  token: string | null;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('authToken'));
  const [userRole, setUserRole] = useState<'school' | 'company' | null>(() => localStorage.getItem('userRole') as 'school' | 'company' | null);
  const [isDemo, setIsDemo] = useState<boolean>(() => localStorage.getItem('isDemo') === 'true');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!localStorage.getItem('authToken'));

  const login = (role: 'school' | 'company', isDemoUser: boolean = false, tokenValue: string | null = null) => {
    setIsAuthenticated(true);
    setUserRole(role);
    setIsDemo(isDemoUser);
    if (tokenValue) {
      setToken(tokenValue);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setIsDemo(false);
    setToken(null);
    // 清除本地存儲
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('isDemo');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, isDemo, login, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
