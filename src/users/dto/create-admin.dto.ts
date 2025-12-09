import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateAdminDto {
  @ApiProperty({ example: 'admin@example.com', description: 'Email администратора' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'StrongPassword123', description: 'Пароль (минимум 6 символов)' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Иван', description: 'Имя' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Иванов', description: 'Фамилия' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: '+7 (999) 123-45-67', description: 'Телефон' })
  @IsString()
  phone: string;
}
