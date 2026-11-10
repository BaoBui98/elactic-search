import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'iPhone 15 Pro Max', description: 'Tên sản phẩm' })
  @IsString({ message: 'Tên sản phẩm phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên sản phẩm không được để trống' })
  name: string;

  @ApiProperty({
    example: 'Apple flagship smartphone with titanium frame',
    description: 'Mô tả chi tiết sản phẩm',
  })
  @IsString({ message: 'Mô tả phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Mô tả không được để trống' })
  description: string;

  @ApiProperty({ example: 1199, description: 'Giá bán ($)' })
  @Type(() => Number)
  @IsNumber({}, { message: 'Giá phải là một số hợp lệ' })
  @IsPositive({ message: 'Giá phải lớn hơn 0' })
  price: number;

  @ApiProperty({ example: 50, description: 'Số lượng tồn kho' })
  @Type(() => Number)
  @IsNumber({}, { message: 'Số lượng tồn kho phải là số' })
  @Min(0, { message: 'Số lượng tồn kho không được âm' })
  stock: number;

  @ApiProperty({ example: 'electronics', description: 'Danh mục sản phẩm' })
  @IsString({ message: 'Danh mục phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Danh mục không được để trống' })
  category: string;
}

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'iPhone 15 Pro Max (256GB)' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ example: 'Mô tả cập nhật' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @ApiPropertyOptional({ example: 1099 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  price?: number;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ example: 'electronics' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  category?: string;
}

export class SearchProductDto {
  @ApiPropertyOptional({ example: 'iphone', description: 'Từ khóa tìm kiếm (full-text, fuzzy match)' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ example: 'electronics', description: 'Lọc theo danh mục' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 500, description: 'Giá tối thiểu' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ example: 1500, description: 'Giá tối đa' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ example: 1, default: 1, description: 'Trang cần lấy' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, default: 10, description: 'Số lượng mỗi trang' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}

// ── DTO cho Autocomplete Request & Response ──
export class SuggestProductDto {
  @ApiProperty({
    example: 'iph',
    description: 'Tiền tố từ khóa người dùng đang gõ (tối thiểu 2 ký tự)',
  })
  @IsString({ message: 'prefix phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'prefix không được để trống' })
  prefix: string;

  @ApiPropertyOptional({
    example: 5,
    default: 5,
    description: 'Số lượng gợi ý tối đa muốn lấy',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 5;
}

export class SuggestProductResponseDto {
  @ApiProperty({ example: 1, description: 'ID sản phẩm' })
  id: number;

  @ApiProperty({ example: 'iPhone 15 Pro Max', description: 'Tên sản phẩm gợi ý' })
  name: string;
}
