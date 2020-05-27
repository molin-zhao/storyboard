const amqp = require("amqp-connection-manager");
const {
  EXCHANGE,
  HOST,
  USER,
  PASSWORD,
} = require("./config/rabbitmq-cluster.config");
const { getRabbitmqUrl } = require("./utils");
const { SERVER_NAME } = require("./config/server.config");

const rabbitHost = getRabbitmqUrl(HOST, USER, PASSWORD);
const rabbitmqConn = amqp.connect(rabbitHost);
rabbitmqConn.on("connect", () => {
  console.log("rabbitmq cluster connected");
});
rabbitmqConn.on("disconnect", () => {
  console.log(`rabbitmq cluster disconnected`);
});

rabbitmqConn.on("error", (err) => {
  console.log(`rabbitmq cluster error: ${err}`);
});
const makeChannel = () => {
  return rabbitmqConn.createChannel({
    json: true,
  });
};

const makeBroadcastChannel = (callback) => {
  return rabbitmqConn.createChannel({
    json: true,
    setup: (channel) =>
      Promise.all([
        channel.assertExchange(
          EXCHANGE.BROADCAST.NAME,
          EXCHANGE.BROADCAST.TYPE,
          { durable: true }
        ),
        channel.assertQueue("", { exclusive: true }),
        channel.bindQueue("", EXCHANGE.BROADCAST.NAME, ""),
        channel.consume("", (data) => callback(data)),
      ]),
  });
};

const makeUnicastChannel = (callback) => {
  return rabbitmqConn.createChannel({
    json: true,
    setup: (channel) =>
      Promise.all([
        channel.assertExchange(EXCHANGE.UNICAST.NAME, EXCHANGE.UNICAST.TYPE, {
          durable: true,
        }),
        channel.assertQueue(SERVER_NAME, { exclusive: true }),
        channel.bindQueue(SERVER_NAME, EXCHANGE.UNICAST.NAME, SERVER_NAME),
        channel.consume(SERVER_NAME, (data) => callback(data)),
      ]),
  });
};

module.exports = {
  makeBroadcastChannel,
  makeUnicastChannel,
  makeChannel,
};
