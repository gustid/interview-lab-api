export interface RegisteredUser {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface JwtPayload {
  sub: string;
  email: string;
}

export interface LoginResponse {
  accessToken: string;
  user: RegisteredUser;
}
