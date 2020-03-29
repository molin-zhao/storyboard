import chat from "@/components/chat.vue";
import store from "@/store";

let _i18n = null;
export function RewriteLocale(i18n) {
  _i18n = i18n;
}

const Chat = {
  install: function(Vue) {
    const ChatInstance = Vue.extend(chat);
    const initInstance = () => {
      // init vue instance
      currentChat = new ChatInstance({ store });
      let chatEl = currentChat.$mount().$el;
      document.body.appendChild(chatEl);
    };
    // add to vue prototype for global use
    let currentChat = null;
    Vue.prototype._i18n = _i18n;
    Vue.prototype.$chat = {
      show(options) {
        if (!currentChat) initInstance();
        Object.assign(currentChat, options);
        return currentChat.show();
      }
    };
  }
};

export default Chat;
