import io from "socket.io-client";
import * as URL from "@/common/utils/url";
import store from "@/store";

const createSocketConnection = user => {
  try {
    // check if store has a socket connection
    let storeSocket = store.state.user.socket;
    if (storeSocket) {
      console.log("removing existing socket");
      storeSocket.close();
      store.commit("user/remove_socket");
    }
    const socket = io(URL.CONNECT_SOCKET(), {
      reconnection: true,
      reconnectionDelay: 1000 * 60 * 2, // 2 minutes
      reconnectionAttempts: Infinity,
      reconnectionDelayMax: 1000 * 60 * 5
    });
    socket.emit("establish-connection", user, ack => {
      if (!ack) socket.close();
    });
    socket.on("connect", () => {
      console.log("try to connect to server");
    });
    socket.on("disconnect", () => {
      console.log("disconnected");
      socket.close();
      store.commit("user/remove_socket");
    });
    socket.on("receive-message", (message, callback) => {
      store.commit("message/push_message", message);
      callback(true);
    });
    return socket;
  } catch (err) {
    console.log(err);
    return null;
  }
};

export { createSocketConnection };
