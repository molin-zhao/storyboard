const http = require("http");
const express = require("express");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const { normalizePort } = require("../utils");
const { ERROR } = require("../response");
const { SERVER_REDIS_PROXY_PORT } = require("../config/server.config");

const indexRouter = require("./routers/index");
const proxyRouter = require("./routers/proxy");

const app = express();
app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// 1. setup routers
app.use("/", indexRouter);
app.use("/redis", proxyRouter);

// 2. setup error 404 and 500
app.use((req, res) => {
  console.log(req.url);
  return res.status(404).json({
    message: ERROR.NOT_FOUND
  });
});

app.use((err, req, res, next) => {
  console.log(`${err.message} ${req.url} ${next}`);
  return res.status(500).json({
    message: ERROR.SERVER_ERROR
  });
});

let port = normalizePort(process.env.PORT || SERVER_REDIS_PROXY_PORT);
app.set("port", port);
const server = http.createServer(app);
server.listen(port, () => {
  console.log(`server lisenting on port ${port}`);
});
