export type UserRole = "OFFICER" | "OM";

export type AuthUser = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  profilePic: string | null;
  employeeId: string;
  company: string;
  role: UserRole;
  lastLogin: string | null;
  createdAt: string;
};

export type LoginPayload = {
  employeeId: string;
  company: string;
  password: string;
  rememberMe: boolean;
};

export type AuthResponse = {
  user: AuthUser;
};

export type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

export const dashboardPathByRole: Record<UserRole, "/Officer" | "/OM"> = {
  OFFICER: "/Officer",
  OM: "/OM",
};
