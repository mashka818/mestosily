import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @ApiProperty({ example: 'product-id', description: 'ID товара' })
  productId: string;

  @ApiProperty({ example: 2, description: 'Количество' })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ 
    type: [OrderItemDto],
    description: 'Позиции заказа',
    example: [{ productId: 'prod1', quantity: 2 }]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}

