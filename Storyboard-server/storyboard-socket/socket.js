const socketIo = require("socket.io");
const redisOps = require("../redisOps");
const { ERROR } = require("../response");
const { SERVER_NAME } = require("../config/server.config");
const Message = require("../models/Message");
const User = require("../models/User");

const createSocketServer = (server, app) => {
  const io = socketIo(server);
  io.on("connection", (socket) => {
    socket.on("establish-connection", async (client, callback) => {
      try {
        // must provide credentials
        const { id, token, user } = client;
        if (!token || !id) return socket.disconnect();
        const tokenResp = await redisOps.getJwtToken(id);
        if (tokenResp.status !== 200 || tokenResp.body.data !== token) {
          throw new Error(ERROR.USER_AUTHENTICATION_FAILED);
        }
        // token matched
        // 1. bind redis user <-> socket server
        // 2. bind mongodb user <-> status
        // 3. bind local user <-> socket
        const nameResp = await redisOps.setSocketServer(id, SERVER_NAME);
        if (nameResp.status !== 200) {
          throw new Error(ERROR.SERVICE_ERROR.SERVICE_NOT_AVAILABLE);
        }
        await User.setOnline(id);
        socket.user = id;
        socket.userInfo = user;
        app.locals.user_socket[id] = socket;
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
        const toUserId = to["_id"];
        const resp = await redisOps.getSocketServer(toUserId);
        let serverName = resp.body.data;
        let unicastChannel = app.locals.unicast;
        let user_socket = app.locals.user_socket;
        if (serverName && serverName === SERVER_NAME) {
          // user is connected to this server
          let to_socket = user_socket[toUserId];
          if (to_socket && to_socket.connected)
            to_socket.emit("receive-message", message, async (ack) => {
              if (!ack) return callback(false);
              return callback(true);
            });
        } else {
          // user is connected to other server or offline
          if (serverName && unicastChannel) {
            // connected to other server
            await unicastChannel.publish(
              RABBITMQ_CLUSTER.EXCHANGE.UNICAST.NAME,
              serverName,
              message
            );
            callback(true);
          } else {
            // user is offline
            await Message.createMessage(message);
            callback(true);
          }
        }
      } catch (err) {
        console.log(err);
        return callback(false);
      }
    });
    socket.on("notify-list", (list) => {
      socket.notifyList = list;
      let userInfo = socket.userInfo;
      notifyUser(app, userInfo, list, "online");
    });
    socket.on("disconnect", async () => {
      try {
        let user = socket.user;
        let userInfo = socket.userInfo;
        let notifyList = socket.notifyList;
        if (app.locals.user_socket[user]) {
          app.locals.user_socket[user].disconnect();
          app.locals.user_socket[user] = undefined;
          delete app.locals.user_socket[user];
        }
        await redisOps.delSocketServer(user);
        await User.setOffline(user);
        notifyUser(app, userInfo, notifyList, "offline");
      } catch (err) {
        console.log(err);
      }
    });
  });
};

const processMessage = (message, app) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { type, to } = message;
      let toId = "";
      if (to && to.constructor === String) {
        toId = to;
      } else if (to && to.constructor === Object) {
        toId = to["_id"];
      } else {
        // no dest user specified
        // ignore this messasge
        return resolve();
      }
      let socket = app.locals.user_socket[toId];
      if (socket && socket.connected) {
        if (type === "chat") {
          socket.emit("receive-message", message, (ack) => {
            return resolve(ack);
          });
        } else {
          socket.emit(type, message);
          return resolve();
        }
      } else {
        // user just offline or socket is not connected
        if (type === "chat") await Message.createMessage(message);
        return resolve();
      }
    } catch (err) {
      return reject(err);
    }
  });
};

const notifyUser = async (app, user, list, type = "online") => {
  if (!list || list.constructor !== Array) return;
  for (let userId in list) {
    const resp = await redisOps.getSocketServer(userId);
    let serverName = resp.body.data;
    let unicastChannel = app.locals.unicast;
    let user_socket = app.locals.user_socket;
    if (serverName && serverName === SERVER_NAME) {
      let to_socket = user_socket[userId];
      if (to_socket && to_socket.connected)
        to_socket.emit(type, { data: user });
    } else if (serverName && unicastChannel) {
      await unicastChannel.publish(
        RABBITMQ_CLUSTER.EXCHANGE.UNICAST.NAME,
        serverName,
        { type, data: user, to: userId }
      );
    }
  }
};

module.exports = {
  createSocketServer,
  processMessage,
};
