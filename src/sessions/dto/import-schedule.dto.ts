import { ApiProperty } from '@nestjs/swagger';

export class ImportScheduleDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Excel файл с расписанием (.xlsx)',
  })
  file: Express.Multer.File;
}

export class ScheduleRow {
  date: string;
  startTime: string;
  endTime: string;
  sectionId: string;
  teacherId: string;
  location: string;
  capacity: number;
}
