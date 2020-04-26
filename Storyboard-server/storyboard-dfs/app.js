const http = require("http");
const express = require("express");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");

const { normalizePort } = require("../utils");
const { ERROR } = require("../response");
const { SERVER_DFS_PORT } = require("../config/server.config");

const indexRouter = require("./routers/index");
const dfsRouter = require("./routers/dfs");

const app = express();
app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

// 1. setup routers
app.use("/", indexRouter);
app.use("/dfs", dfsRouter);

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

// 3. start server
let port = normalizePort(process.env.PORT || SERVER_DFS_PORT);
app.set("port", port);
const server = http.createServer(app);
server.listen(port, "0.0.0.0", () => {
  console.log(`server lisenting on port ${port}`);
});
