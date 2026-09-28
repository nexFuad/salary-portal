import { createAuthenticatedApi } from "@/Services/authenticated-api";
import { apiBaseUrl } from "@/Services/api-base-url";
import type { AttendanceRecord } from "@/Types/attendance";
import type { PageFilters, PageResult } from "@/Types/pagination";

export type AttendanceSubmission = {
  photoUrl: string;
  shiftStartTime: string;
  shiftEndTime: string;
  attendanceTime: string;
};

const attendanceApi = createAuthenticatedApi({
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
  async list(filters: PageFilters): Promise<PageResult<AttendanceRecord>> {
    const response = await attendanceApi.get<{
      attendance: AttendanceRecord[]; total: number; page: number; pageSize: number;
    }>("/list", { params: filters });
    return { items: response.data.attendance, total: response.data.total, page: response.data.page, pageSize: response.data.pageSize };
  },
  async listAll() {
    const response = await attendanceApi.get<{ attendance: AttendanceRecord[] }>("/list");
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
