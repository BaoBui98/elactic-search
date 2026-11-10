import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller.js';
import { ProductsService } from './products.service.js';
import { ProductsRepository } from './products.repository.js';
import { CacheService } from '../cache/cache.service.js';
import { SearchModule } from '../search/search.module.js';
import { Product } from './entities/product.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    SearchModule, // Import SearchModule → SearchService sẵn sàng để inject
  ],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    ProductsRepository,
    CacheService,
  ],
})
export class ProductsModule {}
