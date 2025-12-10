export interface ScheduleRow {
  sectionName: string;
  teacherName?: string;
  date: string | Date;
  startsAt: string;
  endsAt: string;
  location?: string;
  capacity?: number;
}
