// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from "vue";
import App from "./App";
import VueResource from "vue-resource";

// bootstrap
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";

// custom elements
import "@/assets/icon";
import "@/assets/loading";
import Alert from "@/plugins/alert";
import Toast from "@/plugins/toast";
import Confirm from "@/plugins/confirm";

import store from "./store";
import router from "./router";
import i18n from "./i18n";

Vue.config.productionTip = false;
Vue.use(Alert);
Vue.use(Toast);
Vue.use(Confirm);
Vue.use(VueResource);

Vue.http.interceptors.push(function(req, next) {
  req.headers.set("Authorization", this.token);
  next(res => {
    if (res.status === 403) {
      this.$alert.show({
        type: "warning",
        message: this.$t("SESSION_EXPIRED_ERROR"),
        interval: 5000
      });
      this.$router.push({ name: "login", params: { mode: "token_expired" } });
      return res;
    }
    if (res.status === 500) {
      this.$alert.show({
        type: "warning",
        message: this.$t("SERVER_ERROR"),
        interval: 5000
      });
      return res;
    }
    if (res.status === 0) {
      this.$alert.show({
        type: "warning",
        message: this.$t("NETWORK_ERROR"),
        interval: 5000
      });
      return res;
    }
    return res;
  });
});

/* eslint-disable no-new */
new Vue({
  el: "#app",
  i18n,
  store,
  router,
  components: { App },
  template: "<App/>"
});
