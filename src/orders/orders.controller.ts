import { Controller, Get, Post, Body, Param, UseGuards, Request, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Создать заказ (покупка за зерна)' })
  @ApiResponse({ status: 201, description: 'Заказ создан, чек сформирован' })
  @ApiResponse({ status: 400, description: 'Недостаточно зерен' })
  create(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(req.user.userId, createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить мои заказы' })
  @ApiResponse({ status: 200, description: 'Список заказов' })
  findAll(@Request() req) {
    return this.ordersService.findAll(req.user.userId);
  }

  @Get('receipts/pending')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ROOT)
  @ApiOperation({ summary: 'Получить ожидающие чеки (ADMIN, ROOT)' })
  @ApiResponse({ status: 200, description: 'Список ожидающих чеков' })
  getPendingReceipts() {
    return this.ordersService.getPendingReceipts();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить заказ по ID' })
  @ApiResponse({ status: 200, description: 'Данные заказа' })
  @ApiResponse({ status: 404, description: 'Заказ не найден' })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Get(':id/receipt')
  @ApiOperation({ summary: 'Получить чек заказа' })
  @ApiResponse({ status: 200, description: 'Чек заказа' })
  @ApiResponse({ status: 404, description: 'Чек не найден' })
  getReceipt(@Param('id') id: string) {
    return this.ordersService.getReceipt(id);
  }

  @Patch(':id/receipt/redeem')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ROOT)
  @ApiOperation({ summary: 'Отметить чек как полученный (ADMIN, ROOT)' })
  @ApiResponse({ status: 200, description: 'Чек отмечен как полученный' })
  @ApiResponse({ status: 400, description: 'Чек уже использован' })
  redeemReceipt(@Param('id') id: string, @Request() req) {
    return this.ordersService.redeemReceipt(id, req.user.userId);
  }
}
