import { LOCAL_SECRET_LEN } from "@/common/config/crypto";
import { encrypt } from "@/common/utils/form";

const state = {
  id: "",
  token: "",
  socket: null,
  avatar: "",
  username: "",
  gender: "m",
  email: "",
  phone: ""
};
const getters = {};
const actions = {
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
  },
  save_userinfo: ({ commit }, data) => {
    localStorage.setItem("username", data.username);
    localStorage.setItem("avatar", data.avatar);
    localStorage.setItem("gender", data.gender);
    commit("add_userinfo", data);
  },
  remove_userinfo: ({ commit }) => {
    localStorage.removeItem("username");
    localStorage.removeItem("avatar");
    localStorage.removeItem("gender");
    commit("remove_userinfo");
  }
};
const mutations = {
  add_credential(state, payload) {
    state.id = payload.id;
    state.token = payload.token;
  },
  remove_credential(state) {
    state.id = null;
    state.token = null;
  },
  add_userinfo(state, payload) {
    state.username = payload.username;
    state.avatar = payload.avatar;
    state.gender = payload.gender;
    state.email = payload.email;
    state.phone = payload.phone;
  },
  remove_userinfo(state) {
    state.username = "";
    state.avatar = "";
    state.gender = "m";
    state.email = "";
    state.phone = "";
  },
  add_socket(state, payload) {
    state.socket = payload;
  },
  remove_socket(state) {
    state.socket = null;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
