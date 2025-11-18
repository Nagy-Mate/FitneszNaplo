// src/context/AuthContext.tsx
import { createContext, useState, useContext, type ReactNode } from "react";

interface AuthContextType {
  auth: {
    accessToken?: string;
    email?: string;
  };
  setAuth: React.Dispatch<
    React.SetStateAction<{
      accessToken?: string;
      email?: string;
    }>
  >;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<{
    accessToken?: string;
    email?: string;
  }>({});
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
