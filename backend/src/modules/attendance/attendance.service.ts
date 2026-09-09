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
} as const;

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export async function getCurrentAttendance(userId: string) {
  return prisma.attendanceRecord.findFirst({
    where: { userId, workDate: startOfToday(), checkOutAt: null },
    select: attendanceSelect,
    orderBy: { checkInAt: "desc" },
  });
}

export async function listAttendance(userId: string) {
  return prisma.attendanceRecord.findMany({
    where: { userId },
    select: attendanceSelect,
    orderBy: { workDate: "desc" },
  });
}

export async function checkIn(userId: string, checkInPhotoUrl: string) {
  const workDate = startOfToday();
  return prisma.attendanceRecord.create({
    data: { userId, workDate, checkInAt: new Date(), checkInPhotoUrl },
    select: attendanceSelect,
  });
}

export async function checkOut(
  id: string,
  userId: string,
  checkOutPhotoUrl: string,
) {
  const record = await prisma.attendanceRecord.findFirst({
    where: { id, userId, checkOutAt: null },
    select: { id: true },
  });
  if (!record) return null;

  return prisma.attendanceRecord.update({
    where: { id },
    data: { checkOutAt: new Date(), checkOutPhotoUrl },
    select: attendanceSelect,
  });
}

export async function deleteAttendance(id: string, userId: string) {
  const record = await prisma.attendanceRecord.findFirst({
    where: { id, userId },
    select: { id: true },
  });

  if (!record) return false;

  await prisma.attendanceRecord.delete({ where: { id } });
  return true;
}
