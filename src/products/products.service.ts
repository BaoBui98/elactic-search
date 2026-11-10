import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ProductsRepository } from './products.repository.js';
import { CacheService } from '../cache/cache.service.js';
import { SearchService } from '../search/search.service.js';
import type { CreateProductDto, UpdateProductDto, SearchProductDto } from './dto/product.dto.js';
import type { Product } from './entities/product.entity.js';

@Injectable()
export class ProductsService {
  constructor(
    private readonly repo: ProductsRepository,
    private readonly cache: CacheService,
    private readonly searchService: SearchService,
  ) { }

  // ── GET /products/:id ─────────────────────────────────────────
  // Dùng Redis cache + Distributed Lock (chống Cache Stampede)
  // + Cache Null Object (chống Cache Penetration khi user spam id không tồn tại / id âm)
  async findOne(id: number): Promise<Product> {
    // 1. Validate ID cơ bản: nếu id <= 0 hoặc NaN thì chặn ngay ở tầng ứng dụng, không cần query DB hay Redis
    if (isNaN(id) || id <= 0) {
      throw new BadRequestException(`Invalid product ID: ${id}`);
    }

    // 2. Lấy từ Cache hoặc DB với cơ chế:
    // - Nếu DB trả về null -> cache lại giá trị null (trong 30s)
    // - Các request spam cùng id sau đó sẽ HIT cache null ngay lập tức thay vì dồn query xuống PostgreSQL
    const product = await this.cache.getOrSet<Product | null>(
      this.cache.productKey(id),
      () => this.repo.findById(id),
      60,  // TTL 60s cho dữ liệu hợp lệ
      20,  // retries khi chờ lock
      30,  // TTL 30s cho giá trị null (chống Cache Penetration)
    );

    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }

    return product;
  }

  // ── GET /products ─────────────────────────────────────────────
  async findAll(): Promise<Product[]> {
    return this.repo.findAll();
  }

  // ── GET /products/search ──────────────────────────────────────
  // Two-phase query:
  // 1. Elasticsearch tìm kiếm và trả về danh sách IDs (theo relevance score).
  // 2. PostgreSQL truy vấn 1 câu lệnh duy nhất: WHERE id IN (...) để lấy dữ liệu mới nhất (chống N+1 query).
  // 3. Sắp xếp lại kết quả đúng theo thứ tự relevance từ Elasticsearch.
  async search(dto: SearchProductDto): Promise<Product[]> {
    const ids = await this.searchService.search(dto);
    if (ids.length === 0) return [];

    // Chỉ bắn đúng 1 câu query: SELECT * FROM products WHERE id IN (...)
    const products = await this.repo.findByIds(ids);

    // SQL "IN (...)" không đảm bảo giữ nguyên thứ tự điểm relevance của ES,
    // ta map lại theo đúng thứ tự ids ban đầu:
    const productMap = new Map(products.map(p => [p.id, p]));
    return ids.map(id => productMap.get(id)).filter(Boolean) as Product[];
  }

  // ── GET /products/suggest?prefix=iph&limit=5 ──────────────────
  // Gợi ý từ khoá / sản phẩm tức thì khi gõ từng ký tự (Autocomplete Edge N-gram)
  async suggest(prefix: string, limit?: number): Promise<Array<{ id: number; name: string }>> {
    return this.searchService.suggest(prefix, limit);
  }

  // ── POST /products ────────────────────────────────────────────
  // CDC (Change Data Capture) Pipeline:
  // 1. NestJS chỉ ghi vào PostgreSQL -> PostgreSQL tự động sinh WAL log (ACID).
  // 2. Debezium tail theo WAL log -> Bắn event vào Kafka topic (ecom.public.products).
  // 3. Logstash consume từ Kafka topic -> Transform và đồng bộ vào Elasticsearch (index: products).
  async create(dto: CreateProductDto): Promise<Product> {
    const product = await this.repo.create(dto);
    return product;
  }

  // ── PATCH /products/:id ───────────────────────────────────────
  async update(id: number, dto: UpdateProductDto): Promise<Product> {
    const updated = await this.repo.update(id, dto);
    if (!updated) throw new NotFoundException(`Product #${id} not found`);

    // Invalidate Redis cache
    await this.cache.del(this.cache.productKey(id));

    // Debezium bắt event UPDATE từ WAL -> Kafka -> Logstash sync vào ES
    return updated;
  }

  // ── DELETE /products/:id ──────────────────────────────────────
  async remove(id: number): Promise<{ message: string }> {
    const deleted = await this.repo.delete(id);
    if (!deleted) throw new NotFoundException(`Product #${id} not found`);

    // Invalidate Redis cache
    await this.cache.del(this.cache.productKey(id));

    // Debezium bắt event DELETE từ WAL -> Kafka -> Logstash xóa document khỏi ES
    return { message: `Product #${id} deleted` };
  }
}
