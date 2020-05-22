const socketIo = require("socket.io");
const redisOps = require("../redisOps");
const { SERVER_NAME } = require("../config/server.config");
const { makeUnicastChannel } = require("../rabbitmq");
const { EXCHANGE } = require("../config/rabbitmq-cluster.config");
const Message = require("../models/Message");
const User = require("../models/User");

const createSocketServer = (server, app) => {
  const unicastChannel = makeUnicastChannel(async (data) => {
    try {
      const message = JSON.parse(data.content.toString());
      const { type, to } = message;
      if (!to) return unicastChannel.ack(data);
      let toId = to.constructor === Object ? to["_id"] : to;
      let socket = app.locals.socketMap[toId];
      if (socket && socket.connected) {
        if (type && type.constructor === String) {
          socket.emit(type, message, (ack) => {
            if (ack) return unicastChannel.ack(data);
          });
        } else {
          // type is not specified, dismiss this message
          return unicastChannel.ack(data);
        }
      } else {
        // user just offline or socket is not connected
        if (type === "chat") await Message.createMessage(message);
        return unicastChannel.ack(data);
      }
    } catch (err) {
      console.log(err);
    }
  });
  const io = socketIo(server);
  io.on("connection", async (socket) => {
    try {
      const { token, id, username, avatar, gender } = socket.handshake.query;
      if (!token || !id) return socket.disconnect();
      const resp = await redisOps.getJwtToken(id);
      if (resp !== token) return socket.disconnect();
      await redisOps.setSocketServer(id, SERVER_NAME);
      await User.setOnline(id);
      socket.user = { id, username, avatar, gender };
      app.locals.socketMap[id] = socket;
      socket.on("chat", async (message, callback) => {
        try {
          const { to, from } = message; // user id;
          const { avatar, username } = from;
          const toId = to["_id"];
          const fromId = from["_id"];
          const serverName = await redisOps.getSocketServer(toId);
          let socketMap = app.locals.socketMap;
          let fu = socketMap[fromId] ? socketMap[fromId]["user"] : null;
          if (fu && fu["avatar"] !== avatar) fu["avatar"] = avatar;
          if (fu && fu["username"] !== username) fu["username"] = username;
          if (serverName && serverName === SERVER_NAME) {
            // user is connected to this server
            let toSocket = socketMap[toId];
            if (toSocket && toSocket.connected)
              toSocket.emit("chat", message, async (ack) => {
                if (!ack) return callback(false);
                return callback(true);
              });
          } else {
            // user is connected to other server or offline
            if (serverName && unicastChannel) {
              // connected to other server
              await unicastChannel.publish(
                EXCHANGE.UNICAST.NAME,
                serverName,
                message
              );
              return callback(true);
            } else {
              // user is offline
              await Message.createMessage(message);
              return callback(true);
            }
          }
        } catch (err) {
          console.log(err);
          return callback(false);
        }
      });
      socket.on("message-received", async (messageIds) => {
        await Message.deleteMany({ _id: { $in: messageIds } });
      });
      socket.on("notify-list", async (list) => {
        let oldList = socket.notifyList;
        if (oldList && oldList.constructor === Array) {
          socket.notifyList = oldList.concat(list);
        } else {
          socket.notifyList = list;
        }
        let user = socket.user;
        for (let userId of list) {
          const serverName = await redisOps.getSocketServer(userId);
          let socketMap = app.locals.socketMap;
          if (serverName && serverName === SERVER_NAME) {
            let toSocket = socketMap[userId];
            if (toSocket && toSocket.connected)
              toSocket.emit("online", { data: user });
          } else if (serverName && unicastChannel) {
            await unicastChannel.publish(EXCHANGE.UNICAST.NAME, serverName, {
              type: "online",
              data: user,
              to: userId,
            });
          }
        }
      });
      socket.on("disconnect", async () => {
        try {
          const user = socket.user;
          const list = socket.notifyList;
          if (!user) return;
          const userId = user["id"];
          if (app.locals.socketMap[userId]) {
            app.locals.socketMap[userId] = undefined;
            delete app.locals.socketMap[userId];
          }
          await redisOps.delSocketServer(userId);
          await User.setOffline(userId);
          for (let uid of list) {
            const serverName = await redisOps.getSocketServer(uid);
            let socketMap = app.locals.socketMap;
            if (serverName && serverName === SERVER_NAME) {
              let toSocket = socketMap[uid];
              if (toSocket && toSocket.connected)
                toSocket.emit("offline", { data: user });
            } else if (serverName && unicastChannel) {
              await unicastChannel.publish(EXCHANGE.UNICAST.NAME, serverName, {
                type: "offline",
                data: user,
                to: uid,
              });
            }
          }
        } catch (err) {
          console.log(err);
        }
      });
    } catch (err) {
      console.log(err);
      return socket.disconnect();
    }
  });
};

module.exports = {
  createSocketServer,
};
