import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateTeacherDto {
  @ApiProperty({ example: 'Иван', description: 'Имя преподавателя' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Петров', description: 'Фамилия преподавателя' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: '+79001234567', description: 'Телефон' })
  @IsString()
  phone: string;
}
