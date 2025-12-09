import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, Min } from 'class-validator';

export class CreateFreeVisitDto {
  @ApiProperty({ description: 'ID пользователя' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Количество бесплатных посещений (1, 5 или 10)', enum: [1, 5, 10] })
  @IsInt()
  @Min(1)
  amount: number;
}
