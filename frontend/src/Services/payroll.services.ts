import axios from "axios";
import { apiBaseUrl } from "@/Services/api-base-url";
import type { PayrollRecord } from "@/Types/payroll";
const api = axios.create({
  baseURL: `${apiBaseUrl}/api/payroll`,
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
