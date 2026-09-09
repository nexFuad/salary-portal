import axios from "axios";
import type { EmployeeInput, EmployeeRecord } from "@/Types/employee";

const baseUrl = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
).replace(/\/$/, "");
const employeeApi = axios.create({
  baseURL: `${baseUrl}/api/employees`,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export const employeeService = {
  list: async () =>
    (await employeeApi.get<{ employees: EmployeeRecord[] }>("/list")).data
      .employees,
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
