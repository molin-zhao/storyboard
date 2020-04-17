import taskDetail from "@/components/taskDetail.vue";
import store from "@/store";
import i18n from "@/i18n";

const TaskDetail = {
  install: function(Vue) {
    const TaskDetailInstance = Vue.extend(taskDetail);
    const initInstance = () => {
      // init vue instance
      currentTaskDetail = new TaskDetailInstance({ store, i18n });
      let taskEl = currentTaskDetail.$mount().$el;
      document.body.appendChild(taskEl);
    };
    // add to vue prototype for global use
    let currentTaskDetail = null;
    Vue.prototype.$task = {
      show(options) {
        if (!currentTaskDetail) initInstance();
        Object.assign(currentTaskDetail, options);
        return currentTaskDetail.show();
      }
    };
  }
};

export default TaskDetail;
