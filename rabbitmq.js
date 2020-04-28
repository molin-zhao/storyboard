const amqp = require("amqp-connection-manager");
const RABBITMQ_CLUSTER = require("./config/rabbitmq-cluster.config");
const { getRabbitmqUrl } = require("./utils");
const { SERVER_NAME } = require("./config/server.config");

// 4. setup rabbitmq connection
const rabbitHost = getRabbitmqUrl(
  RABBITMQ_CLUSTER.HOST,
  RABBITMQ_CLUSTER.USER,
  RABBITMQ_CLUSTER.PASSWORD
);
const rabbitmqConn = amqp.connect(rabbitHost);
rabbitmqConn.on("connect", () => {
  console.log("rabbitmq cluster connected");
});
rabbitmqConn.on("disconnect", () => {
  console.log(`rabbitmq cluster disconnected`);
});

const makeBroadcastChannel = (callback) => {
  return rabbitmqConn.createChannel({
    json: true,
    setup: (channel) =>
      Promise.all([
        channel.assertExchange(
          RABBITMQ_CLUSTER.EXCHANGE.BROADCAST.NAME,
          RABBITMQ_CLUSTER.EXCHANGE.BROADCAST.TYPE,
          { durable: true }
        ),
        channel.assertQueue("", { exclusive: true }),
        channel.bindQueue("", RABBITMQ_CLUSTER.EXCHANGE.BROADCAST.NAME, ""),
        channel.consume("", async (data) => {
          try {
            const message = JSON.parse(data.content.toString());
            await callback(message);
            broadcastChannel.ack(data);
          } catch (err) {
            console.log(err);
          }
        }),
      ]),
  });
};

const makeUnicastChannel = (callback) => {
  return rabbitmqConn.createChannel({
    json: true,
    setup: (channel) =>
      Promise.all([
        channel.assertExchange(
          RABBITMQ_CLUSTER.EXCHANGE.UNICAST.NAME,
          RABBITMQ_CLUSTER.EXCHANGE.UNICAST.TYPE,
          {
            durable: true,
          }
        ),
        channel.assertQueue(SERVER_NAME, { exclusive: true }),
        channel.bindQueue(
          SERVER_NAME,
          RABBITMQ_CLUSTER.EXCHANGE.UNICAST.NAME,
          SERVER_NAME
        ),
        channel.consume(SERVER_NAME, async (data) => {
          try {
            const message = JSON.parse(data.content.toString());
            await callback(message);
            unicastChannel.ack(data);
          } catch (err) {
            console.log(err);
          }
        }),
      ]),
  });
};

module.exports = {
  makeBroadcastChannel,
  makeUnicastChannel,
};
