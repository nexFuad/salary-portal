import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma.js";
const employeeSelect = {
    id: true,
    name: true,
    email: true,
    phone: true,
    profilePic: true,
    employeeId: true,
    company: true,
    role: true,
    dateOfBirth: true,
    gender: true,
    accountStatus: true,
    department: true,
    designation: true,
    employmentType: true,
    workDaysPerWeek: true,
    workStartTime: true,
    workEndTime: true,
    joinDate: true,
    employmentStatus: true,
    basicSalary: true,
    salaryType: true,
    allowances: true,
    attendanceBonusThreshold: true,
    effectiveSalaryDate: true,
    address: true,
    city: true,
    country: true,
    emergencyContactName: true,
    emergencyContactPhone: true,
    manager: true,
    workLocation: true,
    lastLogin: true,
    createdAt: true,
    updatedAt: true,
};
function optionalText(value) {
    const text = value?.trim();
    return text || null;
}
function optionalDate(value) {
    if (!value)
        return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}
function optionalDecimal(value) {
    if (value === undefined || value === "")
        return null;
    return String(value);
}
function profileData(input) {
    return {
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        phone: optionalText(input.phone),
        profilePic: optionalText(input.profilePic),
        dateOfBirth: optionalDate(input.dateOfBirth),
        gender: optionalText(input.gender),
        role: input.role,
        accountStatus: optionalText(input.accountStatus) ?? "Active",
        employeeId: input.employeeId?.trim() ?? "",
        department: optionalText(input.department),
        designation: optionalText(input.designation),
        employmentType: optionalText(input.employmentType),
        workDaysPerWeek: input.workDaysPerWeek === undefined || input.workDaysPerWeek === ""
            ? null
            : Number(input.workDaysPerWeek),
        workStartTime: optionalText(input.workStartTime) ?? "09:00",
        workEndTime: optionalText(input.workEndTime) ?? "15:00",
        joinDate: optionalDate(input.joinDate),
        employmentStatus: optionalText(input.employmentStatus) ?? "Active",
        basicSalary: optionalDecimal(input.basicSalary),
        salaryType: optionalText(input.salaryType),
        allowances: optionalDecimal(input.allowances),
        attendanceBonusThreshold: optionalDecimal(input.attendanceBonusThreshold),
        effectiveSalaryDate: optionalDate(input.effectiveSalaryDate),
        address: optionalText(input.address),
        city: optionalText(input.city),
        country: optionalText(input.country),
        emergencyContactName: optionalText(input.emergencyContactName),
        emergencyContactPhone: optionalText(input.emergencyContactPhone),
        manager: optionalText(input.manager),
        workLocation: optionalText(input.workLocation),
    };
}
export async function listEmployees(company) {
    return prisma.user.findMany({
        where: { company },
        select: employeeSelect,
        orderBy: [{ name: "asc" }, { createdAt: "desc" }],
    });
}
export async function findEmployee(id, company) {
    return prisma.user.findFirst({
        where: { id, company },
        select: employeeSelect,
    });
}
export async function createEmployee(company, input) {
    const data = profileData(input);
    return prisma.user.create({
        data: {
            ...data,
            employeeId: data.employeeId || `EMP-${Date.now()}`,
            company,
            passwordHash: await bcrypt.hash(input.password, 10),
        },
        select: employeeSelect,
    });
}
export async function updateEmployee(id, company, input) {
    const exists = await prisma.user.findFirst({
        where: { id, company },
        select: { id: true },
    });
    if (!exists)
        return null;
    const data = profileData(input);
    return prisma.user.update({
        where: { id },
        data: {
            ...data,
            ...(input.password
                ? { passwordHash: await bcrypt.hash(input.password, 10) }
                : {}),
        },
        select: employeeSelect,
    });
}
export async function setEmployeeAccountStatus(id, company, accountStatus) {
    const result = await prisma.user.updateMany({
        where: { id, company },
        data: { accountStatus },
    });
    if (!result.count)
        return null;
    return prisma.user.findUnique({ where: { id }, select: employeeSelect });
}
export async function deleteEmployee(id, company) {
    const result = await prisma.user.deleteMany({ where: { id, company } });
    return Boolean(result.count);
}
