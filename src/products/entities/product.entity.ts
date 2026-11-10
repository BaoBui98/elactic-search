import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('products') // Tên bảng trong PostgreSQL
export class Product {
  @ApiProperty({ example: 1, description: 'ID định danh sản phẩm' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'iPhone 15 Pro Max', description: 'Tên sản phẩm' })
  @Column({ length: 255 })
  name: string;

  @ApiProperty({
    example: 'Apple flagship smartphone with titanium frame',
    description: 'Mô tả chi tiết sản phẩm',
  })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({ example: 1199, description: 'Giá bán ($)' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @ApiProperty({ example: 50, description: 'Số lượng tồn kho' })
  @Column({ type: 'int', default: 0 })
  stock: number;

  @ApiProperty({ example: 'electronics', description: 'Danh mục sản phẩm' })
  @Index() // Thêm index để query theo category nhanh hơn
  @Column({ length: 100 })
  category: string;

  @ApiProperty({ example: '2026-11-04T08:00:00.000Z', description: 'Thời gian tạo' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ example: '2026-11-04T08:00:00.000Z', description: 'Thời gian cập nhật gần nhất' })
  @UpdateDateColumn()
  updatedAt: Date;
}
