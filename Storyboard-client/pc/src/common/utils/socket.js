import io from "socket.io-client";
import * as URL from "@/common/utils/url";
import store from "@/store";

const createSocketConnection = user => {
  const socket = io(URL.CONNECT_SOCKET());
  if (!socket.connected) socket.disconnect();
  socket.on("connect", () => {
    socket.emit("establish-connection", user);
  });
  socket.on("establish-connection-success", () => {
    store.commit("user/add_socket", socket);
  });

  socket.on("establish-connection-failed", () => {
    socket.disconnect();
    store.commit("user/remove_socket");
  });
  socket.on("disconnect", () => {
    socket.disconnect();
    store.commit("user/remove_socket");
  });
};

export { createSocketConnection };
