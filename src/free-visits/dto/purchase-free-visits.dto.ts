import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, Max } from 'class-validator';

export class PurchaseFreeVisitsDto {
  @ApiProperty({ description: 'Количество бесплатных посещений (1, 5 или 10)', enum: [1, 5, 10] })
  @IsInt()
  @Min(1)
  @Max(10)
  amount: number;
}
