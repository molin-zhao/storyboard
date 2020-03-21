import { addLog, removeLog } from "@/common/utils/log";
const state = {
  projects: [],
  activeIndex: 0,
  logs: {} // tree
};

const getters = {};
const actions = {};
const mutations = {
  add_projects(state, payload) {
    state.projects = state.projects.concat(payload);
  },
  reload_projects(state, payload) {
    state.projects = payload;
  },
  selete_index(state, payload) {
    state.activeIndex = payload;
  },
  add_log(state, payload) {
    state.logs = addLog(state.logs, payload);
  },
  remove_log(state, payload) {
    state.logs = removeLog(state.logs, payload);
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
