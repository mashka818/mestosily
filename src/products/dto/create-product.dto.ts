import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, Min, IsOptional, IsBoolean } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Футболка', description: 'Название товара' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Классная футболка', description: 'Описание', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 500, description: 'Цена в зернах' })
  @IsInt()
  @Min(1)
  price: number;

  @ApiProperty({ example: '/uploads/image.jpg', description: 'URL изображения', required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ example: true, description: 'Активен', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
