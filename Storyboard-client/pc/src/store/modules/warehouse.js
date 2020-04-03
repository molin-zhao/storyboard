const state = {
  warehouse: []
};

const getters = {};
const actions = {};
const mutations = {
  add_warehouse(state, payload) {
    state.warehouse = state.warehouse.concat(payload);
  },
  reload_warehouse(state, payload) {
    state.warehouse = payload;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
