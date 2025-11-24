import { Module } from '@nestjs/common';
import { FreeVisitsController } from './free-visits.controller';
import { FreeVisitsService } from './free-visits.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FreeVisitsController],
  providers: [FreeVisitsService],
  exports: [FreeVisitsService],
})
export class FreeVisitsModule {}
