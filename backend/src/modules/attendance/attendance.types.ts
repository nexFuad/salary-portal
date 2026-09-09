export type AttendanceResponse = {
  id: string;
  workDate: Date;
  shiftStartTime: string;
  shiftEndTime: string;
  checkInAt: Date;
  checkInPhotoUrl: string;
  checkOutAt: Date | null;
  checkOutPhotoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: {
    name: string | null;
    employeeId: string;
    role: "OM";
  };
};

export type AttendancePhotoInput = {
  photoUrl: string;
  shiftStartTime: string;
  shiftEndTime: string;
  attendanceTime: string;
};
