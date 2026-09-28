import { createAuthenticatedApi } from "@/Services/authenticated-api";
import { apiBaseUrl } from "@/Services/api-base-url";
import type { PayrollGenerationResult, PayrollPage } from "@/Types/payroll";
const api = createAuthenticatedApi({
  baseURL: `${apiBaseUrl}/api/payroll`,
  withCredentials: true,
});
export const payrollService = {
  list: async (filters: {
    payRunMonth: string;
    page: number;
    pageSize: number;
    search?: string;
    department?: string;
    status?: string;
  }) =>
    (
      await api.get<PayrollPage>("/list", {
        params: filters,
      })
    ).data,
  generate: async () =>
    (
      await api.post<PayrollGenerationResult>("/generate")
    ).data,
  updateStatus: async (id: string, status: string) =>
    api.patch(`/${id}/status`, { status }),
  remove: async (id: string) => api.delete(`/${id}`),
};
