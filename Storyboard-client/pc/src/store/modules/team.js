const state = {
  teams: []
};

const getters = {};
const actions = {};
const mutations = {
  add_teams(state, payload) {
    state.teams = state.teams.concat(payload);
  },
  reload_teams(state, payload) {
    state.teams = payload;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
