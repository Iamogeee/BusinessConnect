class Cache {
  constructor(ttl = 3600, maxSize = 100) {
    this.cache = new Map();
    this.ttl = ttl * 1000; // Convert TTL to milliseconds.
    this.maxSize = maxSize; // Maximum number of items in cache

    // Periodically clean up expired entries
    setInterval(this.cleanup.bind(this), this.ttl);
  }

  get(key) {
    const cachedItem = this.cache.get(key);
    if (!cachedItem) {
      return null;
    }

    const [value, expiryTime] = cachedItem;

    if (Date.now() > expiryTime) {
      // Item has expired
      this.cache.delete(key);
      return null;
    }

    // Update the item's position to implement LRU
    this.cache.delete(key);
    this.cache.set(key, [value, expiryTime]);

    return value;
  }

  set(key, value) {
    if (this.cache.size >= this.maxSize) {
      // Evict the least recently used item
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    const expiryTime = Date.now() + this.ttl;
    this.cache.set(key, [value, expiryTime]);
  }

  clear() {
    this.cache.clear();
  }

  cleanup() {
    const now = Date.now();
    for (const [key, [, expiryTime]] of this.cache) {
      if (now > expiryTime) {
        this.cache.delete(key);
      }
    }
  }
}

module.exports = new Cache();
