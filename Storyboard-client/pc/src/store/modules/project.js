const state = {
  projects: [],
  logs: []
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
  add_log(state, payload) {
    state.logs = state.logs.concat(payload);
  },
  remove_log(state, payload) {
    state.logs = state.logs.filter(log => log.id !== payload.id);
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
