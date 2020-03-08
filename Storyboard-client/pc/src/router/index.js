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
    if (isLogin()) return next({ path: "/storyboard" });
  }
  if (to.matched.some(r => r.name === "storyboard")) {
    if (!isLogin()) return next({ path: "/" });
  }
  return next();
});

const isLogin = () => {
  let lsId = localStorage.getItem("id");
  let lsToken = decrypt(
    localStorage.getItem("token"),
    lsId.substr(0, LOCAL_SECRET_LEN)
  );
  let sId = store.state.user.id;
  let sToken = store.state.user.token;
  let id = sId || lsId;
  let token = lsToken || sToken;
  if (id && token) return true;
  return false;
};

export default router;
