import axios from "axios";
import { apiBaseUrl } from "@/Services/api-base-url";
import type { AttendanceRecord } from "@/Types/attendance";

export type AttendanceSubmission = {
  photoUrl: string;
  shiftStartTime: string;
  shiftEndTime: string;
  attendanceTime: string;
};

const attendanceApi = axios.create({
  baseURL: `${apiBaseUrl}/api/attendance`,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export const attendanceService = {
  async current() {
    const response = await attendanceApi.get<{
      attendance: AttendanceRecord | null;
    }>("/current");
    return response.data.attendance;
  },
  async list(filters?: { search?: string }) {
    const response = await attendanceApi.get<{
      attendance: AttendanceRecord[];
    }>("/list", { params: filters });
    return response.data.attendance;
  },
  async checkIn(data: AttendanceSubmission) {
    const response = await attendanceApi.post<{ attendance: AttendanceRecord }>(
      "/check-in",
      data,
    );
    return response.data.attendance;
  },
  async checkOut(id: string, data: AttendanceSubmission) {
    const response = await attendanceApi.post<{ attendance: AttendanceRecord }>(
      `/${id}/check-out`,
      data,
    );
    return response.data.attendance;
  },
  async remove(id: string) {
    await attendanceApi.delete(`/${id}`);
  },
};
