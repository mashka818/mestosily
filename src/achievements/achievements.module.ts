import { Module } from '@nestjs/common';
import { AchievementsController } from './achievements.controller';
import { AchievementsService } from './achievements.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [PrismaModule, UploadModule],
  controllers: [AchievementsController],
  providers: [AchievementsService],
  exports: [AchievementsService],
})
export class AchievementsModule {}
