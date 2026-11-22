const { getRedis } = require("./redis");

const PREFIX = "nx:";
const memory = new Map();

const sweep = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of memory) {
    if (entry.expiresAt <= now) memory.delete(key);
  }
}, 60 * 1000);
sweep.unref();

const readMemory = (key) => {
  const entry = memory.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    memory.delete(key);
    return null;
  }
  return entry;
};

const withFallback = async (redisTask, memoryTask) => {
  const redis = getRedis();
  if (redis) {
    try {
      return await redisTask(redis);
    } catch (error) {
      console.error(`Redis command failed: ${error.message}`);
    }
  }
  return memoryTask();
};

const increment = (key, ttlMs) =>
  withFallback(
    async (redis) => {
      const count = await redis.incr(PREFIX + key);
      if (count === 1) await redis.pExpire(PREFIX + key, ttlMs);
      const ttl = await redis.pTTL(PREFIX + key);
      return { count, resetInMs: ttl > 0 ? ttl : ttlMs };
    },
    () => {
      const entry = readMemory(key);
      if (!entry) {
        memory.set(key, { value: 1, expiresAt: Date.now() + ttlMs });
        return { count: 1, resetInMs: ttlMs };
      }
      entry.value += 1;
      return { count: entry.value, resetInMs: entry.expiresAt - Date.now() };
    }
  );

const setValue = (key, value, ttlMs) =>
  withFallback(
    async (redis) => {
      await redis.set(PREFIX + key, String(value), { PX: Math.max(1, Math.round(ttlMs)) });
    },
    () => {
      memory.set(key, { value: String(value), expiresAt: Date.now() + ttlMs });
    }
  );

const getValue = (key) =>
  withFallback(
    (redis) => redis.get(PREFIX + key),
    () => readMemory(key)?.value ?? null
  );

const getValues = (keys) =>
  keys.length === 0
    ? Promise.resolve([])
    : withFallback(
        (redis) => redis.mGet(keys.map((key) => PREFIX + key)),
        () => keys.map((key) => readMemory(key)?.value ?? null)
      );

const removeKeys = (...keys) =>
  withFallback(
    async (redis) => {
      if (keys.length) await redis.del(keys.map((key) => PREFIX + key));
    },
    () => {
      for (const key of keys) memory.delete(key);
    }
  );

const remember = async (key, ttlMs, producer) => {
  const cached = await getValue(key);
  if (cached !== null) {
    try {
      return JSON.parse(cached);
    } catch {
      await removeKeys(key);
    }
  }
  const fresh = await producer();
  await setValue(key, JSON.stringify(fresh), ttlMs);
  return fresh;
};

module.exports = { increment, setValue, getValue, getValues, removeKeys, remember };
