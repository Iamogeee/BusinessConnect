const redis = require("redis");
const { promisify } = require("util");

class RedisCache {
  constructor(ttl = 3600) {
    // Create a Redis client with built-in Promise support
    this.client = redis.createClient({
      legacyMode: true, // This enables legacy mode which includes the callback API
    });

    this.ttl = ttl; // Set the Time-To-Live (TTL) for cache entries

    // Connect to Redis
    this.client.connect().catch(console.error);

    // Event listener for successful connection to Redis
    this.client.on("connect", () => {
      console.log("Connected to Redis"); //Necessary to know when the connection is successful
    });

    // Event listener for Redis errors
    this.client.on("error", (err) => {
      console.error("Redis error:", err);
    });

    // Promisify Redis methods for easier use with async/await
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setAsync = promisify(this.client.set).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);
    this.flushAsync = promisify(this.client.flushdb).bind(this.client);
  }

  //Retrieves a value from the Redis cache.
  async get(key) {
    try {
      const value = await this.getAsync(key);

      if (value) {
        return JSON.parse(value); // Parse the JSON string to an object
      }

      return null;
    } catch (err) {
      console.error("Error getting key from Redis:", err);
      return null;
    }
  }

  // Stores a value in the Redis cache.
  async set(key, value) {
    try {
      await this.setAsync(key, JSON.stringify(value), "EX", this.ttl); // Store the value as a JSON string with an expiration time
    } catch (err) {
      console.error("Error setting key in Redis:", err);
    }
  }

  //Invalidates a specific key in the Redis cache.
  async invalidate(key) {
    try {
      await this.delAsync(key); // Delete the key from the cache
    } catch (err) {
      console.error("Error deleting key in Redis:", err);
    }
  }

  // Clears the entire Redis cache
  async clear() {
    try {
      await this.flushAsync();
    } catch (err) {
      console.error("Error flushing Redis DB:", err);
    }
  }

  //Returns cache statistics
  stats() {
    return {
      hits: "N/A",
      misses: "N/A",
      size: "N/A",
      maxSize: "N/A",
    };
  }
}

module.exports = new RedisCache();
