import redisClient from "./utils/redis";

(async () => {
  console.log(redisClient.isAlive());
  console.log(await redisClient.get("myKey"));
  await redisClient.set("myKey", 55, 5);
  console.log(await redisClient.get("myKey"));

  setTimeout(async () => {
    console.log(await redisClient.get("myKey"));
  }, 1000 * 10);
})();
