import mailbox from "@/components/mailbox.vue";
import store from "@/store";
import i18n from "@/i18n";

const Mailbox = {
  install: function(Vue) {
    const MailboxInstance = Vue.extend(mailbox);
    const initInstance = () => {
      // init vue instance
      currentMailbox = new MailboxInstance({ store, i18n });
      let mailboxEl = currentMailbox.$mount().$el;
      document.body.appendChild(mailboxEl);
    };
    // add to vue prototype for global use
    let currentMailbox = null;
    Vue.prototype.$mailbox = {
      show(options) {
        if (!currentMailbox) initInstance();
        Object.assign(currentMailbox, options);
        return currentMailbox.show();
      }
    };
  }
};

export default Mailbox;
