const Redis = require("ioredis");
const { REDIS_CLUSTER } = require("../config");
const cluster = new Redis.Cluster(REDIS_CLUSTER.NODES, {
  redisOptions: { password: REDIS_CLUSTER.AUTH },
  scaleReads: "slave"
});
module.exports = cluster;
