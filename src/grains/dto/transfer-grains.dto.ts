import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min, IsEmail } from 'class-validator';

export class TransferGrainsDto {
  @ApiProperty({
    description: 'ID получателя (можно указать вместо email)',
    required: false,
  })
  @IsOptional()
  @IsString()
  toUserId?: string;

  @ApiProperty({
    description: 'Email получателя (можно указать вместо ID)',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  toUserEmail?: string;

  @ApiProperty({
    description: 'Количество зерен для перевода',
    example: 50,
  })
  @IsInt()
  @Min(1)
  amount: number;

  @ApiProperty({
    description: 'Сообщение (необязательно)',
    required: false,
  })
  @IsOptional()
  @IsString()
  message?: string;
}
