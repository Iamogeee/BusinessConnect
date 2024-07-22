class Cache {
  constructor(ttl = 3600) {
    // Initialize cache with a default TTL of 1 hour (3600 seconds).
    this.cache = {};
    this.ttl = ttl * 1000; // Convert TTL to milliseconds.
  }

  get(key) {
    const cachedItem = this.cache[key];
    if (!cachedItem) {
      // Return null if the key is not found in the cache.
      return null;
    }

    // Check if the cached item is expired.
    const isExpired = Date.now() - cachedItem.timestamp > this.ttl;
    if (isExpired) {
      // Delete the expired item and return null.
      delete this.cache[key];
      return null;
    }

    // Return the cached value if it is still valid.
    return cachedItem.value;
  }

  set(key, value) {
    this.cache[key] = {
      value,
      timestamp: Date.now(), // Store the current time as the timestamp.
    };
  }

  invalidate(key) {
    // Delete the key from the cache.
    delete this.cache[key];
  }

  clear() {
    // Reset the cache to an empty object.
    this.cache = {};
  }
}

module.exports = new Cache();
