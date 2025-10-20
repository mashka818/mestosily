import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsEnum, IsDateString } from 'class-validator';
import { NewsType } from '@prisma/client';

export class CreateNewsDto {
  @ApiProperty({ example: 'Ярмарка выходного дня', description: 'Заголовок' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Приглашаем всех на ярмарку...', description: 'Содержание' })
  @IsString()
  content: string;

  @ApiProperty({ example: '/uploads/image.jpg', description: 'URL изображения', required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ enum: NewsType, example: 'NEWS', description: 'Тип (NEWS или EVENT)' })
  @IsEnum(NewsType)
  type: NewsType;

  @ApiProperty({ example: true, description: 'Активна', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: '2025-01-20T10:00:00Z', description: 'Дата публикации', required: false })
  @IsOptional()
  @IsDateString()
  publishedAt?: string;
}
