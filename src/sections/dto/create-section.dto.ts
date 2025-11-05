import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min, Max, IsBoolean } from 'class-validator';

export class CreateSectionDto {
  @ApiProperty({ example: 'Шахматы', description: 'Название секции' })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Обучение игре в шахматы',
    description: 'Описание',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'https://example.com/image.jpg',
    description: 'URL изображения секции',
    required: false,
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({
    example: 'https://example.com/icon.png',
    description: 'URL иконки секции',
    required: false,
  })
  @IsOptional()
  @IsString()
  iconUrl?: string;

  @ApiProperty({ example: 12, description: 'Минимальный возраст' })
  @IsInt()
  @Min(5)
  @Max(20)
  ageMin: number;

  @ApiProperty({ example: 17, description: 'Максимальный возраст' })
  @IsInt()
  @Min(5)
  @Max(20)
  ageMax: number;

  @ApiProperty({
    example: 20,
    description: 'Максимальное количество участников',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxParticipants?: number;

  @ApiProperty({ example: true, description: 'Активна', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
