import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ROOT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Создать товар (только ROOT)' })
  @ApiResponse({ status: 201, description: 'Товар создан' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список товаров магазина' })
  @ApiResponse({ status: 200, description: 'Список товаров' })
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить товар по ID' })
  @ApiResponse({ status: 200, description: 'Данные товара' })
  @ApiResponse({ status: 404, description: 'Товар не найден' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ROOT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Обновить товар (только ROOT)' })
  @ApiResponse({ status: 200, description: 'Товар обновлен' })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ROOT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Удалить товар (только ROOT)' })
  @ApiResponse({ status: 200, description: 'Товар удален' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
