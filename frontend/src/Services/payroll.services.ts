import axios from "axios";
import type { PayrollRecord } from "@/Types/payroll";
const base = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
).replace(/\/$/, "");
const api = axios.create({
  baseURL: `${base}/api/payroll`,
  withCredentials: true,
});
export const payrollService = {
  list: async () =>
    (await api.get<{ records: PayrollRecord[] }>("/list")).data.records,
  generate: async () =>
    (
      await api.post<{ records: PayrollRecord[]; message: string }>(
        "/generate",
        {},
      )
    ).data,
  updateStatus: async (id: string, status: string) =>
    api.patch(`/${id}/status`, { status }),
  remove: async (id: string) => api.delete(`/${id}`),
};
