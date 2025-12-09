import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsOptional, Min, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLessonDto {
  @ApiProperty({ example: 'section-id', description: 'ID секции' })
  @IsString()
  sectionId: string;

  @ApiProperty({ example: 'teacher-id', description: 'ID преподавателя', required: false })
  @IsOptional()
  @IsString()
  teacherId?: string;

  @ApiProperty({ example: '2024-12-15T00:00:00.000Z', description: 'Дата занятия' })
  @IsDateString()
  date: string;

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
