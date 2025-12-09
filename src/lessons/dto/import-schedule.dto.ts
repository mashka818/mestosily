export interface ScheduleRow {
  sectionName: string;
  teacherName?: string;
  dayOfWeek: number;
  startsAt: string;
  endsAt: string;
  location?: string;
  capacity?: number;
}
