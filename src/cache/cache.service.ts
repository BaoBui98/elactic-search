import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  private readonly DEFAULT_TTL = 60; // seconds

  constructor(private readonly config: ConfigService) { }

  onModuleInit() {
    this.client = new Redis({
      host: this.config.get<string>('REDIS_HOST', 'localhost'),
      port: this.config.get<number>('REDIS_PORT', 6379),
      password: this.config.get<string>('REDIS_PASSWORD'),
    });
    console.log('[Redis] Connected');
  }

  onModuleDestroy() {
    this.client.disconnect();
  }

  async get<T>(key: string): Promise<T | null | undefined> {
    const data = await this.client.get(key);
    if (data === null) {
      console.log(`[Redis] MISS key="${key}"`);
      return undefined; // undefined = key không tồn tại trong cache
    }
    console.log(`[Redis] HIT  key="${key}"`);
    return JSON.parse(data) as T; // có thể trả về null nếu đang cache Null Object
  }

  async set(key: string, value: unknown, ttl = this.DEFAULT_TTL): Promise<void> {
    await this.client.set(key, JSON.stringify(value), 'EX', ttl);
    console.log(`[Redis] SET  key="${key}" TTL=${ttl}s`);
  }

  async del(...keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    await this.client.del(...keys);
    console.log(`[Redis] DEL  keys=${keys.join(', ')}`);
  }

  // ── Distributed Lock ─────────────────────────────────────────
  /**
   * Cố acquire lock. Trả về true nếu thành công.
   * Dùng SET NX PX — atomic, an toàn khi nhiều instance cạnh tranh.
   *
   * [REDIS COMMAND] SET lock:<key> 1 PX <ttlMs> NX
   *   - NX: chỉ SET nếu key CHƯA tồn tại (Not eXists)
   *   - PX: auto-expire sau ttlMs ms (tránh deadlock nếu process chết)
   */
  async acquireLock(key: string, ttlMs = 5000): Promise<boolean> {
    const result = await this.client.set(`lock:${key}`, '1', 'PX', ttlMs, 'NX');
    return result === 'OK';
  }

  /**
   * Release lock sau khi xử lý xong.
   * [REDIS COMMAND] DEL lock:<key>
   */
  async releaseLock(key: string): Promise<void> {
    await this.client.del(`lock:${key}`);
  }

  /**
   * Lấy data với bảo vệ:
   * 1. Cache Stampede (Distributed Lock)
   * 2. Cache Penetration (Null Object Pattern với TTL ngắn)
   *
   * @param cacheKey  Redis key để lưu cache
   * @param fetcher   Hàm async thực sự đi lấy dữ liệu (query DB, ES,...)
   * @param ttl       TTL cache tính bằng giây cho dữ liệu hợp lệ
   * @param retries   Số lần retry khi chờ lock (mỗi lần cách 100ms)
   * @param nullTtl   TTL ngắn (giây) khi DB trả về null để chống spam query xuống DB
   */
  async getOrSet<T>(
    cacheKey: string,
    fetcher: () => Promise<T>,
    ttl = this.DEFAULT_TTL,
    retries = 20,
    nullTtl = 30,
  ): Promise<T> {
    // 1. Thử lấy từ cache trước
    const cached = await this.get<T>(cacheKey);
    if (cached !== undefined) return cached as T; // HIT (bao gồm cả khi cached === null)

    // 2. Cache MISS → thử acquire lock
    const acquired = await this.acquireLock(cacheKey);

    if (acquired) {
      // ✅ Có lock → mình là người duy nhất được phép query DB
      try {
        // Double-check: có thể request trước vừa set cache xong
        const doubleCheck = await this.get<T>(cacheKey);
        if (doubleCheck !== undefined) return doubleCheck as T;

        // Thực sự đi fetch dữ liệu từ DB
        const data = await fetcher();

        // 🛡️ CHỐNG CACHE PENETRATION:
        // Nếu data là null / undefined, cache lại `null` với TTL ngắn (ví dụ 30s)
        if (data === null || data === undefined) {
          await this.set(cacheKey, null, nullTtl);
          return null as unknown as T;
        }

        await this.set(cacheKey, data, ttl);
        return data;
      } finally {
        // Luôn release lock dù có lỗi hay không
        await this.releaseLock(cacheKey);
      }
    }

    // ⏳ Không acquire được lock → request khác đang fetch
    // Chờ 100ms rồi retry để đọc cache
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
      return this.getOrSet(cacheKey, fetcher, ttl, retries - 1, nullTtl);
    }

    // Hết retry → fallback: tự đi fetch (tránh request bị timeout)
    console.warn(`[Redis] Lock timeout for key="${cacheKey}", fetching directly`);
    return fetcher();
  }

  // ── Cache key helpers ─────────────────────────────────────────
  productKey(id: number) { return `product:${id}`; }
  productListKey() { return `product:list`; }
  searchKey(query: string) { return `search:${Buffer.from(query).toString('base64')}`; }
}
