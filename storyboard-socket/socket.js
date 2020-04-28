const socketIo = require("socket.io");
const redisOps = require("../redisOps");
const { ERROR } = require("../response");
const { SERVER_NAME } = require("../config/server.config");
const { makeUnicastChannel } = require("../rabbitmq");
const RABBITMQ_CLUSTER = require("../config/rabbitmq-cluster.config");
const Message = require("../models/Message");
const User = require("../models/User");

const createSocketServer = (server, app) => {
  const unicastChannel = makeUnicastChannel((message) => {
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
  });
  const io = socketIo(server);
  io.on("connection", (socket) => {
    socket.on("establish-connection", async (client, callback) => {
      try {
        // must provide credentials
        if (!client || !client.token || !client.id) return socket.disconnect();
        const tokenResp = await redisOps.getJwtToken(client.id);
        if (tokenResp !== client.token)
          throw new Error(ERROR.USER_AUTHENTICATION_FAILED);
        // token matched
        // 1. bind redis user <-> socket server
        // 2. bind mongodb user <-> status
        // 3. bind local user <-> socket
        await redisOps.setSocketServer(client.id, SERVER_NAME);
        await User.setOnline(client.id);
        const user = {
          id: client.id,
          username: client.username,
          avatar: client.avatar,
          gender: client.gender,
        };
        socket.user = user;
        app.locals.user_socket[client.id] = socket;
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
        const serverName = await redisOps.getSocketServer(toUserId);
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
    socket.on("message-received", async (messageIds) => {
      const del_msg = await Message.deleteMany({ _id: { $in: messageIds } });
      console.log(del_msg);
    });
    socket.on("notify-list", async (list) => {
      let oldList = socket.notifyList;
      let newList = null;
      if (oldList && oldList.constructor === Array) {
        newList = oldList.concat(list);
      } else {
        newList = list;
      }
      socket.notifyList = newList;
      let user = socket.user;
      for (let userId in list) {
        const serverName = await redisOps.getSocketServer(userId);
        let user_socket = app.locals.user_socket;
        if (serverName && serverName === SERVER_NAME) {
          let to_socket = user_socket[userId];
          if (to_socket && to_socket.connected)
            to_socket.emit("online", { data: user });
        } else if (serverName && unicastChannel) {
          await unicastChannel.publish(
            RABBITMQ_CLUSTER.EXCHANGE.UNICAST.NAME,
            serverName,
            { type: "online", data: user, to: userId }
          );
        }
      }
    });
    socket.on("disconnect", async () => {
      try {
        const userId = socket._id;
        const user = socket.user;
        const list = socket.notifyList;
        if (!userId || !user) return;
        if (app.locals.user_socket[userId]) {
          app.locals.user_socket[userId] = undefined;
          delete app.locals.user_socket[userId];
        }
        await redisOps.delSocketServer(userId);
        await User.setOffline(userId);
        for (let uid in list) {
          const serverName = await redisOps.getSocketServer(uid);
          let user_socket = app.locals.user_socket;
          if (serverName && serverName === SERVER_NAME) {
            let to_socket = user_socket[uid];
            if (to_socket && to_socket.connected)
              to_socket.emit("offline", { data: user });
          } else if (serverName && unicastChannel) {
            await unicastChannel.publish(
              RABBITMQ_CLUSTER.EXCHANGE.UNICAST.NAME,
              serverName,
              { type: "offline", data: user, to: uid }
            );
          }
        }
      } catch (err) {
        console.log(err);
      }
    });
  });
};

module.exports = createSocketServer;
