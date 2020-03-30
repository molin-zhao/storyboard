const socketIo = require("socket.io");
const redisOps = require("../redisOps");
const { ERROR } = require("../response");
const { SERVER_NAME } = require("../config/server.config");
const Message = require("../models/Message");
const User = require("../models/User");

const createSocketServer = (server, app) => {
  const io = socketIo(server);
  io.on("connection", socket => {
    socket.on("establish-connection", async (client, callback) => {
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
        // 2. bind mongodb user <-> status
        // 3. bind local user <-> socket
        const nameResp = await redisOps.setSocketServer(user, SERVER_NAME);
        if (nameResp.status !== 200) {
          throw new Error(ERROR.SERVICE_ERROR.SERVICE_NOT_AVAILABLE);
        }
        await User.setOnline(user);
        socket.user = user;
        app.locals.user_socket[user] = socket;
        return callback(true);
      } catch (err) {
        console.log(err);
        callback(false);
        return socket.disconnect();
      }
    });
    socket.on("send-message", async (message, callback) => {
      try {
        const { to } = message; // user id;
        const resp = await redisOps.getSocketServer(to);
        let serverName = resp.body.data;
        let unicastChannel = app.locals.unicast;
        let user_socket = app.locals.user_socket;
        if (serverName === SERVER_NAME) {
          // user is connected to this server
          let to_socket = user_socket[to];
          if (to_socket && to_socket.connected)
            to_socket.emit("receive-message", message, async ack => {
              if (ack) return callback(true);
              return callback(false);
            });
        } else {
          // user is connected to other server or offline
          if (serverName && unicastChannel) {
            // connected to other server
            const resp = await unicastChannel.publish(
              RABBITMQ_CLUSTER.EXCHANGE.UNICAST.NAME,
              serverName,
              message
            );
            console.log(resp);
            callback(true);
          } else {
            // user is offline
            const resp = await Message.createMessage(message);
            console.log(resp);
            callback(true);
          }
        }
      } catch (err) {
        console.log(err);
        return callback(false);
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
        await redisOps.delSocketServer(user);
        await User.setOffline(user);
      } catch (err) {
        console.log(err);
      }
    });
  });
};

const processMessage = (message, app) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { to } = message;
      let socket = app.locals.user_socket[to];
      if (socket && socket.connected) {
        socket.emit("receive-message", message, ack => {
          return resolve(ack);
        });
      } else {
        // user just offline or socket is not connected
        const resp = await Message.createMessage(message);
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
