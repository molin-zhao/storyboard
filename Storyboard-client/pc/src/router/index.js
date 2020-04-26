import Vue from "vue";
import vueRouter from "vue-router";
import store from "@/store";
import * as URL from "@/common/utils/url";
import { LOCAL_SECRET_LEN } from "@/common/config/crypto";
import { decrypt } from "@/common/utils/form";

Vue.use(vueRouter);

const home = () => import("@/pages/home");
const storyboard = () => import("@/pages/storyboard");
import index from "@/router-views/index";
import error from "@/router-views/error";
import login from "@/pages/login";
import register from "@/pages/register";

const router = new vueRouter({
  mode: "history",
  routes: [
    {
      path: "/",
      component: home,
      children: [
        {
          path: "",
          component: index
        },
        {
          path: "error/:code",
          component: error
        },
        {
          path: "login",
          name: "login",
          component: login
        },
        {
          path: "register",
          name: "register",
          component: register
        }
      ]
    },
    {
      path: "/storyboard",
      component: storyboard
    },
    {
      path: "*",
      redirect: "/error/404"
    }
  ]
});

router.beforeEach(async (to, from, next) => {
  if (to.matched.some(r => r.name === "login" || r.name === "register")) {
    if (
      from.matched.some(
        r =>
          r.path === "/storyboard" ||
          r.name === "register" ||
          r.name === "login"
      )
    )
      return next();
    if (isLogin()) {
      return next({ path: "/storyboard" });
    } else {
      return next();
    }
  }
  if (to.matched.some(r => r.path === "/storyboard")) {
    if (!isLogin()) return next({ name: "login" });
    try {
      let url = URL.GET_VERIFY_TOKEN(store.state.user.token);
      const res = await Vue.http.get(url);
      if (res.status === 201) {
        // token valid but renewed, update local and vuex store
        store.dispatch("user/save_credential", res.data.data);
        console.log(store.state.user.token);
        return next();
      }
      return next();
    } catch (err) {
      if (err.status === 401) {
        store.dispatch("user/delete_credential");
        return next({ name: "login" });
      } else {
        return next();
      }
    }
  }
  return next();
});

const isLogin = () => {
  let storeId = store.state.user.id;
  let storeToken = store.state.user.token;
  let storeAvatar = store.state.user.avatar;
  let storeUsername = store.state.user.username;
  let storeGender = store.state.user.gender;
  if (storeId && storeToken) return true;
  let localId = localStorage.getItem("id");
  let localEncryptedToken = localStorage.getItem("token");
  if (!localId || !localEncryptedToken) return false;
  let secret = localId.substr(0, LOCAL_SECRET_LEN);
  let localToken = decrypt(localEncryptedToken, secret);
  store.commit("user/add_credential", { id: localId, token: localToken });
  if (storeAvatar && storeUsername && storeGender) return true;
  let localAvatar = localStorage.getItem("avatar");
  let localUsername = localStorage.getItem("username");
  let localGender = localStorage.getItem("gender");
  store.commit("user/add_userinfo", {
    avatar: localAvatar,
    username: localUsername,
    gender: localGender
  });
  return true;
};

export default router;
