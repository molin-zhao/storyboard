import toast from "@/components/toast.vue";
import store from "@/store";
import i18n from "@/i18n";

const Toast = {
  install: function(Vue) {
    const ToastInstance = Vue.extend(toast);
    const initInstance = () => {
      // init vue instance
      currentToast = new ToastInstance({ store, i18n });
      let ToastEl = currentToast.$mount().$el;
      document.body.appendChild(ToastEl);
    };
    // add to vue prototype for global use
    let currentToast = null;
    Vue.prototype.$toast = {
      show(options) {
        if (!currentToast) initInstance();
        Object.assign(currentToast, options);
        return currentToast.show();
      }
    };
  }
};

export default Toast;
