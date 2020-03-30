import {
  pushMessage,
  appendMessage,
  removeMessasge
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
      let state_message = localStorage.getItem("message");
      if (state_message) {
        commit("init_message", JSON.parse(state_message));
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
  push_message(state, payload) {
    pushMessage(state, payload);
  },
  append_message(state, payload) {
    appendMessage(state, payload);
  },
  remove_message(state, payload) {
    removeMessasge(state, payload);
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
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
