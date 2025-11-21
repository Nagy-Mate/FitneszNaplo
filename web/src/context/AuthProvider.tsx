import { isTokenExpired } from "../utils/tokenCheck";
import {
  createContext,
  useState,
  useContext,
  type ReactNode,
  useEffect,
} from "react";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  id: number;
  email: string;
}

interface AuthState {
  accessToken?: string;
  email?: string;
  id?: number;
}

interface AuthContextType {
  auth: AuthState;
  setAuth: React.Dispatch<React.SetStateAction<AuthState>>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<AuthState>(() => {
    const token = localStorage.getItem("token");

    if (!token) return {};

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      return {
        accessToken: token,
        email: decoded.email,
        id: decoded.id,
      };
    } catch {
      return {};
    }
  });

  const logout = () => {
    setAuth({});
    localStorage.removeItem("token");
  };

  useEffect(() => {
    if (auth.accessToken) {
      localStorage.setItem("token", auth.accessToken);
    }
  }, [auth.accessToken]);

  useEffect(() => {
    const token = auth.accessToken;

    if (token && isTokenExpired(token)) {
      console.log("Token expired");
      logout();
    }
  }, [auth.accessToken]);

  return (
    <AuthContext.Provider value={{ auth, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
