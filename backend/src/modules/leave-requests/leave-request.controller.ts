import type { Context } from "hono";
import type { AppEnv } from "../auth/auth.types.js";
import {
  createLeaveRequest,
  deleteLeaveRequest,
  findLeaveRequest,
  listLeaveRequests,
  updateLeaveRequest,
} from "./leave-request.service.js";
import type { CreateLeaveRequestInput } from "./leave-request.types.js";

function isLeaveRequestInput(value: unknown): value is CreateLeaveRequestInput {
  if (!value || typeof value !== "object") return false;
  const input = value as Record<string, unknown>;

  return (
    ["leaveType", "reason", "startDate", "endDate"].every(
      (field) => typeof input[field] === "string",
    ) &&
    (input.note === undefined || typeof input.note === "string")
  );
}

function hasValidDates(input: CreateLeaveRequestInput) {
  const startDate = new Date(input.startDate);
  const endDate = new Date(input.endDate);
  return (
    !Number.isNaN(startDate.getTime()) &&
    !Number.isNaN(endDate.getTime()) &&
    startDate <= endDate
  );
}

function normalizedInput(
  input: CreateLeaveRequestInput,
): CreateLeaveRequestInput {
  return {
    leaveType: input.leaveType.trim(),
    reason: input.reason.trim(),
    note: input.note?.trim(),
    startDate: input.startDate,
    endDate: input.endDate,
  };
}

export async function list(c: Context<AppEnv>) {
  const requests = await listLeaveRequests(c.get("authUser").sub, c.req.query("search"));
  return c.json({ requests });
}

export async function getById(c: Context<AppEnv>) {
  const request = await findLeaveRequest(
    c.req.param("id")!,
    c.get("authUser").sub,
  );
  if (!request) return c.json({ message: "Leave request not found" }, 404);
  return c.json({ request });
}

export async function create(c: Context<AppEnv>) {
  const body: unknown = await c.req.json().catch(() => null);
  if (!isLeaveRequestInput(body))
    return c.json(
      { message: "Leave type, reason, start date, and end date are required" },
      400,
    );

  const input = normalizedInput(body);
  if (!input.leaveType || !input.reason || !hasValidDates(input)) {
    return c.json(
      { message: "Please provide valid leave details and a valid date range" },
      400,
    );
  }

  const request = await createLeaveRequest(c.get("authUser").sub, input);
  return c.json({ request }, 201);
}

export async function update(c: Context<AppEnv>) {
  const body: unknown = await c.req.json().catch(() => null);
  if (!isLeaveRequestInput(body))
    return c.json(
      { message: "Leave type, reason, start date, and end date are required" },
      400,
    );

  const input = normalizedInput(body);
  if (!input.leaveType || !input.reason || !hasValidDates(input)) {
    return c.json(
      { message: "Please provide valid leave details and a valid date range" },
      400,
    );
  }

  const request = await updateLeaveRequest(
    c.req.param("id")!,
    c.get("authUser").sub,
    input,
  );
  if (!request)
    return c.json(
      { message: "Only your pending leave request can be updated" },
      404,
    );
  return c.json({ request });
}

export async function remove(c: Context<AppEnv>) {
  const deleted = await deleteLeaveRequest(
    c.req.param("id")!,
    c.get("authUser").sub,
  );

  if (!deleted) {
    return c.json(
      { message: "Only your pending leave request can be deleted" },
      404,
    );
  }

  return c.json({ message: "Leave request deleted" });
}
