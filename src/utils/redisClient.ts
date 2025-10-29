import Redis from "ioredis";
const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

class RedisClient {
  public client: Redis;
  constructor() {
    this.client = new Redis(REDIS_URL);
    this.client.on("connect", () => console.log("✅ Redis connected"));
    this.client.on("error", (err) => console.error("Redis error", err));
  }

  getSpotKey(size: string) {
    return `spots:available:${size}`;
  }

  async addAvailableSpot(size: string, spotId: string, floor: number, spotNumber: number) {
    const key = this.getSpotKey(size);
    const score = floor * 10000 + spotNumber; // prefer lower floors & spot numbers
    await this.client.zadd(key, score.toString(), spotId);
  }

  async removeAvailableSpot(size: string, spotId: string) {
    const key = this.getSpotKey(size);
    await this.client.zrem(key, spotId);
  }

  async getBestSpotId(size: string): Promise<string | null> {
    const key = this.getSpotKey(size);
    const res = await this.client.zrange(key, 0, 0);
    return res.length ? res[0] : null;
  }

  async getTopSpotIds(size: string, count = 5): Promise<string[]> {
    const key = this.getSpotKey(size);
    return await this.client.zrange(key, 0, count - 1);
  }

  async clearAllSpotKeys() {
    const keys = await this.client.keys("spots:available:*");
    if (keys.length) await this.client.del(...keys);
  }

  // Optional locking helpers (not used by default; can be added)
  async acquireLock(resource: string, ttl = 3000): Promise<string | null> {
    const token = `${Date.now()}-${Math.random()}`;
    const ok = await this.client.set(`lock:${resource}`, token, "PX", ttl, "NX");
    return ok ? token : null;
  }

  async releaseLock(resource: string, token: string) {
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    await this.client.eval(script, 1, `lock:${resource}`, token);
  }
}

export const redisClient = new RedisClient();
