export interface JwtPayload {
  id: number;
  email: string;
  exp: number;
  iat: number;
}
