import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsOptional, Min, Max } from 'class-validator';

export class CreateLessonDto {
  @ApiProperty({ example: 'section-id', description: 'ID секции' })
  @IsString()
  sectionId: string;

  @ApiProperty({ example: 'teacher-id', description: 'ID преподавателя', required: false })
  @IsOptional()
  @IsString()
  teacherId?: string;

  @ApiProperty({ example: 1, description: 'День недели (1-7, где 1 - понедельник)' })
  @IsInt()
  @Min(1)
  @Max(7)
  dayOfWeek: number;

  @ApiProperty({ example: '15:00', description: 'Время начала' })
  @IsString()
  startsAt: string;

  @ApiProperty({ example: '16:00', description: 'Время окончания' })
  @IsString()
  endsAt: string;

  @ApiProperty({ example: 'Зал №1', description: 'Место проведения', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ example: 20, description: 'Вместимость', required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @ApiProperty({ example: 'Описание занятия', description: 'Описание занятия', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
