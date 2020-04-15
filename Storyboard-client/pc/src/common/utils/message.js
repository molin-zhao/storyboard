const pushMessages = (state, msg) => {
  try {
    if (msg.constructor === Object) {
      pushMessage(state, msg);
      return Object.assign({}, state.messages);
    }
    if (msg.constructor === Array) {
      for (let m of msg) {
        pushMessage(state, m);
      }
      return Object.assign({}, state.messages);
    }
    return state.messages;
  } catch (err) {
    console.log(err.message);
    return state.messages;
  }
};

const pushMessage = (state, msg) => {
  let messages = state.messages;
  const { from } = msg;
  const fromId = from["_id"];
  if (!messages[fromId]) {
    messages[fromId] = {
      username: from["username"],
      avatar: from["avatar"],
      gender: from["gender"],
      messages: []
    };
  }
  messages[fromId]["messages"] = messages[fromId]["messages"].concat({
    read: false,
    ...msg
  });
  if (messages[fromId]["username"] !== from["username"])
    messages[fromId]["username"] = from["username"];
  if (messages[fromId]["gender"] !== from["gender"])
    messages[fromId]["gender"] = from["gender"];
  if (messages[fromId]["avatar"] !== from["avatar"])
    messages[fromId]["avatar"] = from["avatar"];
};

const removeMessage = (state, message) => {
  try {
    let messages = state.messages;
    const { from, to, _id } = message;
    const fromId = from["_id"];
    const toId = to["_id"];
    if (messages[toId]) {
      messages[toId]["messages"] = messages[toId]["messages"].filter(
        m => m["_id"] !== _id
      );
      return Object.assign({}, state.messages);
    }
    if (messages[fromId]) {
      messages[fromId]["messages"] = messages[fromId]["messages"].filter(
        m => m["_id"] !== _id
      );
      return Object.assign({}, state.messages);
    }
    return state.messages;
  } catch (err) {
    console.log(err);
    return state.messages;
  }
};

// append user sent messages
const appendMessage = (state, message) => {
  try {
    let messages = state.messages;
    const { to } = message;
    const toId = to["_id"];
    if (!messages[toId]) {
      messages[toId] = {
        username: to["username"],
        avatar: to["avatar"],
        gender: to["gender"],
        messages: []
      };
    }
    messages[toId]["messages"] = messages[toId]["messages"].concat({
      read: true,
      ...message
    });
    return Object.assign({}, state.messages);
  } catch (err) {
    console.log(err);
    return state.messages;
  }
};

const createMessage = (type, content, from, to) => {
  let timestamp = new Date().getTime();
  let _id = "" + uuid(16, 32) + timestamp;
  return {
    _id,
    type,
    content,
    from, // include user avatar, gender, id and username
    to // include user avatar, gender, id and username
  };
};

const getUnreadCountByFromId = (messages, fromId) => {
  let count = 0;
  let msgFrom = messages[fromId];
  if (!msgFrom) return null;
  let msgs = msgFrom["messages"];
  if (!msgs || msgs.length === 0) return null;
  for (let msg of msgs) {
    if (!msg["read"]) count++;
  }
  return count > 0 ? count : null;
};

const getUnreadCount = messages => {
  let count = 0;
  for (let key in messages) {
    let msgArr = messages[key]["messages"];
    for (let msg of msgArr) {
      if (!msg["read"]) count++;
    }
  }
  return count > 0 ? count : null;
};

const markAsRead = (state, id) => {
  let messages = state.messages;
  let msgFrom = messages[id];
  if (!msgFrom) return state.messages;
  let msgs = msgFrom["messages"];
  if (!msgs || msgs.length === 0) return state.messages;
  for (let msg in msgs) {
    if (!msg["read"]) msg["read"] = true;
  }
  return Object.assign({}, state.messages);
};

const uuid = (len, radix) => {
  var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split(
    ""
  );
  var uuid = [],
    i;
  radix = radix || chars.length;

  if (len) {
    // Compact form
    for (i = 0; i < len; i++) uuid[i] = chars[0 | (Math.random() * radix)];
  } else {
    // rfc4122, version 4 form
    var r;

    // rfc4122 requires these characters
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = "-";
    uuid[14] = "4";

    // Fill in random data.  At i==19 set the high bits of clock sequence as
    // per rfc4122, sec. 4.1.5
    for (i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | (Math.random() * 16);
        uuid[i] = chars[i == 19 ? (r & 0x3) | 0x8 : r];
      }
    }
  }

  return uuid.join("");
};

export {
  pushMessages,
  createMessage,
  appendMessage,
  removeMessage,
  getUnreadCount,
  getUnreadCountByFromId,
  markAsRead
};
