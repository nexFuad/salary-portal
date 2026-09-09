import { createLeaveRequest, deleteLeaveRequest, findLeaveRequest, listLeaveRequests, updateLeaveRequest, } from "./leave-request.service.js";
function isLeaveRequestInput(value) {
    if (!value || typeof value !== "object")
        return false;
    const input = value;
    return (["leaveType", "reason", "startDate", "endDate"].every((field) => typeof input[field] === "string") &&
        (input.note === undefined || typeof input.note === "string"));
}
function hasValidDates(input) {
    const startDate = new Date(input.startDate);
    const endDate = new Date(input.endDate);
    return (!Number.isNaN(startDate.getTime()) &&
        !Number.isNaN(endDate.getTime()) &&
        startDate <= endDate);
}
function normalizedInput(input) {
    return {
        leaveType: input.leaveType.trim(),
        reason: input.reason.trim(),
        note: input.note?.trim(),
        startDate: input.startDate,
        endDate: input.endDate,
    };
}
export async function list(c) {
    const requests = await listLeaveRequests(c.get("authUser").sub);
    return c.json({ requests });
}
export async function getById(c) {
    const request = await findLeaveRequest(c.req.param("id"), c.get("authUser").sub);
    if (!request)
        return c.json({ message: "Leave request not found" }, 404);
    return c.json({ request });
}
export async function create(c) {
    const body = await c.req.json().catch(() => null);
    if (!isLeaveRequestInput(body))
        return c.json({ message: "Leave type, reason, start date, and end date are required" }, 400);
    const input = normalizedInput(body);
    if (!input.leaveType || !input.reason || !hasValidDates(input)) {
        return c.json({ message: "Please provide valid leave details and a valid date range" }, 400);
    }
    const request = await createLeaveRequest(c.get("authUser").sub, input);
    return c.json({ request }, 201);
}
export async function update(c) {
    const body = await c.req.json().catch(() => null);
    if (!isLeaveRequestInput(body))
        return c.json({ message: "Leave type, reason, start date, and end date are required" }, 400);
    const input = normalizedInput(body);
    if (!input.leaveType || !input.reason || !hasValidDates(input)) {
        return c.json({ message: "Please provide valid leave details and a valid date range" }, 400);
    }
    const request = await updateLeaveRequest(c.req.param("id"), c.get("authUser").sub, input);
    if (!request)
        return c.json({ message: "Only your pending leave request can be updated" }, 404);
    return c.json({ request });
}
export async function remove(c) {
    const deleted = await deleteLeaveRequest(c.req.param("id"), c.get("authUser").sub);
    if (!deleted) {
        return c.json({ message: "Only your pending leave request can be deleted" }, 404);
    }
    return c.json({ message: "Leave request deleted" });
}
