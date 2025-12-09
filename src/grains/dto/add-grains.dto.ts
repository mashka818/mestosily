import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, Min, IsOptional } from 'class-validator';

export class AddGrainsDto {
  @ApiProperty({ example: 'cuid123', description: 'ID пользователя' })
  @IsString()
  userId: string;

  @ApiProperty({ example: 100, description: 'Количество зерен' })
  @IsInt()
  @Min(1)
  amount: number;

  @ApiProperty({
    example: 'За участие в мероприятии',
    description: 'Причина начисления',
    required: false,
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
