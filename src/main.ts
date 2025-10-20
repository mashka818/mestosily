import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Место Силы API')
    .setDescription('API документация для платформы "Место Силы"')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Введите JWT токен',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'Аутентификация и регистрация')
    .addTag('Users', 'Управление пользователями')
    .addTag('Sections', 'Управление секциями')
    .addTag('Sessions', 'Расписание занятий')
    .addTag('News', 'Новости и события')
    .addTag('Products', 'Товары магазина')
    .addTag('Orders', 'Заказы')
    .addTag('Achievements', 'Достижения')
    .addTag('Grains', 'Система зерен')
    .addTag('Chat', 'Чаты')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`
    🚀 Сервер запущен на http://localhost:${port}
    📚 Swagger документация: http://localhost:${port}/api/docs
  `);
}

bootstrap();

