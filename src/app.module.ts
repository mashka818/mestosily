import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SectionsModule } from './sections/sections.module';
import { SessionsModule } from './sessions/sessions.module';
import { LessonsModule } from './lessons/lessons.module';
import { NewsModule } from './news/news.module';
import { EventsModule } from './events/events.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { AchievementsModule } from './achievements/achievements.module';
import { GrainsModule } from './grains/grains.module';
import { ChatModule } from './chat/chat.module';
import { UploadModule } from './upload/upload.module';
import { TeachersModule } from './teachers/teachers.module';
import { PartnersModule } from './partners/partners.module';
import { FreeVisitsModule } from './free-visits/free-visits.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      ignoreEnvFile: false,
      expandVariables: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    SectionsModule,
    SessionsModule,
    LessonsModule,
    NewsModule,
    EventsModule,
    ProductsModule,
    OrdersModule,
    AchievementsModule,
    GrainsModule,
    ChatModule,
    UploadModule,
    TeachersModule,
    PartnersModule,
    FreeVisitsModule,
    EnrollmentsModule,
  ],
})
export class AppModule {}
