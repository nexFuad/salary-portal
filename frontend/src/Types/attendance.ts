export type AttendanceRecord = {
  id: string;
  workDate: string;
  shiftStartTime: string;
  shiftEndTime: string;
  checkInAt: string;
  checkInPhotoUrl: string;
  checkOutAt: string | null;
  checkOutPhotoUrl: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string | null;
    employeeId: string;
    role: "OM";
  };
};
