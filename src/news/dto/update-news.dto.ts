import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateNewsDto } from './create-news.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateNewsDto extends PartialType(CreateNewsDto) {
  @ApiPropertyOptional({ description: 'URL изображения' })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}
