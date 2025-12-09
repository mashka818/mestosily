import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional, IsDateString } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email пользователя' })
  @IsEmail({}, { message: 'Некорректный email' })
  email: string;

  @ApiProperty({ example: 'SecurePass123', description: 'Пароль (минимум 6 символов)' })
  @IsString()
  @MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
  password: string;

  @ApiProperty({ example: 'Иван', description: 'Имя' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Иванов', description: 'Фамилия' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: '+79001234567', description: 'Телефон', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: '2010-01-01', description: 'Дата рождения', required: false })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;
}
