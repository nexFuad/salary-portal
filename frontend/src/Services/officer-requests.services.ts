import axios from "axios";
import type {
  OfficerAttendanceRecord,
  OfficerDocument,
  OfficerDocumentInput,
  OfficerLeaveRequest,
  OfficerLoan,
  OfficerSalaryAdvance,
} from "@/Types/officer-requests";
import type { OfficerDashboard } from "@/Types/officer-dashboard";
const base = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
).replace(/\/$/, "");
const api = axios.create({
  baseURL: `${base}/api/officer-requests`,
  withCredentials: true,
});
export const officerRequestsService = {
  dashboard: async (): Promise<OfficerDashboard> =>
    (await api.get<{ dashboard: OfficerDashboard }>("/dashboard")).data
      .dashboard,
  leave: async (): Promise<OfficerLeaveRequest[]> =>
    (await api.get("/leave")).data.requests,
  salaryAdvances: async (): Promise<OfficerSalaryAdvance[]> =>
    (await api.get("/salary-advances")).data.requests,
  loans: async (): Promise<OfficerLoan[]> =>
    (await api.get("/loans")).data.requests,
  attendance: async (): Promise<OfficerAttendanceRecord[]> =>
    (await api.get("/attendance")).data.records,
  deleteAttendance: async (id: string) => api.delete(`/attendance/${id}`),
  documents: async (): Promise<OfficerDocument[]> =>
    (await api.get("/documents")).data.documents,
  createDocument: async (data: OfficerDocumentInput) =>
    (await api.post("/documents", data)).data.document,
  deleteDocument: async (id: string) => api.delete(`/documents/${id}`),
  setDocumentStatus: async (id: string, status: "APPROVED" | "REJECTED") =>
    api.patch(`/documents/${id}/status`, { status }),
  setLeave: async (id: string, status: "APPROVED" | "REJECTED") =>
    api.patch(`/leave/${id}/status`, { status }),
  setSalaryAdvance: async (id: string, status: "APPROVED" | "REJECTED") =>
    api.patch(`/salary-advances/${id}/status`, { status }),
  setLoan: async (id: string, status: "APPROVED" | "REJECTED") =>
    api.patch(`/loans/${id}/status`, { status }),
};
