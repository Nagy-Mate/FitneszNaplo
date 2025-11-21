import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  exp: number;
  id?: number;
  email?: string;
}


export const isTokenExpired = (token: string | undefined) => {
  if (!token) return true;

  try {
    const decoded = jwtDecode<JwtPayload>(token);

    if (!decoded.exp) return true;

    const now = Date.now() / 1000;

    return decoded.exp < now;
  } catch {
    return true;
  }
};
