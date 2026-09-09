import type { Context } from "hono";
import type { AppEnv } from "../auth/auth.types.js";
import {
  checkIn,
  checkOut,
  deleteAttendance,
  getCurrentAttendance,
  listAttendance,
} from "./attendance.service.js";

function readPhotoUrl(value: unknown) {
  if (
    !value ||
    typeof value !== "object" ||
    typeof (value as Record<string, unknown>).photoUrl !== "string"
  )
    return null;
  const photoUrl = (value as Record<string, string>).photoUrl.trim();
  try {
    const url = new URL(photoUrl);
    return url.protocol === "https:" ? photoUrl : null;
  } catch {
    return null;
  }
}

export async function current(c: Context<AppEnv>) {
  const attendance = await getCurrentAttendance(c.get("authUser").sub);
  return c.json({ attendance });
}

export async function list(c: Context<AppEnv>) {
  const attendance = await listAttendance(c.get("authUser").sub);
  return c.json({ attendance });
}

export async function checkInForToday(c: Context<AppEnv>) {
  const photoUrl = readPhotoUrl(await c.req.json().catch(() => null));
  if (!photoUrl)
    return c.json({ message: "A valid check-in photo is required" }, 400);

  const attendance = await checkIn(c.get("authUser").sub, photoUrl);
  return c.json({ attendance }, 201);
}

export async function checkOutForToday(c: Context<AppEnv>) {
  const photoUrl = readPhotoUrl(await c.req.json().catch(() => null));
  if (!photoUrl)
    return c.json({ message: "A valid check-out photo is required" }, 400);

  const attendance = await checkOut(
    c.req.param("id")!,
    c.get("authUser").sub,
    photoUrl,
  );
  if (!attendance)
    return c.json(
      { message: "This attendance record cannot be checked out" },
      409,
    );
  return c.json({ attendance });
}

export async function remove(c: Context<AppEnv>) {
  const deleted = await deleteAttendance(
    c.req.param("id")!,
    c.get("authUser").sub,
  );
  if (!deleted) return c.json({ message: "Attendance record not found" }, 404);

  return c.json({ message: "Attendance record deleted" });
}
