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
} as const;

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function todayAt(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const value = startOfToday();
  value.setHours(hours, minutes, 0, 0);
  return value;
}

export async function getCurrentAttendance(userId: string) {
  return prisma.attendanceRecord.findFirst({
    where: { userId, workDate: startOfToday(), checkOutAt: null },
    select: attendanceSelect,
    orderBy: { checkInAt: "desc" },
  });
}

export async function listAttendance(userId: string, search?: string) {
  const term = search?.trim();
  return prisma.attendanceRecord.findMany({
    where: term ? { userId, OR: [{ shiftStartTime: { contains: term } }, { shiftEndTime: { contains: term } }] } : { userId },
    select: attendanceSelect,
    orderBy: { workDate: "desc" },
  });
}

export async function checkIn(
  userId: string,
  checkInPhotoUrl: string,
  shiftStartTime: string,
  shiftEndTime: string,
  checkInTime: string,
) {
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

export async function checkOut(
  id: string,
  userId: string,
  checkOutPhotoUrl: string,
  shiftStartTime: string,
  shiftEndTime: string,
  checkOutTime: string,
) {
  const record = await prisma.attendanceRecord.findFirst({
    where: { id, userId, checkOutAt: null },
    select: { id: true },
  });
  if (!record) return null;

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

export async function deleteAttendance(id: string, userId: string) {
  const record = await prisma.attendanceRecord.findFirst({
    where: { id, userId },
    select: { id: true },
  });

  if (!record) return false;

  await prisma.attendanceRecord.delete({ where: { id } });
  return true;
}
