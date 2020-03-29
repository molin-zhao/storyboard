const socketIo = require("socket.io");
const redisOps = require("../redisOps");
const { ERROR } = require("../response");
const { SERVER_NAME } = require("../config/server.config");
const Message = require("../models/Message");

const createSocketServer = (server, app) => {
  const io = socketIo(server);
  //   io.on("connection", socket => {
  //     console.log(`${socket.id} connected`);
  //     socket.on("message", data => {
  //       let destPort = data.port;
  //       let destMessage = data.data;
  //       console.log(data);
  //       unicastChannel.publish(
  //         RABBITMQ_CLUSTER.EXCHANGE.UNICAST.NAME,
  //         `${destPort}`,
  //         destMessage
  //       );
  //     });
  //   });
  io.on("connection", socket => {
    console.log(`${socket.id} connected`);
    socket.on("establish-connection", async client => {
      try {
        // must provide credentials
        let token = client.token;
        let user = client.id;
        if (!token || !user) return socket.disconnect();
        const tokenResp = await redisOps.getJwtToken(user);
        if (tokenResp.status !== 200 || tokenResp.body.data !== token) {
          throw new Error(ERROR.USER_AUTHENTICATION_FAILED);
        }
        // token matched
        // 1. bind redis user <-> socket server
        // 2. bind local user <-> socket
        const nameResp = await redisOps.setSocketServer(user, SERVER_NAME);
        if (nameResp.status !== 200) {
          throw new Error(ERROR.SERVICE_ERROR.SERVICE_NOT_AVAILABLE);
        }
        socket.user = user;
        app.locals.user_socket[user] = socket;
        return socket.emit("establish-connection-success");
      } catch (err) {
        socket.emit("establish-connection-failed", err.message);
        return socket.disconnect();
      }
    });
    socket.on("client-message", async (message, callback) => {
      try {
        const { to } = message; // user id;
        const resp = await redisOps.getSocketServer(to);
        let serverName = resp.body.data;
        let unicastChannel = app.locals.unicast;
        if (serverName && unicastChannel) {
          unicastChannel.publish(
            RABBITMQ_CLUSTER.EXCHANGE.UNICAST.NAME,
            serverName,
            message
          );
          callback(true);
        } else {
          const msgRes = await Message.createMessage(message);
          console.log(msgRes);
          callback(true);
        }
      } catch (err) {
        socket.emit("client-message-failed", message.id);
      }
    });
    socket.on("disconnect", async () => {
      try {
        let user = socket.user;
        if (app.locals.user_socket[user]) {
          app.locals.user_socket[user].disconnect();
          app.locals.user_socket[user] = undefined;
          delete app.locals.user_socket[user];
        }
        const resp = await redisOps.delSocketServer(user);
        console.log(resp);
      } catch (err) {
        console.log(err);
      }
    });
    // socket.on("confirm-login", async client => {
    //   let user = client.id;
    //   let access_token = client.access_token; // access_token
    //   let detail = client.detail;
    //   if (!user || !access_token || !detail) return socket.disconnect();
    //   try {
    //     const accessTokenCheck = await agent
    //       .post(REDIS_GET)
    //       .set("accept", "json")
    //       .send({
    //         auth: REDIS_CLUSTER.AUTH,
    //         key: `${user}:${REDIS_CLUSTER.REDIS_KEY.LOGIN_ACCESS_TOKEN}`
    //       });
    //     if (
    //       accessTokenCheck.status !== 200 ||
    //       accessTokenCheck.body.data !== access_token
    //     )
    //       throw new Error(ERROR.SERVICE_ERROR.SERVICE_NOT_AVAILABLE);
    //     // access_token verified, try to notify user confirm login
    //     if (app.locals.user_socket[user])
    //       return app.locals.user_socket[user].emit("on-confirm-login", detail);
    //     const confirmLoginPub = await channelWrapper.publish(
    //       EXCHANGE.RPC.NAME,
    //       "",
    //       { type: "confirm-login", data: detail },
    //       { contentType: "application/json", persistent: true }
    //     );
    //     if (!confirmLoginPub.data)
    //       throw new ERROR(ERROR.SERVICE_ERROR.SERVICE_NOT_AVAILABLE);
    //     return socket.emit("wait-for-response");
    //   } catch (err) {
    //     socket.emit("connection-failed", err);
    //     return socket.disconnect();
    //   }
    // });
  });
};

const processMessage = (message, app) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { to } = message;
      let socket = app.locals.user_socket[to];
      if (socket) {
        socket.emit("server-message", message, acknowledge => {
          return resolve(acknowledge);
        });
      } else {
        const resp = await Message.createMessage(message);
        console.log(resp);
        return resolve(resp);
      }
    } catch (err) {
      return reject(err);
    }
  });
};

module.exports = {
  createSocketServer,
  processMessage
};
