import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { ProductsService } from './products.service.js';
import {
  CreateProductDto,
  UpdateProductDto,
  SearchProductDto,
  SuggestProductDto,
  SuggestProductResponseDto,
} from './dto/product.dto.js';
import { Product } from './entities/product.entity.js';

// ================================================================
// CONTROLLER - Lớp ngoài cùng, nhận HTTP Request từ client
// Tích hợp đầy đủ Swagger Documentation + Schema Types
// ================================================================

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * GET /products/suggest?prefix=iph&limit=5
   */
  @Get('suggest')
  @ApiOperation({
    summary: 'Gợi ý từ khóa tự động (Autocomplete / Search-as-you-type)',
    description: 'Sử dụng Edge N-gram Analyzer trong Elasticsearch để tìm kiếm tiền tố tức thì khi gõ từng ký tự',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách gợi ý sản phẩm phù hợp',
    type: [SuggestProductResponseDto],
  })
  suggest(@Query() query: SuggestProductDto) {
    return this.productsService.suggest(query.prefix, query.limit);
  }

  /**
   * GET /products/search?keyword=iphone&category=electronics&minPrice=500
   */
  @Get('search')
  @ApiOperation({
    summary: 'Tìm kiếm sản phẩm (Elasticsearch)',
    description:
      'Tìm kiếm full-text search, fuzzy search và lọc theo danh mục, khoảng giá',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách sản phẩm tìm thấy',
    type: [Product],
  })
  search(@Query() query: SearchProductDto) {
    return this.productsService.search(query);
  }

  /**
   * GET /products
   */
  @Get()
  @ApiOperation({
    summary: 'Lấy toàn bộ danh sách sản phẩm',
    description: 'Truy vấn danh sách từ PostgreSQL',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách tất cả sản phẩm',
    type: [Product],
  })
  findAll() {
    return this.productsService.findAll();
  }

  /**
   * GET /products/:id
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Lấy chi tiết 1 sản phẩm theo ID',
    description:
      'Tích hợp Redis cache + Distributed lock + Null Object Pattern',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'ID của sản phẩm (số nguyên dương > 0)',
  })
  @ApiResponse({
    status: 200,
    description: 'Thông tin chi tiết sản phẩm',
    type: Product,
  })
  @ApiResponse({ status: 400, description: 'ID không hợp lệ' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sản phẩm' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  /**
   * POST /products
   */
  @Post()
  @ApiOperation({
    summary: 'Tạo mới một sản phẩm',
    description:
      'Lưu vào PostgreSQL -> WAL log -> Debezium CDC đồng bộ sang Kafka & Elasticsearch',
  })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({
    status: 201,
    description: 'Sản phẩm đã tạo thành công',
    type: Product,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ' })
  create(@Body() body: CreateProductDto) {
    return this.productsService.create(body);
  }

  /**
   * PATCH /products/:id
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Cập nhật sản phẩm theo ID',
    description: 'Cập nhật PostgreSQL, xóa Redis cache và Debezium CDC sync ES',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({
    status: 200,
    description: 'Sản phẩm sau khi cập nhật',
    type: Product,
  })
  @ApiResponse({ status: 400, description: 'ID hoặc dữ liệu không hợp lệ' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sản phẩm' })
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateProductDto) {
    return this.productsService.update(id, body);
  }

  /**
   * DELETE /products/:id
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Xóa sản phẩm theo ID',
    description: 'Xóa khỏi PostgreSQL, xóa Redis cache và Debezium CDC sync ES',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Xóa thành công',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Product #1 deleted' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sản phẩm' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
