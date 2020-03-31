const pushMessage = (state, message) => {
  try {
    let messages = state.messages;
    const { from } = message;
    if (messages[from._id]) {
      messages[from._id]["username"] = from.username;
      messages[from._id]["avatar"] = from.avatar;
      messages[from._id]["gender"] = from.gender;
      messages[from._id]["messages"] = messages[from._id]["messages"].concat(
        message
      );
    } else {
      messages[from._id] = {
        username: from.username,
        avatar: from.avatar,
        gender: from.gender,
        messages: [message]
      };
    }
  } catch (err) {
    console.log(err);
  }
};

const removeMessasge = (state, message) => {
  try {
    let messages = state.messages;
    const { from, to } = message;
    if (messages[to]) {
      messages[to]["messages"] = messages[to]["messages"].filter(
        m => m._id !== message._id
      );
    } else if (messages[from._id]) {
      messages[from._id]["messages"] = messages[from._id]["messages"].filter(
        m => m._id !== message._id
      );
    } else {
      return;
    }
  } catch (err) {
    console.log(err);
  }
};

const pushMessages = (state, messageArr) => {};

const appendMessage = (state, message) => {
  try {
    let messages = state.messages;
    const { from, to } = message;
    if (messages[to]) {
      messages[to]["messages"] = messages[to]["messages"].concat(message);
    } else {
      messages[to] = {
        username: from.username,
        avatar: from.avatar,
        gender: from.gender,
        messages: [message]
      };
    }
  } catch (err) {
    console.log(err);
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
    to
  };
};

const getUnreadCount = messages => {
  let count = 0;
  if (!messages || messages.constructor !== Object) return null;
  if (Object.keys(messages).length === 0) return null;
  for (let key in messages) {
    let mArr = messages[key]["messages"];
    for (let index in mArr) {
      if (mArr[index]["read"]) continue;
      count++;
    }
  }
  return count > 0 ? count : null;
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
  pushMessage,
  createMessage,
  appendMessage,
  removeMessasge,
  getUnreadCount
};
