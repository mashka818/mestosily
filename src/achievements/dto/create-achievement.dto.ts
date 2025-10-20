import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, Min, IsOptional, IsBoolean } from 'class-validator';

export class CreateAchievementDto {
  @ApiProperty({ example: 'Первое занятие', description: 'Название достижения' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Посетил первое занятие', description: 'Описание', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 50, description: 'Награда в зернах' })
  @IsInt()
  @Min(0)
  rewardGrains: number;

  @ApiProperty({ example: 'section-id', description: 'ID секции (опционально, для секционных достижений)', required: false })
  @IsOptional()
  @IsString()
  sectionId?: string;

  @ApiProperty({ example: true, description: 'Активно', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
