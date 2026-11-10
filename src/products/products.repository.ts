import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Product } from './entities/product.entity.js';
import type { CreateProductDto, UpdateProductDto } from './dto/product.dto.js';

@Injectable()
export class ProductsRepository {
  constructor(
    // TypeORM inject Repository<Product> từ PostgreSQL connection
    @InjectRepository(Product)
    private readonly repo: Repository<Product>,
  ) {}

  async findById(id: number): Promise<Product | null> {
    return this.repo.findOneBy({ id });
  }

  // Truy vấn 1 lần duy nhất cho toàn bộ danh sách ID: SELECT * FROM products WHERE id IN (...)
  async findByIds(ids: number[]): Promise<Product[]> {
    if (ids.length === 0) return [];
    return this.repo.findBy({ id: In(ids) });
  }

  async findAll(): Promise<Product[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async create(dto: CreateProductDto): Promise<Product> {
    const product = this.repo.create(dto);
    return this.repo.save(product);
  }

  async update(id: number, dto: UpdateProductDto): Promise<Product | null> {
    await this.repo.update(id, dto);
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repo.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
