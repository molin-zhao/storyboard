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
import Chatbox from "@/plugins/chatbox";
import Mailbox from "@/plugins/mailbox";

import store from "@/store";
import router from "@/router";
import i18n from "@/i18n";

Vue.config.productionTip = false;
Vue.use(Alert);
Vue.use(Toast);
Vue.use(Confirm);
Vue.use(Chatbox);
Vue.use(Mailbox);
Vue.use(VueResource);

Vue.http.interceptors.push(function(req, next) {
  if (this && this.token) req.headers.set("Authorization", this.token);
  next(res => {
    /**
     * 401 unauthroized -> header token invalid
     * 403 forbidden
     * 406 not acceptable
     * 400 bad request -> params not provided or params error
     * 200 ok
     * 201 reset token
     * 500 internal server error
     * 0 network error
     */

    if (res.status === 401) {
      if (this && this.$alert) {
        this.$alert.show({
          type: "warning",
          message: this.$t("SESSION_EXPIRED_ERROR"),
          interval: 5000
        });
      }
      // this.$router.push({ name: "login", params: { mode: "token_expired" } });
    }
    if (res.status === 500) {
      if (this && this.$alert) {
        this.$alert.show({
          type: "warning",
          message: this.$t("SERVER_ERROR"),
          interval: 5000
        });
      }
    }
    if (res.status === 0) {
      if (this && this.$alert) {
        this.$alert.show({
          type: "warning",
          message: this.$t("NETWORK_ERROR"),
          interval: 5000
        });
      }
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
