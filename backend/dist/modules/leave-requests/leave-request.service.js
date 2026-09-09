import { LeaveRequestStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
const leaveRequestSelect = {
    id: true,
    leaveType: true,
    reason: true,
    note: true,
    startDate: true,
    endDate: true,
    status: true,
    createdAt: true,
    updatedAt: true,
};
function toResponse(request) {
    return request;
}
export async function listLeaveRequests(userId) {
    const requests = await prisma.leaveRequest.findMany({
        where: { userId },
        select: leaveRequestSelect,
        orderBy: { createdAt: "desc" },
    });
    return requests.map(toResponse);
}
export async function findLeaveRequest(id, userId) {
    const request = await prisma.leaveRequest.findFirst({
        where: { id, userId },
        select: leaveRequestSelect,
    });
    return request ? toResponse(request) : null;
}
export async function createLeaveRequest(userId, input) {
    const request = await prisma.leaveRequest.create({
        data: {
            userId,
            leaveType: input.leaveType,
            reason: input.reason,
            note: input.note || null,
            startDate: new Date(input.startDate),
            endDate: new Date(input.endDate),
        },
        select: leaveRequestSelect,
    });
    return toResponse(request);
}
export async function updateLeaveRequest(id, userId, input) {
    const existing = await prisma.leaveRequest.findFirst({
        where: { id, userId },
        select: { id: true, status: true },
    });
    if (!existing || existing.status !== LeaveRequestStatus.PENDING)
        return null;
    const request = await prisma.leaveRequest.update({
        where: { id },
        data: {
            leaveType: input.leaveType,
            reason: input.reason,
            note: input.note || null,
            startDate: new Date(input.startDate),
            endDate: new Date(input.endDate),
        },
        select: leaveRequestSelect,
    });
    return toResponse(request);
}
export async function deleteLeaveRequest(id, userId) {
    const existing = await prisma.leaveRequest.findFirst({
        where: { id, userId },
        select: { id: true, status: true },
    });
    if (!existing || existing.status !== LeaveRequestStatus.PENDING)
        return false;
    await prisma.leaveRequest.delete({ where: { id } });
    return true;
}
