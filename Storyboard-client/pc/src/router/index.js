import Vue from "vue";
import vueRouter from "vue-router";
import store from "@/store/index";

Vue.use(vueRouter);

const home = () => import("@/pages/home");
const storyboard = () => import("@/pages/storyboard");
const index = () => import("@/router-views/index");
const error = () => import("@/router-views/error");
const mobile = () => import("@/router-views/mobile");
const login = () => import("@/pages/login");
const register = () => import("@/pages/register");
import { decrypt } from "@/common/utils/form";
import { LOCAL_SECRET_LEN } from "@/common/config/crypto";

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
          path: "mobile",
          component: mobile
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
      name: "storyboard",
      component: storyboard
    },
    {
      path: "*",
      redirect: "/error/404"
    }
  ]
});

router.beforeEach((to, from, next) => {
  if (to.matched.some(r => r.name === "login" || r.name === "register")) {
    if (
      from.matched.some(
        r =>
          r.name === "storyboard" || r.name === "register" || r.name === "login"
      )
    )
      return next();
    if (isLogin()) {
      return next({ path: "/storyboard" });
    } else {
      return next();
    }
  }
  if (to.matched.some(r => r.name === "storyboard")) {
    if (from.matched.some(r => r.name === "storyboard")) return next();
    if (!isLogin()) return next({ name: "login" });
    let host = process.env.PASSPORT_HOST;
    let url = host + `user/token/verify?token=${store.state.user.token}`;
    return Vue.http
      .get(url)
      .then(res => {
        console.log(res);
        if (res.status === 202) {
          // token valid but renewed, update local and vuex store
          store.dispatch("user/save_credential", res.body.data);
        }
        return next();
      })
      .catch(err => {
        if (err.status === 403) {
          store.dispatch("user/delete_credential");
          return next({ name: "login" });
        } else {
          return next({ path: "/" });
        }
      });
  }
  return next();
});

const isLogin = () => {
  let id = store.state.user.id;
  let token = store.state.user.token;
  if (id && token) return true;
  return false;
};

export default router;
