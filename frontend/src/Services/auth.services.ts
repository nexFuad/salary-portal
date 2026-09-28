import axios from "axios";
import { apiBaseUrl } from "@/Services/api-base-url";
import type { AuthResponse, LoginPayload } from "@/Types/auth";

const authApi = axios.create({
  baseURL: `${apiBaseUrl}/api/auth`,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export const authService = {
  async login(payload: LoginPayload) {
    await authApi.post<AuthResponse>("/login", payload);
    // Confirm that the browser received the auth cookies before showing success.
    try {
      const session = await authApi.get<AuthResponse>("/me");
      return session.data.user;
    } catch {
      throw new Error("Sign in completed, but the session could not be verified. Please try again.");
    }
  },

  async getCurrentUser() {
    try {
      const response = await authApi.get<AuthResponse>("/me");
      return response.data.user;
    } catch (error) {
      if (!axios.isAxiosError(error) || error.response?.status !== 401) {
        throw error;
      }

      const response = await authApi.post<AuthResponse>("/refresh");
      return response.data.user;
    }
  },

  async logout() {
    await authApi.post("/logout");
  },
};
