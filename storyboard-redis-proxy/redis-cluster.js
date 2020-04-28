const Redis = require("ioredis");
const { NODES, AUTH } = require("../config/redis-cluster.config");
const cluster = new Redis.Cluster(NODES, {
  redisOptions: { password: AUTH },
  scaleReads: "slave"
});
module.exports = cluster;
