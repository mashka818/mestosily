import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsBoolean, IsEnum } from 'class-validator';
import { UserRole } from '@prisma/client';

export class UpdateUserDto {
  @ApiProperty({ example: 'Иван', description: 'Имя', required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ example: 'Иванов', description: 'Фамилия', required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ example: '+79001234567', description: 'Телефон', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: '2010-01-01', description: 'Дата рождения', required: false })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiProperty({ example: true, description: 'Активен', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ enum: UserRole, description: 'Роль пользователя', required: false })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
