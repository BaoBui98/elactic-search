import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ProductsModule } from './products/products.module.js';
import { Product } from './products/entities/product.entity.js';
import { Order } from './orders/entities/order.entity.js';
import { OrderItem } from './orders/entities/order-item.entity.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    // ── 1. Config: đọc .env ──────────────────────────────────────
    ConfigModule.forRoot({ isGlobal: true }),

    // ── 2. TypeORM: kết nối PostgreSQL ───────────────────────────
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host:     config.get<string>('DB_HOST', 'localhost'),
        port:     config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USERNAME', 'ecom_user'),
        password: config.get<string>('DB_PASSWORD', 'ecom_password'),
        database: config.get<string>('DB_DATABASE', 'ecommerce'),
        entities: [Product, Order, OrderItem],
        synchronize: config.get<boolean>('DB_SYNCHRONIZE', true),
        logging: config.get<boolean>('DB_LOGGING', false),
      }),
    }),

    // ── 3. APM ───────────────────────────────────────────────────
    ObserveModule.forRoot({
      appKey:    process.env['OBSERVE_APP_KEY']    ?? 'YOUR_APP_KEY',
      appSecret: process.env['OBSERVE_APP_SECRET'] ?? 'YOUR_APP_SECRET',
      serviceId: 'phongvan-nest',
    }),

    // ── 4. Feature modules ───────────────────────────────────────
    ProductsModule, // ProductsModule tự quản lý SearchModule bên trong
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
