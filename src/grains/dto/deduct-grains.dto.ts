import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, Min, IsOptional } from 'class-validator';

export class DeductGrainsDto {
  @ApiProperty({ example: 'cuid123', description: 'ID пользователя' })
  @IsString()
  userId: string;

  @ApiProperty({ example: 50, description: 'Количество зерен для списания' })
  @IsInt()
  @Min(1)
  amount: number;

  @ApiProperty({ example: 'Покупка товара', description: 'Причина списания', required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}
