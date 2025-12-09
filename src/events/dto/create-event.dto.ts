import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsDateString, IsInt, IsOptional, Min, Matches } from 'class-validator';

export class CreateEventDto {
  @ApiProperty({ description: 'Название события' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Заголовок события' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Описание события' })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Дата события',
    example: '2024-12-31',
  })
  @IsDateString()
  date: string;

  @ApiProperty({
    description: 'Время начала (формат HH:MM)',
    example: '18:00',
  })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Время должно быть в формате HH:MM',
  })
  startTime: string;

  @ApiProperty({
    description: 'Время окончания (формат HH:MM)',
    example: '21:00',
  })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Время должно быть в формате HH:MM',
  })
  endTime: string;

  @ApiPropertyOptional({
    description: 'Стоимость участия (по умолчанию 0 - бесплатно)',
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ description: 'Максимальное количество участников' })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxParticipants?: number;

  @ApiPropertyOptional({
    description: 'Цвет текста (hex)',
    example: '#FFFFFF',
  })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'Цвет должен быть в формате #RRGGBB',
  })
  textColor?: string;

  @ApiPropertyOptional({ description: 'URL изображения' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'URL баннера' })
  @IsOptional()
  @IsString()
  bannerUrl?: string;

  @ApiProperty({ description: 'ID пользователя-создателя' })
  @IsString()
  createdBy: string;
}
