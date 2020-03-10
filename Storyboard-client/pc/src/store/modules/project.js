const state = {
  projects: []
};

const getters = {};
const actions = {};
const mutations = {
  add_projects(state, payload) {
    state.projects = state.projects.concat(payload);
  },
  reload_projects(state, payload) {
    state.projects = payload;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
