import axios from "axios";
import { apiBaseUrl } from "@/Services/api-base-url";
import type { AuthUser } from "@/Types/auth";
import type { Loan, SalaryAdvance, UserDocument } from "@/Types/om";
const api = (path: string) =>
  axios.create({
    baseURL: `${apiBaseUrl}/api/${path}`,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  });
export const salaryAdvanceService = {
  list: async () =>
    (await api("salary-advances").get<{ requests: SalaryAdvance[] }>("/list"))
      .data.requests,
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
  list: async () =>
    (await api("loans").get<{ requests: Loan[] }>("/list")).data.requests,
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
export const documentService = {
  list: async () =>
    (await api("documents").get<{ documents: UserDocument[] }>("/list")).data
      .documents,
  create: async (
    data: Omit<UserDocument, "id" | "status" | "createdAt" | "updatedAt">,
  ) =>
    (await api("documents").post<{ document: UserDocument }>("/create", data))
      .data.document,
  remove: async (id: string) => api("documents").delete(`/${id}`),
};
export const profileService = {
  update: async (data: Pick<AuthUser, "name" | "phone" | "profilePic">) =>
    (await api("auth").patch<{ user: AuthUser }>("/profile", data)).data.user,
};
