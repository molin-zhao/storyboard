import { pushMessage } from "@/common/utils/message";
const state = {
  messages: {} // tree
};

const getters = {};
const actions = {};
const mutations = {
  push_message(state, payload) {
    pushMessage(state, payload);
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
