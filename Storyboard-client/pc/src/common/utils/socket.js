import io from "socket.io-client";
import * as URL from "@/common/utils/url";
import store from "@/store";

const createSocketConnection = (options = {}) => {
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
    socket.on("connect", () => {
      console.log("connecting to server");
    });
    socket.on("disconnect", () => {
      socket.close();
      store.commit("user/remove_socket");
      console.log("disconnected");
    });
    socket.on("receive-message", (message, callback) => {
      let receiveMessageCallback = options["receiveMessage"];
      if (receiveMessageCallback) receiveMessageCallback(message);
      callback(true);
    });
    socket.on("online", msg => {
      let user = msg["data"];
      let onlineCallback = options["online"];
      if (onlineCallback) onlineCallback(user);
    });
    socket.on("offline", msg => {
      let user = msg["data"];
      let offlineCallback = options["offline"];
      if (offlineCallback) offlineCallback(user);
    });
    return socket;
  } catch (err) {
    console.log(err);
    return null;
  }
};

const establishSocketConnection = (socket, user) => {
  return new Promise((resolve, reject) => {
    socket.emit("establish-connection", user, ack => {
      if (ack) return resolve(ack);
      socket.close();
      store.commit("user/remove_socket");
      return reject(ack);
    });
  });
};

const fetchUserMessages = socket => {
  return new Promise((resolve, reject) => {
    socket.emit("fetch-message", null, ack => {
      if (ack) return resolve(ack);
      return reject(ack);
    });
  });
};

const updateGlobalProjectMembers = (state, members) => {
  if (!member || member.constructor !== Array || member.length === 0) {
    return state.globalProjectMembers;
  }
  let globalProjectMembers = state.globalProjectMembers;
  for (let member of members) {
    let memberId = member["_id"];
    let memberOnline =
      typeof member["online"] === "undefined" ? false : member["online"];
    if (typeof memberId === "undefined") continue;
    globalProjectMembers[memberId] = memberOnline;
  }
  return Object.assign({}, globalProjectMembers);
};

const updateGlobalMemberStatus = (state, user, status) => {
  let globalProjectMembers = state.globalProjectMembers;
  if (!user) return globalProjectMembers;
  let userId = user["_id"];
  if (typeof userId === "undefined" || !globalProjectMembers[userId])
    return globalProjectMembers;
  let isOnline = status === "online" ? true : false;
  if (globalProjectMembers[userId] === isOnline) return globalProjectMembers;
  globalProjectMembers[userId] = isOnline;
  return Object.assign({}, globalProjectMembers);
};

export {
  createSocketConnection,
  updateGlobalProjectMembers,
  updateGlobalMemberStatus,
  establishSocketConnection,
  fetchUserMessages
};
