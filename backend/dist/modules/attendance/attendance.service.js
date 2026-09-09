import { prisma } from "../../lib/prisma.js";
const attendanceSelect = {
    id: true,
    workDate: true,
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
export async function getCurrentAttendance(userId) {
    return prisma.attendanceRecord.findFirst({
        where: { userId, workDate: startOfToday(), checkOutAt: null },
        select: attendanceSelect,
        orderBy: { checkInAt: "desc" },
    });
}
export async function listAttendance(userId) {
    return prisma.attendanceRecord.findMany({
        where: { userId },
        select: attendanceSelect,
        orderBy: { workDate: "desc" },
    });
}
export async function checkIn(userId, checkInPhotoUrl) {
    const workDate = startOfToday();
    return prisma.attendanceRecord.create({
        data: { userId, workDate, checkInAt: new Date(), checkInPhotoUrl },
        select: attendanceSelect,
    });
}
export async function checkOut(id, userId, checkOutPhotoUrl) {
    const record = await prisma.attendanceRecord.findFirst({
        where: { id, userId, checkOutAt: null },
        select: { id: true },
    });
    if (!record)
        return null;
    return prisma.attendanceRecord.update({
        where: { id },
        data: { checkOutAt: new Date(), checkOutPhotoUrl },
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
