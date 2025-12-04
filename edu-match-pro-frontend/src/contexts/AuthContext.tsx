import { createContext, useState, useContext, useEffect, type PropsWithChildren } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: 'school' | 'company' | null;
  isDemo: boolean;
  login: (role: 'school' | 'company') => void;
  logout: () => void;
  token: string | null;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'school' | 'company' | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // 檢查本地存儲的認證狀態
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedRole = localStorage.getItem('userRole') as 'school' | 'company' | null;
    const storedIsDemo = localStorage.getItem('isDemo') === 'true';
    
    if (storedToken && storedRole) {
      setToken(storedToken);
      setUserRole(storedRole);
      setIsDemo(storedIsDemo);
      setIsAuthenticated(true);
    }
  }, []);

  const login = (role: 'school' | 'company') => {
    setIsAuthenticated(true);
    setUserRole(role);
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
