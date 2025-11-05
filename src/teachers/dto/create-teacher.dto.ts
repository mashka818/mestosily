import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateTeacherDto {
  @ApiProperty({ example: 'Иван', description: 'Имя преподавателя' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Петров', description: 'Фамилия преподавателя' })
  @IsString()
  lastName: string;

  @ApiProperty({
    example: 'Иванович',
    description: 'Отчество преподавателя',
    required: false,
  })
  @IsOptional()
  @IsString()
  middleName?: string;

  @ApiProperty({ example: '+79001234567', description: 'Телефон' })
  @IsString()
  phone: string;

  @ApiProperty({
    example: 'Преподаватель шахмат',
    description: 'Роль преподавателя',
    required: false,
  })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiProperty({
    example: 'https://example.com/photo.jpg',
    description: 'URL фотографии',
    required: false,
  })
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiProperty({
    example: 'https://example.com/audio.mp3',
    description: 'URL аудио',
    required: false,
  })
  @IsOptional()
  @IsString()
  audioUrl?: string;
}
