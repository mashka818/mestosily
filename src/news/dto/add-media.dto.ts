import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsInt, Min } from 'class-validator';
import { MediaType } from '@prisma/client';

export class AddMediaDto {
  @ApiProperty({ enum: MediaType, example: 'IMAGE', description: 'Тип медиа' })
  @IsEnum(MediaType)
  type: MediaType;

  @ApiProperty({ example: '/uploads/image.jpg', description: 'URL файла' })
  @IsString()
  url: string;

  @ApiProperty({ example: '/uploads/thumb.jpg', description: 'URL превью', required: false })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiProperty({ example: 'image/jpeg', description: 'MIME тип', required: false })
  @IsOptional()
  @IsString()
  mimeType?: string;

  @ApiProperty({ example: 1024000, description: 'Размер в байтах', required: false })
  @IsOptional()
  @IsInt()
  sizeBytes?: number;

  @ApiProperty({ example: 1920, description: 'Ширина', required: false })
  @IsOptional()
  @IsInt()
  width?: number;

  @ApiProperty({ example: 1080, description: 'Высота', required: false })
  @IsOptional()
  @IsInt()
  height?: number;

  @ApiProperty({ example: 120, description: 'Длительность видео (сек)', required: false })
  @IsOptional()
  @IsInt()
  durationSec?: number;

  @ApiProperty({ example: 1, description: 'Порядок сортировки', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
