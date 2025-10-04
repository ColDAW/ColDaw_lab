import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 检查本地存储中的用户会话
    const storedUser = localStorage.getItem('coldaw_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('coldaw_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      // 在实际应用中,这里应该调用后端API
      // 目前使用简单的本地存储模拟
      const storedUsers = localStorage.getItem('coldaw_users');
      const users = storedUsers ? JSON.parse(storedUsers) : [];
      
      const foundUser = users.find(
        (u: any) => u.username === username && u.password === password
      );

      if (!foundUser) {
        throw new Error('用户名或密码错误');
      }

      const userData: User = {
        id: foundUser.id,
        username: foundUser.username,
        email: foundUser.email,
      };

      setUser(userData);
      localStorage.setItem('coldaw_user', JSON.stringify(userData));
    } catch (error) {
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      // 检查用户名是否已存在
      const storedUsers = localStorage.getItem('coldaw_users');
      const users = storedUsers ? JSON.parse(storedUsers) : [];
      
      if (users.some((u: any) => u.username === username)) {
        throw new Error('用户名已存在');
      }

      if (users.some((u: any) => u.email === email)) {
        throw new Error('邮箱已被注册');
      }

      // 创建新用户
      const newUser = {
        id: Date.now().toString(),
        username,
        email,
        password, // 在实际应用中应该加密
      };

      users.push(newUser);
      localStorage.setItem('coldaw_users', JSON.stringify(users));

      // 自动登录
      const userData: User = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      };

      setUser(userData);
      localStorage.setItem('coldaw_user', JSON.stringify(userData));
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('coldaw_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
