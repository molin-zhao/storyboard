const http = require("http");
const express = require("express");
const mongoose = require("mongoose");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const amqp = require("amqp-connection-manager");
const socketIo = require("socket.io");
const agent = require("superagent");

const { normalizePort, getMongoUrl, getRabbitmqUrl } = require("../utils");
const { ERROR } = require("../response");
const { SERVER_SOCKER_PORT } = require("../config/server.config");
const MONGO_CLUSTER = require("../config/mongo-cluster.config");
const RABBITMQ_CLUSTER = require("../config/rabbitmq-cluster.config");
const REDIS_CLUSTER = require("../config/redis-cluster.config");
const { REDIS_GET } = require("../config/proxy.config");

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
    data: req.url
  });
});

app.use((err, req, res, next) => {
  return res.status(500).json({
    message: err.message ? err.message : ERROR.SERVER_ERROR,
    data: req.url
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
    auth: MONGO_CLUSTER.AUTH
  })
  .then(() => console.log("connected to mongodb"))
  .catch(err => console.log(`connect to mongodb error: ${err}`));
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
rabbitmqConn.on("disconnect", err => {
  console.log(`rabbitmq cluster disconnected with err: ${err}`);
});
const channelWrapper = rabbitmqConn.createChannel({
  json: true,
  setup: channel =>
    Promise.all([
      channel.assertExchange(
        RABBITMQ_CLUSTER.EXCHANGE.RPC.NAME,
        RABBITMQ_CLUSTER.EXCHANGE.RPC.TYPE,
        { durable: true }
      ),
      channel.assertQueue("", { exclusive: true }),
      channel.bindQueue("", RABBITMQ_CLUSTER.EXCHANGE.RPC.NAME, ""),
      channel.consume("", data => {
        let message = JSON.parse(data.content.toString());
        console.log(message);
        channelWrapper.ack(data);
      })
    ])
});
app.locals.rabbitmq = channelWrapper;

// 5. setup server
let port = normalizePort(process.env.PORT || SERVER_SOCKER_PORT);
app.set("port", port);
const server = http.createServer(app);

// 6. setup socket
app.locals.user_socket = {};
const io = socketIo(server);
io.on("connection", socket => {
  socket.on("establish-connection", async client => {
    // must provide real credentials
    let token = client.token;
    let user = client.id;
    if (!token || !user) return socket.disconnect();
    try {
      const tokenCheck = await agent
        .post(REDIS_GET)
        .set("accept", "json")
        .send({
          auth: REDIS_CLUSTER.AUTH,
          key: `${id}:${REDIS_CLUSTER.REDIS_KEY.LOGIN_TOKEN}`
        });
      if (tokenCheck.status !== 200 || tokenCheck.body.data !== token)
        throw new Error(ERROR.SERVICE_ERROR.SERVICE_NOT_AVAILABLE);
      // token matched, store user socket in locals.user_socket
      socket.user = user;
      app.locals.user_socket[user] = socket;
      return socket.emit("connection-success");
    } catch (err) {
      socket.emit(
        "connection-failed",
        ERROR.SERVICE_ERROR.SERVICE_NOT_AVAILABLE
      );
      return socket.disconnect();
    }
  });
  socket.on("disconnect", () => {
    let user = socket.user;
    if (app.locals.user_socket[user]) {
      app.locals.user_socket[user].disconnect();
      app.locals.user_socket[user] = undefined;
      delete app.locals.user_socket[user];
    }
  });
  socket.on("confirm-login", async client => {
    let user = client.id;
    let access_token = client.access_token; // access_token
    let detail = client.detail;
    if (!user || !access_token || !detail) return socket.disconnect();
    try {
      const accessTokenCheck = await agent
        .post(REDIS_GET)
        .set("accept", "json")
        .send({
          auth: REDIS_CLUSTER.AUTH,
          key: `${user}:${REDIS_CLUSTER.REDIS_KEY.LOGIN_ACCESS_TOKEN}`
        });
      if (
        accessTokenCheck.status !== 200 ||
        accessTokenCheck.body.data !== access_token
      )
        throw new Error(ERROR.SERVICE_ERROR.SERVICE_NOT_AVAILABLE);
      // access_token verified, try to notify user confirm login
      if (app.locals.user_socket[user])
        return app.locals.user_socket[user].emit("on-confirm-login", detail);
      const confirmLoginPub = await channelWrapper.publish(
        EXCHANGE.RPC.NAME,
        "",
        { type: "confirm-login", data: detail },
        { contentType: "application/json", persistent: true }
      );
      if (!confirmLoginPub.data)
        throw new ERROR(ERROR.SERVICE_ERROR.SERVICE_NOT_AVAILABLE);
      return socket.emit("wait-for-response");
    } catch (err) {
      socket.emit("connection-failed", err);
      return socket.disconnect();
    }
  });
});

// 7. start server
server.listen(port, "0.0.0.0", () => {
  console.log(`server lisenting on port ${port}`);
});
