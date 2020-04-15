import io from "socket.io-client";
import * as URL from "@/common/utils/url";
import { parser } from "@/common/utils/array";
import store from "@/store";

const createSocketConnection = user => {
  try {
    // check if store has a socket connection
    let storeSocket = store.state.user.socket;
    if (storeSocket) {
      storeSocket.close();
      store.commit("user/remove_socket");
    }
    const socket = io(URL.CONNECT_SOCKET(), {
      reconnection: true,
      reconnectionDelay: 1000 * 60 * 5, // 5 minutes
      reconnectionAttempts: 3,
      reconnectionDelayMax: 1000 * 60 * 10
    });
    socket.emit("establish-connection", user, ack => {
      if (!ack) return socket.close();
      else console.log("connected");
    });
    socket.on("connect", () => {
      console.log("connecting to server");
    });
    socket.on("disconnect", () => {
      socket.close();
      store.commit("user/remove_socket");
      console.log("disconnected");
    });
    socket.on("receive-messages", (messages, callback) => {
      store.commit("message/push_messages", messages);
      store.commit("message/save_message");
      const receivedMessageIds = parser(messages, "_id");
      callback(receivedMessageIds);
    });
    socket.on("push-message", (message, callback) => {
      store.commit("message/push_messages", message);
      store.commit("message/save_message");
      return callback(true);
    });
    return socket;
  } catch (err) {
    console.log(err);
    return null;
  }
};

const getNotifyMembers = (projects, exclude) => {
  let notifyMembers = {};
  projects.map(project => {
    let members = project["members"];
    members.map(member => {
      if (member._id !== exclude) notifyMembers[member._id] = "";
    });
  });
  return Object.keys(notifyMembers);
};

export { createSocketConnection, getNotifyMembers };
