import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { GrainsService } from './grains.service';
import { AddGrainsDto } from './dto/add-grains.dto';
import { DeductGrainsDto } from './dto/deduct-grains.dto';
import { TransferGrainsDto } from './dto/transfer-grains.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Grains')
@Controller('grains')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class GrainsController {
  constructor(private readonly grainsService: GrainsService) {}

  @Post('add')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ROOT)
  @ApiOperation({ summary: 'Начислить зерна пользователю (ADMIN, ROOT)' })
  @ApiResponse({ status: 201, description: 'Зерна начислены' })
  addGrains(@Body() addGrainsDto: AddGrainsDto, @Request() req) {
    return this.grainsService.addGrains(
      addGrainsDto.userId,
      addGrainsDto.amount,
      addGrainsDto.reason,
      req.user.userId,
    );
  }

  @Post('deduct')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ROOT)
  @ApiOperation({ summary: 'Списать зерна у пользователя (ADMIN, ROOT)' })
  @ApiResponse({ status: 201, description: 'Зерна списаны' })
  deductGrains(@Body() deductGrainsDto: DeductGrainsDto, @Request() req) {
    return this.grainsService.deductGrains(
      deductGrainsDto.userId,
      deductGrainsDto.amount,
      deductGrainsDto.reason,
      req.user.userId,
    );
  }

  @Get('history/:userId')
  @ApiOperation({ summary: 'Получить историю операций с зернами' })
  @ApiResponse({ status: 200, description: 'История операций' })
  getHistory(@Param('userId') userId: string) {
    return this.grainsService.getHistory(userId);
  }

  @Post('transfer')
  @ApiOperation({ summary: 'Перевести зерна другому пользователю' })
  @ApiResponse({ status: 201, description: 'Зерна переведены' })
  transferGrains(@Body() transferGrainsDto: TransferGrainsDto, @Request() req) {
    return this.grainsService.transferGrains(
      req.user.userId,
      transferGrainsDto.toUserId,
      transferGrainsDto.toUserEmail,
      transferGrainsDto.amount,
      transferGrainsDto.message,
    );
  }

  @Get('transfers/my')
  @ApiOperation({ summary: 'Получить историю переводов (отправленные и полученные)' })
  @ApiResponse({ status: 200, description: 'История переводов' })
  getMyTransfers(@Request() req) {
    return this.grainsService.getTransferHistory(req.user.userId);
  }

  @Get('transfers/:userId')
  @ApiOperation({ summary: 'Получить историю переводов пользователя' })
  @ApiResponse({ status: 200, description: 'История переводов' })
  getUserTransfers(@Param('userId') userId: string) {
    return this.grainsService.getTransferHistory(userId);
  }
}
