import axios from "axios";
import { apiBaseUrl } from "@/Services/api-base-url";
import type { EmployeeInput, EmployeeRecord } from "@/Types/employee";
const employeeApi = axios.create({
  baseURL: `${apiBaseUrl}/api/employees`,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export const employeeService = {
  list: async (filters?: {
    search?: string;
    department?: string;
    status?: string;
  }) =>
    (
      await employeeApi.get<{ employees: EmployeeRecord[] }>("/list", {
        params: filters,
      })
    ).data.employees,
  getById: async (id: string) =>
    (await employeeApi.get<{ employee: EmployeeRecord }>(`/${id}`)).data
      .employee,
  create: async (data: EmployeeInput) =>
    (await employeeApi.post<{ employee: EmployeeRecord }>("/create", data)).data
      .employee,
  update: async (id: string, data: EmployeeInput) =>
    (await employeeApi.patch<{ employee: EmployeeRecord }>(`/${id}`, data)).data
      .employee,
  setAccountStatus: async (id: string, accountStatus: "Active" | "Suspended") =>
    (
      await employeeApi.patch<{ employee: EmployeeRecord }>(
        `/${id}/account-status`,
        { accountStatus },
      )
    ).data.employee,
  remove: async (id: string) => employeeApi.delete(`/${id}`),
};
