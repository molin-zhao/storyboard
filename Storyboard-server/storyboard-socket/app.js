const http = require("http");
const express = require("express");
const mongoose = require("mongoose");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const amqp = require("amqp-connection-manager");

const { normalizePort, getMongoUrl, getRabbitmqUrl } = require("../utils");
const { ERROR } = require("../response");
const { SERVER_SOCKET_PORT, SERVER_NAME } = require("../config/server.config");
const MONGO_CLUSTER = require("../config/mongo-cluster.config");
const RABBITMQ_CLUSTER = require("../config/rabbitmq-cluster.config");
const { createSocketServer, processMessage } = require("./socket");

const indexRouter = require("./routers/index");

const app = express();
app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

// 1. setup routers
app.use("/", indexRouter);

// 2. setup error 404 and 500
app.use((req, res) => {
  console.log(req.url);
  return res.status(404).json({
    message: ERROR.NOT_FOUND,
    data: req.url,
  });
});

app.use((err, req, res, next) => {
  return res.status(500).json({
    message: err.message ? err.message : ERROR.SERVER_ERROR,
    data: req.url,
  });
});

// 3. setup mongodb connection
let dbUrl = getMongoUrl(MONGO_CLUSTER.NODES, MONGO_CLUSTER.DB_NAME);
mongoose
  .connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    authSource: MONGO_CLUSTER.AUTH_DB,
    auth: MONGO_CLUSTER.AUTH,
  })
  .then(() => console.log("connected to mongodb"))
  .catch((err) => console.log(`connect to mongodb error: ${err}`));
mongoose.set("useFindAndModify", false);

// 4. setup rabbitmq connection
let rabbitHost = getRabbitmqUrl(
  RABBITMQ_CLUSTER.HOST,
  RABBITMQ_CLUSTER.USER,
  RABBITMQ_CLUSTER.PASSWORD
);
const rabbitmqConn = amqp.connect(rabbitHost);
rabbitmqConn.on("connect", () => {
  console.log("rabbitmq cluster connected");
});
rabbitmqConn.on("disconnect", (err) => {
  console.log(`rabbitmq cluster disconnected with err: ${err}`);
});
const broadcastChannel = rabbitmqConn.createChannel({
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
      channel.consume("", (data) => {
        let message = JSON.parse(data.content.toString());
        console.log(message);
        broadcastChannel.ack(data);
      }),
    ]),
});

const unicastChannel = rabbitmqConn.createChannel({
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
          let message = JSON.parse(data.content.toString());
          const resp = await processMessage(message, app);
          if (resp) unicastChannel.ack(data);
          else console.log(resp);
        } catch (err) {
          console.log(err);
        }
      }),
    ]),
});

app.locals.broadcast = broadcastChannel;
app.locals.unicast = unicastChannel;

// 5. setup server
let port = normalizePort(process.env.PORT || SERVER_SOCKET_PORT);
app.set("port", port);
const server = http.createServer(app);

// 6. setup socket
app.locals.user_socket = {};
createSocketServer(server, app);

// 7. start server
server.listen(port, "0.0.0.0", () => {
  console.log(`server lisenting on port ${port}`);
});
