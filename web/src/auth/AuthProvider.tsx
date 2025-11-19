// src/context/AuthContext.tsx
import { createContext, useState, useContext, type ReactNode, useEffect } from "react";

interface AuthState {
  accessToken?: string;
  email?: string;
}

interface AuthContextType {
  auth: AuthState;
  setAuth: React.Dispatch<React.SetStateAction<AuthState>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<AuthState>(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");

    return token
      ? { accessToken: token, email: email || undefined }
      : {};
  });


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
  }, [auth]);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
