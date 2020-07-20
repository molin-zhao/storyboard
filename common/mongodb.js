const mongoose = require("mongoose");
const { getMongoUrl } = require("./utils");
const MONGO_CLUSTER = require("../config/mongo-cluster.config");

// 3. setup mongodb connection
let dbUrl = getMongoUrl(MONGO_CLUSTER.NODES, MONGO_CLUSTER.DB_NAME);
mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  authSource: MONGO_CLUSTER.AUTH_DB,
  auth: MONGO_CLUSTER.AUTH,
});
mongoose.connection.on("connected", () => {
  console.log("connected to mongodb");
});

mongoose.connection.on("error", (err) => {
  console.log(`connect to mongodb error: ${err}`);
});

mongoose.connection.on("disconnected", () => {
  console.log("disconnected from mongodb");
});

mongoose.set("useFindAndModify", false);

module.exports = mongoose;
