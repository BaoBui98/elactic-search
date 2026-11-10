import { Injectable, OnModuleInit } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import type { Product } from '../products/entities/product.entity.js';
import type { SearchProductDto } from '../products/dto/product.dto.js';

const INDEX = 'products';

@Injectable()
export class SearchService implements OnModuleInit {
  constructor(private readonly esService: ElasticsearchService) { }

  // Khởi tạo index hoặc tự động cập nhật Edge N-gram Analyzer nếu index đã tồn tại
  async onModuleInit() {
    const exists = await this.esService.indices.exists({ index: INDEX });

    const analysisSettings = {
      filter: {
        edge_ngram_filter: {
          type: 'edge_ngram',
          min_gram: 2,
          max_gram: 10,
        },
      },
      analyzer: {
        autocomplete_analyzer: {
          type: 'custom',
          tokenizer: 'standard',
          filter: ['lowercase', 'edge_ngram_filter'],
        },
        autocomplete_search: {
          type: 'custom',
          tokenizer: 'standard',
          filter: ['lowercase'],
        },
      },
    };

    const propertiesMapping = {
      id: { type: 'integer' },
      name: {
        type: 'text',
        analyzer: 'standard',
        fields: {
          autocomplete: {
            type: 'text',
            analyzer: 'autocomplete_analyzer',
            search_analyzer: 'autocomplete_search',
          },
          keyword: {
            type: 'keyword',
            ignore_above: 256,
          },
        },
      },
      description: { type: 'text', analyzer: 'standard' },
      price: { type: 'float' },
      stock: { type: 'integer' },
      category: { type: 'keyword' },
      createdAt: { type: 'date' },
    };

    if (!exists) {
      // 1. Nếu chưa có index -> Tạo mới hoàn toàn
      await this.esService.indices.create({
        index: INDEX,
        settings: {
          analysis: analysisSettings as any,
        },
        mappings: {
          properties: propertiesMapping as any,
        },
      });
      console.log('[Elasticsearch] Index "products" created with Edge N-gram Autocomplete');
    } else {
      // 2. Nếu index đã có từ trước -> Đóng index, cập nhật analyzer, mở lại index và nạp mapping mới
      console.log('[Elasticsearch] Index "products" already exists. Updating analysis settings and mappings...');
      try {
        await this.esService.indices.close({ index: INDEX });
        await this.esService.indices.putSettings({
          index: INDEX,
          settings: {
            analysis: analysisSettings as any,
          },
        });
      } catch (err) {
        console.warn('[Elasticsearch] Notice on updating settings:', (err as Error).message);
      } finally {
        await this.esService.indices.open({ index: INDEX });
      }

      // Cập nhật mapping thêm field name.autocomplete
      await this.esService.indices.putMapping({
        index: INDEX,
        properties: propertiesMapping as any,
      });

      // Sinh lại token cho toàn bộ dữ liệu hiện có
      await this.esService.updateByQuery({
        index: INDEX,
        conflicts: 'proceed',
        wait_for_completion: false, // Chạy ngầm không block app startup
      });
      console.log('[Elasticsearch] Autocomplete analyzer & mapping updated successfully');
    }
  }

  // PUT /products/_doc/{id}
  async indexProduct(product: Product): Promise<void> {
    await this.esService.index({
      index: INDEX,
      id: String(product.id),
      document: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        category: product.category,
        createdAt: product.createdAt,
      },
    });
    console.log(`[Elasticsearch] Indexed product id=${product.id}`);
  }

  // Bulk index nhiều sản phẩm cùng lúc
  async bulkIndex(products: Product[]): Promise<void> {
    if (products.length === 0) return;
    const operations = products.flatMap(p => [
      { index: { _index: INDEX, _id: String(p.id) } },
      { id: p.id, name: p.name, description: p.description, price: p.price, stock: p.stock, category: p.category, createdAt: p.createdAt },
    ]);
    await this.esService.bulk({ operations });
    console.log(`[Elasticsearch] Bulk indexed ${products.length} products`);
  }

  // DELETE /products/_doc/{id}
  async removeProduct(id: number): Promise<void> {
    await this.esService.delete({ index: INDEX, id: String(id) });
    console.log(`[Elasticsearch] Removed product id=${id}`);
  }

  // ── 1. Search chuẩn với full-text, fuzzy & filters ──
  async search(dto: SearchProductDto): Promise<number[]> {
    const { keyword, category, minPrice, maxPrice, page = 1, limit = 10 } = dto;

    const mustClauses: object[] = [];
    const filterClauses: object[] = [];

    if (keyword) {
      mustClauses.push({
        multi_match: {
          query: keyword,
          fields: ['name^3', 'description'],
          fuzziness: 'AUTO',
        },
      });
    }

    if (category) {
      filterClauses.push({ term: { category } });
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      const range: Record<string, number> = {};
      if (minPrice !== undefined) range['gte'] = Number(minPrice);
      if (maxPrice !== undefined) range['lte'] = Number(maxPrice);
      filterClauses.push({ range: { price: range } });
    }

    const response = await this.esService.search({
      index: INDEX,
      from: (page - 1) * limit,
      size: limit,
      query: {
        bool: {
          must: mustClauses.length > 0 ? mustClauses : [{ match_all: {} }],
          filter: filterClauses,
        },
      },
      sort: keyword
        ? ['_score']
        : [{ createdAt: { order: 'desc' } }],
    });

    return response.hits.hits.map((hit: { _source?: unknown }) => (hit._source as { id: number }).id);
  }

  // ── 2. Bài tập 1: Autocomplete / Suggestion (Edge N-gram) ──
  // Tìm kiếm tức thì khi người dùng gõ từng chữ (ví dụ: "iph", "macb")
  async suggest(prefix: string, limit = 5): Promise<Array<{ id: number; name: string }>> {
    if (!prefix || prefix.trim().length === 0) return [];

    const response = await this.esService.search({
      index: INDEX,
      size: limit,
      query: {
        match: {
          'name.autocomplete': {
            query: prefix.trim(),
            operator: 'and',
          },
        },
      },
      _source: ['id', 'name'],
    });

    return response.hits.hits.map((hit: { _source?: unknown }) => {
      const source = hit._source as { id: number; name: string };
      return { id: source.id, name: source.name };
    });
  }
}
