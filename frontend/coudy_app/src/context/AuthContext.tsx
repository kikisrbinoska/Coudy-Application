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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<DisplayUserDto | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (data: LoginUserDto) => {
    const response = await authApi.login(data);
    const jwt = response.data.token;
    localStorage.setItem("token", jwt);

    // Backend only returns token, so build user from login data
    // and decode role from JWT payload if available
    let role = "ROLE_USER";
    try {
      const payload = JSON.parse(atob(jwt.split(".")[1]));
      if (payload.role) role = payload.role;
    } catch {
      // fallback to default role
    }

    const userData: DisplayUserDto = {
      username: data.username,
      name: "",
      surname: "",
      role,
    };
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(jwt);
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
