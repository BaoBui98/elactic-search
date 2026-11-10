export enum OrderStatus {
  PENDING = 'PENDING',       // Vừa đặt hàng, chờ thanh toán
  PROCESSING = 'PROCESSING', // Đang xử lý đóng gói
  SHIPPED = 'SHIPPED',       // Đã bàn giao cho đơn vị vận chuyển
  DELIVERED = 'DELIVERED',   // Đã giao thành công
  CANCELLED = 'CANCELLED',   // Đã hủy đơn
}

export enum PaymentMethod {
  COD = 'COD',               // Thanh toán khi nhận hàng
  CREDIT_CARD = 'CREDIT_CARD',
  VNPAY = 'VNPAY',
  MOMO = 'MOMO',
}
