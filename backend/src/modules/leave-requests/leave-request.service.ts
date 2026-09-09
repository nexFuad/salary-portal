import { LeaveRequestStatus, type LeaveRequest } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import type {
  CreateLeaveRequestInput,
  LeaveRequestResponse,
  UpdateLeaveRequestInput,
} from "./leave-request.types.js";

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
} as const;

function toResponse(
  request: Pick<LeaveRequest, keyof typeof leaveRequestSelect>,
): LeaveRequestResponse {
  return request;
}

export async function listLeaveRequests(userId: string) {
  const requests = await prisma.leaveRequest.findMany({
    where: { userId },
    select: leaveRequestSelect,
    orderBy: { createdAt: "desc" },
  });

  return requests.map(toResponse);
}

export async function findLeaveRequest(id: string, userId: string) {
  const request = await prisma.leaveRequest.findFirst({
    where: { id, userId },
    select: leaveRequestSelect,
  });

  return request ? toResponse(request) : null;
}

export async function createLeaveRequest(
  userId: string,
  input: CreateLeaveRequestInput,
) {
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

export async function updateLeaveRequest(
  id: string,
  userId: string,
  input: UpdateLeaveRequestInput,
) {
  const existing = await prisma.leaveRequest.findFirst({
    where: { id, userId },
    select: { id: true, status: true },
  });
  if (!existing || existing.status !== LeaveRequestStatus.PENDING) return null;

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

export async function deleteLeaveRequest(id: string, userId: string) {
  const existing = await prisma.leaveRequest.findFirst({
    where: { id, userId },
    select: { id: true, status: true },
  });

  if (!existing || existing.status !== LeaveRequestStatus.PENDING) return false;

  await prisma.leaveRequest.delete({ where: { id } });
  return true;
}
