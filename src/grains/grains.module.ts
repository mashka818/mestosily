import { Module } from '@nestjs/common';
import { GrainsController } from './grains.controller';
import { GrainsService } from './grains.service';

@Module({
  controllers: [GrainsController],
  providers: [GrainsService],
})
export class GrainsModule {}
