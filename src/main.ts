import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule, ObserveInstrument } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

  // 1. Cấu hình ValidationPipe toàn cục
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Tự động loại bỏ các property không được khai báo trong DTO
      forbidNonWhitelisted: true, // Báo lỗi nếu client gửi kèm property thừa lạ
      transform: true, // Tự động convert kiểu dữ liệu phù hợp với định nghĩa trong DTO
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 2. Cấu hình Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('E-Commerce Core API')
    .setDescription(
      'Hệ thống API E-Commerce tích hợp PostgreSQL, Redis Cache, Elasticsearch & Debezium CDC',
    )
    .setVersion('1.0')
    .addTag('Products', 'Quản lý và tìm kiếm sản phẩm')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`\n🚀 Ứng dụng đang chạy tại: http://localhost:${port}`);
  console.log(`📑 Swagger Documentation: http://localhost:${port}/api/docs\n`);
}
await bootstrap();
