import type { UserRole } from "@prisma/client";

export type JwtPayload = {
  sub: string;
  employeeId: string;
  company: string;
  role: UserRole;
  exp: number;
};

export type AppEnv = {
  Variables: {
    authUser: JwtPayload;
  };
};

export type LoginInput = {
  employeeId: string;
  company: string;
  password: string;
  rememberMe: boolean;
};

export type RefreshResult = {
  user: import("@prisma/client").User;
  refreshToken: string;
  persistent: boolean;
};

export type PublicUser = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  profilePic: string | null;
  employeeId: string;
  company: string;
  role: UserRole;
  lastLogin: Date | null;
  createdAt: Date;
};
