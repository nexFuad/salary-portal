import { createAuthenticatedApi } from "@/Services/authenticated-api";
import { apiBaseUrl } from "@/Services/api-base-url";
import type { AuthUser } from "@/Types/auth";
import type { Loan, SalaryAdvance } from "@/Types/om";
import type { PageFilters, PageResult } from "@/Types/pagination";
const api = (path: string) =>
  createAuthenticatedApi({
    baseURL: `${apiBaseUrl}/api/${path}`,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  });
export const salaryAdvanceService = {
  list: async (filters: PageFilters): Promise<PageResult<SalaryAdvance>> => {
    const { data } = await api("salary-advances").get<{ requests: SalaryAdvance[]; total: number; page: number; pageSize: number }>("/list", { params: filters });
    return { items: data.requests, total: data.total, page: data.page, pageSize: data.pageSize };
  },
  listAll: async () => (await api("salary-advances").get<{ requests: SalaryAdvance[] }>("/list")).data.requests,
  create: async (data: {
    requestedAmount: string;
    reason: string;
    repaymentMonths: number;
    note?: string;
    requestDate?: string;
  }) =>
    (
      await api("salary-advances").post<{ request: SalaryAdvance }>(
        "/create",
        data,
      )
    ).data.request,
  update: async (
    id: string,
    data: {
      requestedAmount: string;
      reason: string;
      repaymentMonths: number;
      note?: string;
      requestDate?: string;
    },
  ) =>
    (
      await api("salary-advances").patch<{ request: SalaryAdvance }>(
        `/${id}`,
        data,
      )
    ).data.request,
  remove: async (id: string) => api("salary-advances").delete(`/${id}`),
};
export const loanService = {
  list: async (filters: PageFilters): Promise<PageResult<Loan>> => {
    const { data } = await api("loans").get<{ requests: Loan[]; total: number; page: number; pageSize: number }>("/list", { params: filters });
    return { items: data.requests, total: data.total, page: data.page, pageSize: data.pageSize };
  },
  listAll: async () => (await api("loans").get<{ requests: Loan[] }>("/list")).data.requests,
  get: async (id: string) =>
    (await api("loans").get<{ request: Loan }>(`/${id}`)).data.request,
  create: async (data: {
    loanType: string;
    requestedAmount: string;
    purpose: string;
    monthlyInstallment: string;
    preferredStartDate: string;
    note?: string;
    requestDate?: string;
  }) =>
    (await api("loans").post<{ request: Loan }>("/create", data)).data.request,
  update: async (
    id: string,
    data: {
      loanType: string;
      requestedAmount: string;
      purpose: string;
      monthlyInstallment: string;
      preferredStartDate: string;
      note?: string;
      requestDate?: string;
    },
  ) =>
    (await api("loans").patch<{ request: Loan }>(`/${id}`, data)).data.request,
  remove: async (id: string) => api("loans").delete(`/${id}`),
};
export const profileService = {
  update: async (data: Pick<AuthUser, "name" | "phone" | "profilePic">) =>
    (await api("auth").patch<{ user: AuthUser }>("/profile", data)).data.user,
};
