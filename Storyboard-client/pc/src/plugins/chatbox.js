import chatbox from "@/components/chatbox.vue";
import store from "@/store";
import i18n from "@/i18n";

const Chatbox = {
  install: function(Vue) {
    const ChatboxInstance = Vue.extend(chatbox);
    const initInstance = () => {
      // init vue instance
      currentChatbox = new ChatboxInstance({ store, i18n });
      let chatboxEl = currentChatbox.$mount().$el;
      document.body.appendChild(chatboxEl);
    };
    // add to vue prototype for global use
    let currentChatbox = null;
    Vue.prototype.$chatbox = {
      show(options) {
        if (!currentChatbox) initInstance();
        Object.assign(currentChatbox, options);
        return currentChatbox.show();
      }
    };
  }
};

export default Chatbox;
