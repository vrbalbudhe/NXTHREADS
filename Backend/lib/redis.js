const { createClient } = require("redis");
const { redisUrl } = require("../Config/env");

const CONNECT_TIMEOUT_MS = 5000;

let client = null;

const connectRedis = async () => {
  if (!redisUrl) {
    process.stdout.write("Redis not configured, using in-memory store\n");
    return null;
  }

  const candidate = createClient({
    url: redisUrl,
    socket: {
      connectTimeout: CONNECT_TIMEOUT_MS,
      reconnectStrategy: (retries) => Math.min(retries * 250, 5000),
    },
  });
  candidate.on("error", (error) => console.error(`Redis error: ${error.message}`));

  try {
    await candidate.connect();
    await candidate.ping();
    client = candidate;
    process.stdout.write("Redis connected\n");
    return client;
  } catch (error) {
    console.error(`Redis unavailable (${error.message}), using in-memory store`);
    await candidate.destroy?.();
    return null;
  }
};

const getRedis = () => (client && client.isReady ? client : null);

const disconnectRedis = async () => {
  if (client) {
    await client.quit().catch(() => {});
    client = null;
  }
};

module.exports = { connectRedis, getRedis, disconnectRedis };
