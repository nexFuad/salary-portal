import { prisma } from "../../lib/prisma.js";
const attendanceSelect = {
    id: true,
    workDate: true,
    shiftStartTime: true,
    shiftEndTime: true,
    checkInAt: true,
    checkInPhotoUrl: true,
    checkOutAt: true,
    checkOutPhotoUrl: true,
    createdAt: true,
    updatedAt: true,
    user: { select: { name: true, employeeId: true, role: true } },
};
function startOfToday() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}
function todayAt(time) {
    const [hours, minutes] = time.split(":").map(Number);
    const value = startOfToday();
    value.setHours(hours, minutes, 0, 0);
    return value;
}
export async function getCurrentAttendance(userId) {
    return prisma.attendanceRecord.findFirst({
        where: { userId, workDate: startOfToday(), checkOutAt: null },
        select: attendanceSelect,
        orderBy: { checkInAt: "desc" },
    });
}
export async function listAttendance(userId, search) {
    const term = search?.trim();
    return prisma.attendanceRecord.findMany({
        where: term ? { userId, OR: [{ shiftStartTime: { contains: term } }, { shiftEndTime: { contains: term } }] } : { userId },
        select: attendanceSelect,
        orderBy: { workDate: "desc" },
    });
}
export async function checkIn(userId, checkInPhotoUrl, shiftStartTime, shiftEndTime, checkInTime) {
    const workDate = startOfToday();
    return prisma.attendanceRecord.create({
        data: {
            userId,
            workDate,
            shiftStartTime,
            shiftEndTime,
            checkInAt: todayAt(checkInTime),
            checkInPhotoUrl,
        },
        select: attendanceSelect,
    });
}
export async function checkOut(id, userId, checkOutPhotoUrl, shiftStartTime, shiftEndTime, checkOutTime) {
    const record = await prisma.attendanceRecord.findFirst({
        where: { id, userId, checkOutAt: null },
        select: { id: true },
    });
    if (!record)
        return null;
    return prisma.attendanceRecord.update({
        where: { id },
        data: {
            shiftStartTime,
            shiftEndTime,
            checkOutAt: todayAt(checkOutTime),
            checkOutPhotoUrl,
        },
        select: attendanceSelect,
    });
}
export async function deleteAttendance(id, userId) {
    const record = await prisma.attendanceRecord.findFirst({
        where: { id, userId },
        select: { id: true },
    });
    if (!record)
        return false;
    await prisma.attendanceRecord.delete({ where: { id } });
    return true;
}
