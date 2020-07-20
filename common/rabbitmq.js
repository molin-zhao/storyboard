const amqp = require("amqp-connection-manager");
const {
  EXCHANGE,
  HOST,
  USER,
  PASSWORD,
} = require("../config/rabbitmq-cluster.config");
const { getRabbitmqUrl } = require("./utils");

const rabbitHost = getRabbitmqUrl(HOST, USER, PASSWORD);
const rabbitmqConn = amqp.connect(rabbitHost);
rabbitmqConn.on("connect", () => {
  console.log("rabbitmq cluster connected");
});
rabbitmqConn.on("disconnect", () => {
  console.log(`rabbitmq cluster disconnected`);
});

rabbitmqConn.on("error", (err) => {
  console.log(`rabbitmq cluster error: ${listError(err)}`);
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

const makeUnicastChannel = (serverName, callback) => {
  return rabbitmqConn.createChannel({
    json: true,
    setup: (channel) =>
      Promise.all([
        channel.assertExchange(EXCHANGE.UNICAST.NAME, EXCHANGE.UNICAST.TYPE, {
          durable: true,
        }),
        channel.assertQueue(serverName, { exclusive: true }),
        channel.bindQueue(serverName, EXCHANGE.UNICAST.NAME, serverName),
        channel.consume(serverName, (data) => callback(data)),
      ]),
  });
};

const listError = (err) => {
  Object.keys(err).forEach((key) => {
    if (err[key].constructor === Object) {
      listError(err[key]);
    } else {
      console.log(err[key]);
    }
  });
};
module.exports = {
  makeBroadcastChannel,
  makeUnicastChannel,
  makeChannel,
};
