import { createClient } from 'redis';

class RedisClient {
  constructor() {
    this.client = createClient();

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err.toString());
    });

    this.connect();
  }

  async connect() {
    try {
      await this.client.connect();
    } catch (err) {
      console.error('Redis Connection Error:', err.toString());
    }
  }

  isAlive() {
    return this.client.isOpen;
  }

  async get(key) {
    let value;
    try {
      value = await this.client.get(key);
    } catch (err) {
      console.error('Error getting key from Redis:', err);
    }
    return value;
  }

  async set(key, value, duration) {
    try {
      const stringValue = typeof value === 'string' ? value : (value);
      await this.client.set(key, stringValue, { EX: duration });
    } catch (err) {
      console.error('Error setting key in Redis:', err.toString());
    }
  }

  async del(key) {
    try {
      await this.client.del(key);
    } catch (err) {
      console.error('Error deleting key from Redis:', err.toString());
    }
  }
}

const redisClient = new RedisClient();
export default redisClient;
