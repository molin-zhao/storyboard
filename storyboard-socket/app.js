const http = require("http");
const express = require("express");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");

const { normalizePort, getServerId } = require("../common/utils");
const { ERROR } = require("../common/response");
const { SERVER_SOCKET_PORT } = require("../config/server.config");
const { APP_NAME } = require("../config/project.config");
const { createSocketServer } = require("./socket");

const indexRouter = require("./routers/index");

const app = express();
const SERVER_NAME = getServerId(APP_NAME);
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

// 3. setup server
let port = normalizePort(process.env.PORT || SERVER_SOCKET_PORT);
app.set("port", port);
const server = http.createServer(app);

// 4. setup socket
app.locals.sockerMap = {};
app.locals.serverName = SERVER_NAME;
createSocketServer(server, app);

// 5. start server
server.listen(port, "0.0.0.0", () => {
  console.log(`server lisenting on port ${port}`);
});
