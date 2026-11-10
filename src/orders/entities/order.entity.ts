import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import type { OrderItem } from './order-item.entity.js';
import { OrderStatus, PaymentMethod } from './order-status.enum.js';

@Entity('orders')
export class Order {
  @ApiProperty({ example: 1, description: 'ID đơn hàng' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'ORD-20261106-ABCD', description: 'Mã đơn hàng nghiệp vụ' })
  @Index({ unique: true })
  @Column({ name: 'order_code', length: 50, unique: true })
  orderCode: string;

  @ApiProperty({ example: 101, description: 'ID người mua hàng' })
  @Index()
  @Column({ name: 'user_id' })
  userId: number;

  @ApiProperty({ example: 'Nguyen Van A', description: 'Tên người nhận hàng' })
  @Column({ name: 'customer_name', length: 150 })
  customerName: string;

  @ApiProperty({ example: '0987654321', description: 'Số điện thoại người nhận' })
  @Column({ name: 'customer_phone', length: 20 })
  customerPhone: string;

  @ApiProperty({ example: '123 Nguyen Hue, Quan 1, TP.HCM', description: 'Địa chỉ giao hàng' })
  @Column({ name: 'shipping_address', type: 'text' })
  shippingAddress: string;

  @ApiProperty({ enum: OrderStatus, example: OrderStatus.PENDING, description: 'Trạng thái đơn hàng' })
  @Index()
  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.COD, description: 'Phương thức thanh toán' })
  @Column({
    name: 'payment_method',
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.COD,
  })
  paymentMethod: PaymentMethod;

  @ApiProperty({ example: 2398.0, description: 'Tổng giá trị đơn hàng ($)' })
  @Column({ name: 'total_amount', type: 'decimal', precision: 12, scale: 2 })
  totalAmount: number;

  @ApiProperty({ example: 'Giao giờ hành chính', required: false, description: 'Ghi chú đơn hàng' })
  @Column({ type: 'text', nullable: true })
  note?: string;

  @ApiProperty({ type: () => Object, description: 'Danh sách các mặt hàng trong đơn' })
  @OneToMany('OrderItem', 'order', {
    cascade: ['insert', 'update'],
    eager: true,
  })
  items: OrderItem[];

  @ApiProperty({ example: '2026-11-06T08:00:00.000Z', description: 'Thời gian đặt hàng' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ example: '2026-11-06T08:00:00.000Z', description: 'Thời gian cập nhật gần nhất' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
