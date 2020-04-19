<template>
  <transition name="fade">
    <div v-show="visible" class="task-detail" @click="hide($event)">
      <div class="task-detail-background">
        <transition name="sidebar">
          <div
            v-show="visible"
            class="task-detail-wrapper shadow display-only"
            ref="task-detail"
          >
            <div class="task-detail-header">
              <icon
                name="close"
                class="close"
                @click.native.stop="hide"
                style="color: black"
              />
            </div>
            <div class="task-detail-body">
              <editable-text
                style="width: 100%; height: 80px"
                default-value="ADD_TASK_NAME"
                :value="computedValue"
                input-style="font-size: 18px; line-height: 18px"
                :row="3"
                @input-change="inputChange"
                :editable="editable"
              />
            </div>
          </div>
        </transition>
      </div>
    </div>
  </transition>
</template>

<script>
import editableText from "@/components/editableText";
import { mapState, mapMutations } from "vuex";
import { getTaskLog } from "@/common/utils/log";
import { stopPropagation } from "@/common/utils/mouse";
export default {
  components: {
    editableText
  },
  props: {
    task: {
      type: Object
    },
    groupId: {
      type: String
    },
    phaseIndex: {
      type: Number
    },
    editable: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      visible: false
    };
  },
  computed: {
    ...mapState("project", ["projects", "activeIndex", "logs"]),
    ...mapState("user", ["id"]),
    computedValue() {
      const { task, projects, activeIndex, logs, phaseIndex, groupId } = this;
      if (!task) return "";
      let value = task["name"];
      let taskId = task["_id"];
      let cprojId = projects[activeIndex]["_id"];
      let cphaseId = projects[activeIndex]["phases"][phaseIndex]["_id"];
      let logName = getTaskLog(
        logs,
        cprojId,
        cphaseId,
        groupId,
        taskId,
        "name"
      );
      return logName ? logName : value;
    }
  },
  methods: {
    ...mapMutations({
      add_log: "project/add_log",
      remove_log: "project/remove_log"
    }),
    stopPropagation,
    show() {
      if (!this.visible) {
        this.visible = true;
      }
    },
    hide(e) {
      let taskEl = this.$refs["task-detail"];
      if (taskEl && !taskEl.contains(e.target)) {
        if (this.visible) {
          this.visible = false;
        }
      }
    },
    inputChange(val) {
      const { value, task, projects, activeIndex, phaseIndex, groupId } = this;
      let projectId = projects[activeIndex]["_id"];
      let phaseId = projects[activeIndex]["phases"][phaseIndex]["_id"];
      let taskId = task["_id"];
      if (val === value) {
        this.remove_log({ projectId, phaseId, groupId, taskId, field: "name" });
      } else {
        this.add_log({
          projectId,
          phaseId,
          groupId,
          taskId,
          field: "name",
          value: val.trim()
        });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../common/theme/container.css";
.task-detail {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10040 !important;
  background-color: #0000001a;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  font-family: sans-serif;
}
.task-detail-background {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  height: 100%;
  position: relative;
}
.task-detail-wrapper {
  position: absolute;
  width: 400px;
  height: 100%;
  background-color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.task-detail-body {
  width: 100%;
  height: calc(100% - 30px);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding: 0px 10px 5px 10px;
}
.task-detail-header {
  width: 100%;
  height: 30px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  position: relative;
  padding: 0px 5px 0px 5px;
}
.close {
  position: absolute;
  right: 5px;
  width: 20px;
  height: 20px;
  cursor: pointer;
  color: black;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
.fade-leave,
.fade-enter-to {
  opacity: 1;
}
.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s;
}

.sidebar-enter,
.sidebar-leave-to {
  opacity: 0;
  right: -400px;
}
.sidebar-leave,
.sidebar-enter-to {
  opacity: 1;
  right: 0px;
}
.sidebar-enter-active,
.sidebar-leave-active {
  transition: all 0.35s;
}
</style>
