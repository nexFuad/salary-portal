import { createAuthenticatedApi } from "@/Services/authenticated-api";
import { apiBaseUrl } from "@/Services/api-base-url";
import type {
  OfficerAttendanceRecord,
  OfficerLeaveRequest,
  OfficerLoan,
  OfficerSalaryAdvance,
  OfficerPage,
} from "@/Types/officer-requests";
import type { OfficerDashboard } from "@/Types/officer-dashboard";
const api = createAuthenticatedApi({
  baseURL: `${apiBaseUrl}/api/officer-requests`,
  withCredentials: true,
});
export const officerRequestsService = {
  dashboard: async (): Promise<OfficerDashboard> =>
    (await api.get<{ dashboard: OfficerDashboard }>("/dashboard")).data
      .dashboard,
  leave: async (page: number, pageSize: number): Promise<OfficerPage<OfficerLeaveRequest>> => {
    const { data } = await api.get<{ requests: OfficerLeaveRequest[]; total: number; page: number; pageSize: number }>("/leave", { params: { page, pageSize } });
    return { items: data.requests, total: data.total, page: data.page, pageSize: data.pageSize };
  },
  salaryAdvances: async (page: number, pageSize: number): Promise<OfficerPage<OfficerSalaryAdvance>> => {
    const { data } = await api.get<{ requests: OfficerSalaryAdvance[]; total: number; page: number; pageSize: number }>("/salary-advances", { params: { page, pageSize } });
    return { items: data.requests, total: data.total, page: data.page, pageSize: data.pageSize };
  },
  loans: async (page: number, pageSize: number): Promise<OfficerPage<OfficerLoan>> => {
    const { data } = await api.get<{ requests: OfficerLoan[]; total: number; page: number; pageSize: number }>("/loans", { params: { page, pageSize } });
    return { items: data.requests, total: data.total, page: data.page, pageSize: data.pageSize };
  },
  attendance: async (page: number, pageSize: number): Promise<OfficerPage<OfficerAttendanceRecord>> => {
    const { data } = await api.get<{ records: OfficerAttendanceRecord[]; total: number; page: number; pageSize: number }>("/attendance", { params: { page, pageSize } });
    return { items: data.records, total: data.total, page: data.page, pageSize: data.pageSize };
  },
  deleteAttendance: async (id: string) => api.delete(`/attendance/${id}`),
  setLeave: async (id: string, status: "APPROVED" | "REJECTED") =>
    api.patch(`/leave/${id}/status`, { status }),
  setSalaryAdvance: async (id: string, status: "APPROVED" | "REJECTED") =>
    api.patch(`/salary-advances/${id}/status`, { status }),
  setLoan: async (id: string, status: "APPROVED" | "REJECTED") =>
    api.patch(`/loans/${id}/status`, { status }),
};
