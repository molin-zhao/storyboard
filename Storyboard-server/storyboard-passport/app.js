const http = require("http");
const express = require("express");
const mongoose = require("mongoose");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const geoip = require("geoip-lite");

const { normalizePort, getMongoUrl } = require("../utils");
const { ERROR } = require("../response");
const { SERVER_PASSPORT_PORT, MONGO_CLUSTER } = require("../config");

const indexRouter = require("./routers/index");
const userRouter = require("./routers/user");
const loginRouter = require("./routers/login");
const registerRouter = require("./routers/register");

const app = express();
app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// 1. setup routers
app.use("/", indexRouter);
app.use("/user", userRouter);
app.use("/login", loginRouter);
app.use("/register", registerRouter);

// 2. setup error 404 and 500
app.use((req, res) => {
  console.log(req.url);
  return res.status(404).json({
    message: ERROR.NOT_FOUND
  });
});

app.use((err, req, res, next) => {
  console.log(`${err.message} ${req.url}`);
  return res.status(500).json({
    message: ERROR.SERVER_ERROR
  });
});

// 3. setup mongodb connection
let dbUrl = getMongoUrl(MONGO_CLUSTER.NODES, MONGO_CLUSTER.DB_NAME);
mongoose
  .connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    authSource: MONGO_CLUSTER.AUTH_DB,
    auth: MONGO_CLUSTER.AUTH
  })
  .then(() => console.log("connected to mongodb"))
  .catch(err => console.log(`connect to mongodb error: ${err}`));

// 4. start server
let port = normalizePort(process.env.PORT || SERVER_PASSPORT_PORT);
app.set("port", port);
const server = http.createServer(app);
server.listen(port, "0.0.0.0", () => {
  console.log(`server lisenting on port ${port}`);
});
