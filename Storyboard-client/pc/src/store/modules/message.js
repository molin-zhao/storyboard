import {
  pushMessages,
  appendMessage,
  removeMessage,
  markAsRead
} from "@/common/utils/message";
const state = {
  messages: {}, // tree
  pendingMessages: [], // used for recording pending or sending messages
  failedMessages: [] // used for recording failed messages
};

const getters = {};
const actions = {
  restore_message: ({ commit }) => {
    try {
      let storageMessage = localStorage.getItem("message");
      if (storageMessage) {
        commit("init_message", JSON.parse(storageMessage));
      } else {
        commit("init_message", {
          messages: {},
          pendingMessages: [],
          failedMessages: []
        });
      }
    } catch (err) {}
  }
};
const mutations = {
  push_messages(state, payload) {
    state.messages = pushMessages(state, payload);
  },
  append_message(state, payload) {
    state.messages = appendMessage(state, payload);
  },
  remove_message(state, payload) {
    state.messages = removeMessage(state, payload);
  },
  add_pending(state, payload) {
    state.pendingMessages = state.pendingMessages.concat(payload);
  },
  add_failed(state, payload) {
    state.failedMessages = state.failedMessages.concat(payload);
  },
  remove_pending(state, payload) {
    state.pendingMessages = state.pendingMessages.filter(m => m !== payload);
  },
  remove_failed(state, payload) {
    state.failedMessages = state.failedMessages.filter(m => m !== payload);
  },
  save_message(state) {
    localStorage.setItem("message", JSON.stringify(state));
  },
  init_message(state, payload) {
    state.messages = payload.messages;
    state.pendingMessages = payload.pendingMessages;
    state.failedMessages = payload.failedMessages;
  },
  mark_read(state, payload) {
    state.messages = markAsRead(state, payload);
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
