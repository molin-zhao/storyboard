import { LOCAL_SECRET_LEN } from "@/common/config/crypto";
import { encrypt } from "@/common/utils/form";
const state = {
  id: null,
  token: null,
  socket: null,
  avatar: "",
  gender: "",
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
    state.avatar = payload.avatar;
    state.gender = payload.gender;
    state.email = payload.email;
    state.phone = payload.phone;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
