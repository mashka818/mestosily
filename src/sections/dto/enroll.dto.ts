import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class EnrollDto {
  @ApiProperty({ example: 'cuid123', description: 'ID занятия (опционально)', required: false })
  @IsOptional()
  @IsString()
  sessionId?: string;
}
