import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authApi, DisplayUserDto, LoginUserDto, CreateUserDto } from "@/api/authApi";

interface AuthContextType {
  user: DisplayUserDto | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginUserDto) => Promise<void>;
  register: (data: CreateUserDto) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<DisplayUserDto>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<DisplayUserDto | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
  const storedToken = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");

  if (storedToken) {
    setToken(storedToken);
  }

  if (storedUser) {
    setUser(JSON.parse(storedUser));
  }

  setIsLoading(false);
}, []);

  const login = async (data: LoginUserDto) => {
    const response = await authApi.login(data);
    const jwt = response.data.token;
    localStorage.setItem("token", jwt);
    setToken(jwt);

    const userData = await authApi.getMe();
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const register = async (data: CreateUserDto) => {
    await authApi.register(data);
  };

  const logout = () => {
    authApi.logout().catch(() => {});
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  const updateUser = (data: Partial<DisplayUserDto>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...data };
      localStorage.setItem("user", JSON.stringify(next));
      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
