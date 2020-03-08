import { projects } from "../../mock/task";
import Vue from "vue";
const Http = new Vue();
import { LOCAL_SECRET_LEN } from "@/common/config/crypto";
import { encrypt, decrypt } from "@/common/utils/form";
const state = {
  projects: [],
  id: null,
  token: null
};
const getters = {
  get_projects: state => state.projects
};
const actions = {
  fetch_projects: async ({ commit }) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        commit("reload_projects", projects);
        return resolve("good");
      }, 3000);
    });
  },
  save_credential: ({ commit }, data) => {
    // encrypted token
    let secret = data.id.substr(0, LOCAL_SECRET_LEN);
    let encrypt_token = encrypt(data.token, secret);
    localStorage.setItem("id", data.id);
    localStorage.setItem("token", encrypt_token);
    commit("add_credential", data);
  },
  delete_credential: ({ commit }) => {
    localStorage.removeItem("id");
    localStorage.removeItem("token");
    commit("remove_credential");
  }
};
const mutations = {
  add_projects(state, payload) {
    state.projects = state.projects.concat(payload);
  },
  reload_projects(state, payload) {
    state.projects = payload;
  },
  add_credential(state, payload) {
    state.id = payload.id;
    state.token = payload.token;
  },
  remove_credential(state) {
    state.id = null;
    state.token = null;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
