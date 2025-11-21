import { isTokenExpired } from "../utils/tokenCheck";
import {
  createContext,
  useState,
  useContext,
  type ReactNode,
  useEffect,
} from "react";

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
    const email = localStorage.getItem("email");
    const id = localStorage.getItem("id");

    return token
      ? {
          accessToken: token,
          email: email || undefined,
          id: id ? Number(id) : undefined,
        }
      : {};
  });

  const logout = () => {
    setAuth({});
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("id");
  };

  useEffect(() => {
    if (auth.accessToken) {
      localStorage.setItem("token", auth.accessToken);
    } else {
      localStorage.removeItem("token");
    }

    if (auth.email) {
      localStorage.setItem("email", auth.email);
    } else {
      localStorage.removeItem("email");
    }

    if (auth.id !== undefined) {
      localStorage.setItem("id", String(auth.id));
    } else {
      localStorage.removeItem("id");
    }
  }, [auth]);

  useEffect(() => {
    const token = auth.accessToken;

    if (token && isTokenExpired(token)) {
      console.log("Token expired");
      logout();
    }
  }, [auth]);

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
