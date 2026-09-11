import { UserRole } from "@prisma/client";
import { createEmployee, deleteEmployee, findEmployee, listEmployees, setEmployeeAccountStatus, updateEmployee, } from "./employee.service.js";
const allowedRoles = [UserRole.OFFICER, UserRole.OM];
function isDate(value) {
    return typeof value === "string" && !Number.isNaN(new Date(value).getTime());
}
function hasValidOptionalFields(input) {
    const isTime = (value) => typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
    return ((input.dateOfBirth === undefined ||
        input.dateOfBirth === "" ||
        isDate(input.dateOfBirth)) &&
        (input.joinDate === undefined ||
            input.joinDate === "" ||
            isDate(input.joinDate)) &&
        (input.effectiveSalaryDate === undefined ||
            input.effectiveSalaryDate === "" ||
            isDate(input.effectiveSalaryDate)) &&
        (input.basicSalary === undefined ||
            input.basicSalary === "" ||
            Number(input.basicSalary) >= 0) &&
        (input.workDaysPerWeek === undefined ||
            input.workDaysPerWeek === "" ||
            (Number.isInteger(Number(input.workDaysPerWeek)) &&
                Number(input.workDaysPerWeek) >= 1 &&
                Number(input.workDaysPerWeek) <= 7)) &&
        (input.workStartTime === undefined ||
            input.workStartTime === "" ||
            isTime(input.workStartTime)) &&
        (input.workEndTime === undefined ||
            input.workEndTime === "" ||
            isTime(input.workEndTime)) &&
        (input.allowances === undefined ||
            input.allowances === "" ||
            Number(input.allowances) >= 0) &&
        (input.attendanceBonusThreshold === undefined ||
            input.attendanceBonusThreshold === "" ||
            (Number(input.attendanceBonusThreshold) >= 0 &&
                Number(input.attendanceBonusThreshold) <= 100)) &&
        (input.attendanceBonusRate === undefined ||
            input.attendanceBonusRate === "" ||
            (Number(input.attendanceBonusRate) >= 0 &&
                Number(input.attendanceBonusRate) <= 100)));
}
function validate(body, isCreate) {
    if (!body || typeof body !== "object")
        return false;
    const input = body;
    return (typeof input.name === "string" &&
        input.name.trim().length >= 2 &&
        typeof input.email === "string" &&
        /^\S+@\S+\.\S+$/.test(input.email) &&
        typeof input.employeeId === "string" &&
        input.employeeId.trim().length >= 1 &&
        allowedRoles.includes(input.role) &&
        (!isCreate ||
            (typeof input.password === "string" && input.password.length >= 6)) &&
        hasValidOptionalFields(input));
}
function errorMessage(error) {
    if (typeof error === "object" &&
        error &&
        "code" in error &&
        error.code === "P2002") {
        return "An employee with this email or employee ID already exists.";
    }
    return "Could not save the employee. Please try again.";
}
export async function list(c) {
    const status = c.req.query("status");
    const employees = await listEmployees(c.get("authUser").company, {
        search: c.req.query("search") || undefined,
        department: c.req.query("department") || undefined,
        status: status === "Active" || status === "Suspended" ? status : undefined,
    });
    return c.json({ employees });
}
export async function getById(c) {
    const employee = await findEmployee(c.req.param("id"), c.get("authUser").company);
    if (!employee)
        return c.json({ message: "Employee not found" }, 404);
    return c.json({ employee });
}
export async function create(c) {
    const body = await c.req.json().catch(() => null);
    if (!validate(body, true)) {
        return c.json({
            message: "Name, employee ID, valid email, role, and a password of at least 6 characters are required.",
        }, 400);
    }
    try {
        const employee = await createEmployee(c.get("authUser").company, body);
        return c.json({ employee }, 201);
    }
    catch (error) {
        return c.json({ message: errorMessage(error) }, 400);
    }
}
export async function update(c) {
    const body = await c.req.json().catch(() => null);
    if (!validate(body, false)) {
        return c.json({
            message: "Please provide a valid name, employee ID, email, role, and profile details.",
        }, 400);
    }
    try {
        const employee = await updateEmployee(c.req.param("id"), c.get("authUser").company, body);
        if (!employee)
            return c.json({ message: "Employee not found" }, 404);
        return c.json({ employee });
    }
    catch (error) {
        return c.json({ message: errorMessage(error) }, 400);
    }
}
export async function updateAccountStatus(c) {
    const body = await c.req.json().catch(() => null);
    const accountStatus = body
        ?.accountStatus;
    if (accountStatus !== "Active" && accountStatus !== "Suspended") {
        return c.json({ message: "Account status must be Active or Suspended." }, 400);
    }
    if (c.req.param("id") === c.get("authUser").sub) {
        return c.json({ message: "You cannot change your own account status." }, 400);
    }
    const employee = await setEmployeeAccountStatus(c.req.param("id"), c.get("authUser").company, accountStatus);
    if (!employee)
        return c.json({ message: "Employee not found" }, 404);
    return c.json({ employee });
}
export async function remove(c) {
    if (c.req.param("id") === c.get("authUser").sub) {
        return c.json({ message: "You cannot delete your own account." }, 400);
    }
    const deleted = await deleteEmployee(c.req.param("id"), c.get("authUser").company);
    if (!deleted)
        return c.json({ message: "Employee not found" }, 404);
    return c.json({ message: "Employee deleted" });
}
