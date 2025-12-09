import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, ValidateNested, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @ApiProperty({ example: 'product-id' })
  @IsString()
  productId: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({
    type: [OrderItemDto],
    description: 'Позиции заказа',
    example: [{ productId: 'prod1', quantity: 2 }],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
