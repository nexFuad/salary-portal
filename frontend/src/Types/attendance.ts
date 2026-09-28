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

export type AttendanceAction = "check-in" | "check-out";

export type AttendanceTab = "current" | "history";

export type AttendanceForm = {
  shiftStartTime: string;
  shiftEndTime: string;
  attendanceTime: string;
};

export type AttendancePhoto = {
  file: Blob;
  previewUrl: string;
};

export type AttendanceDialogProps = {
  action: AttendanceAction;
  currentAttendance: AttendanceRecord | null;
  onClose: () => void;
};
