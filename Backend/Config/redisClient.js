// const { createClient } = require('@redis/client');
// const redisClient = createClient();

// // Handle Redis errors and connection events
// redisClient.on("error", (err) => {
//   console.error("Redis client error:", err);
// });

// redisClient.on("connect", () => {
//   console.log("Connected to Redis");
// });

// // Ensure Redis connection is established
// const initializeRedis = async () => {
//   try {
//     await redisClient.connect();
//   } catch (err) {
//     console.error("Failed to initialize Redis:", err);
//     process.exit(1);
//   }
// };

// // Initialize Redis on startup
// initializeRedis();

// module.exports = redisClient;
