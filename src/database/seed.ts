// NestJS DataSource seed script
// Chạy: npm run seed

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Product } from '../products/entities/product.entity.js';
import { SEED_PRODUCTS } from './seed-data.js';

// Đọc .env thủ công (không cần dotenv package)
const env = (key: string, fallback = '') =>
  process.env[key] ?? fallback;

const AppDataSource = new DataSource({
  type: 'postgres',
  host:     env('DB_HOST', 'localhost'),
  port:     Number(env('DB_PORT', '5432')),
  username: env('DB_USERNAME', 'ecom_user'),
  password: env('DB_PASSWORD', 'ecom_password'),
  database: env('DB_DATABASE', 'ecommerce'),
  entities: [Product],
  synchronize: true, // Tự tạo bảng nếu chưa có
});

async function seed() {
  console.log('🔌 Connecting to PostgreSQL...');
  await AppDataSource.initialize();
  console.log('✅ Connected to PostgreSQL');

  const repo = AppDataSource.getRepository(Product);

  const count = await repo.count();
  if (count > 0) {
    console.log(`⚠️  Database already has ${count} products. Skipping seed.`);
    console.log('   Run: DELETE FROM products;  — if you want to re-seed');
    await AppDataSource.destroy();
    return;
  }

  console.log(`🌱 Seeding ${SEED_PRODUCTS.length} products...`);
  await repo.save(SEED_PRODUCTS.map(p => repo.create(p)));

  const inserted = await repo.count();
  console.log(`✅ Done! Inserted ${inserted} products into PostgreSQL`);
  await AppDataSource.destroy();
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
