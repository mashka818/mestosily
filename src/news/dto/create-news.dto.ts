import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional, IsDateString } from 'class-validator';

export class CreateNewsDto {
  @ApiProperty({ description: 'Заголовок новости' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Содержание новости' })
  @IsString()
  content: string;

  @ApiPropertyOptional({
    description: 'Массив URL изображений',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({
    description: 'Ссылка (например, на Telegram)',
  })
  @IsOptional()
  @IsString()
  link?: string;

  @ApiPropertyOptional({
    description: 'Дата публикации (если не указана, новость будет неопубликованной)',
  })
  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @ApiProperty({ description: 'ID пользователя-создателя' })
  @IsString()
  createdBy: string;
}
