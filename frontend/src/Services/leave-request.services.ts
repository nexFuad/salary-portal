import axios from "axios";
import type { LeaveRequest, LeaveRequestInput } from "@/Types/leave-request";

const apiBaseUrl = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
).replace(/\/$/, "");

const leaveRequestApi = axios.create({
  baseURL: `${apiBaseUrl}/api/leave-requests`,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export const leaveRequestService = {
  async list() {
    const response = await leaveRequestApi.get<{ requests: LeaveRequest[] }>(
      "/list",
    );
    return response.data.requests;
  },

  async getById(id: string) {
    const response = await leaveRequestApi.get<{ request: LeaveRequest }>(
      `/${id}`,
    );
    return response.data.request;
  },

  async create(input: LeaveRequestInput) {
    const response = await leaveRequestApi.post<{ request: LeaveRequest }>(
      "/create",
      input,
    );
    return response.data.request;
  },

  async update(id: string, input: LeaveRequestInput) {
    const response = await leaveRequestApi.patch<{ request: LeaveRequest }>(
      `/${id}`,
      input,
    );
    return response.data.request;
  },

  async remove(id: string) {
    await leaveRequestApi.delete(`/${id}`);
  },
};
