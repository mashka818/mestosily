import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RegisterEventDto {
  @ApiProperty({ example: 'event-id', description: 'ID события' })
  @IsString()
  eventId: string;
}
