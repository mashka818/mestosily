import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUrl } from 'class-validator';

export class CreatePartnerDto {
  @ApiProperty({ example: 'Партнер 1', description: 'Название партнера' })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'https://example.com/logo.png',
    description: 'URL изображения',
    required: false,
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({
    example: 'https://partner.com',
    description: 'Ссылка на сайт партнера',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  link?: string;
}
