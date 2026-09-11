import { checkIn, checkOut, deleteAttendance, getCurrentAttendance, listAttendance, } from "./attendance.service.js";
function readAttendanceInput(value) {
    if (!value ||
        typeof value !== "object" ||
        typeof value.photoUrl !== "string" ||
        typeof value.shiftStartTime !== "string" ||
        typeof value.shiftEndTime !== "string" ||
        typeof value.attendanceTime !== "string")
        return null;
    const input = value;
    const photoUrl = input.photoUrl.trim();
    const isTime = (time) => /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
    try {
        const url = new URL(photoUrl);
        if (url.protocol !== "https:" ||
            !isTime(input.shiftStartTime) ||
            !isTime(input.shiftEndTime) ||
            !isTime(input.attendanceTime) ||
            input.shiftEndTime <= input.shiftStartTime)
            return null;
        return {
            photoUrl,
            shiftStartTime: input.shiftStartTime,
            shiftEndTime: input.shiftEndTime,
            attendanceTime: input.attendanceTime,
        };
    }
    catch {
        return null;
    }
}
export async function current(c) {
    const attendance = await getCurrentAttendance(c.get("authUser").sub);
    return c.json({ attendance });
}
export async function list(c) {
    const attendance = await listAttendance(c.get("authUser").sub, c.req.query("search"));
    return c.json({ attendance });
}
export async function checkInForToday(c) {
    const input = readAttendanceInput(await c.req.json().catch(() => null));
    if (!input)
        return c.json({ message: "A valid photo, shift, and check-in time are required" }, 400);
    const attendance = await checkIn(c.get("authUser").sub, input.photoUrl, input.shiftStartTime, input.shiftEndTime, input.attendanceTime);
    return c.json({ attendance }, 201);
}
export async function checkOutForToday(c) {
    const input = readAttendanceInput(await c.req.json().catch(() => null));
    if (!input)
        return c.json({ message: "A valid photo, shift, and check-out time are required" }, 400);
    const attendance = await checkOut(c.req.param("id"), c.get("authUser").sub, input.photoUrl, input.shiftStartTime, input.shiftEndTime, input.attendanceTime);
    if (!attendance)
        return c.json({ message: "This attendance record cannot be checked out" }, 409);
    return c.json({ attendance });
}
export async function remove(c) {
    const deleted = await deleteAttendance(c.req.param("id"), c.get("authUser").sub);
    if (!deleted)
        return c.json({ message: "Attendance record not found" }, 404);
    return c.json({ message: "Attendance record deleted" });
}
