import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import type { Order } from './order.entity.js';
import type { Product } from '../../products/entities/product.entity.js';

@Entity('order_items')
export class OrderItem {
  @ApiProperty({ example: 1, description: 'ID định danh chi tiết đơn hàng' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 1, description: 'ID đơn hàng cha' })
  @Index()
  @Column({ name: 'order_id' })
  orderId: number;

  @ManyToOne('Order', 'items', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ApiProperty({ example: 65, description: 'ID sản phẩm đã mua' })
  @Index()
  @Column({ name: 'product_id' })
  productId: number;

  @ManyToOne('Product', { eager: false })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ApiProperty({ example: 'iPhone 15 Pro Max', description: 'Snapshot tên sản phẩm tại thời điểm mua' })
  @Column({ name: 'product_name', length: 255 })
  productName: string;

  @ApiProperty({ example: 2, description: 'Số lượng mua' })
  @Column({ type: 'int' })
  quantity: number;

  @ApiProperty({
    example: 1199,
    description: 'Snapshot giá sản phẩm tại thời điểm mua (không bị ảnh hưởng khi giá product thay đổi)',
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @ApiProperty({ example: 2398, description: 'Tổng tiền item (quantity * price)' })
  @Column({ name: 'sub_total', type: 'decimal', precision: 10, scale: 2 })
  subTotal: number;
}
