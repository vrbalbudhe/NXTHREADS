// // redisClient.js
// const redis = require("redis");

// const redisClient = redis.createClient({
//   socket: {
//     host: '127.0.0.1', // or 'localhost'
//     port: 6379,
//   }
// });

// redisClient.on("error", (err) => {
//   console.error("Redis Client Error", err);
// });

// (async () => {
//   await redisClient.connect();
//   console.log("Connected to Redis");
// })();

// module.exports = redisClient;
