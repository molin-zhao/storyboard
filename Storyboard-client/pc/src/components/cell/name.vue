<template>
  <div class="name-cell-wrapper">
    <div class="group-color" :style="`background-color: ${color}`" />
    <div class="name-cell display-only">
      <span>{{ computedValue }}</span>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import { getTaskLog } from "@/common/utils/log";
export default {
  props: {
    value: {
      type: String,
      default: ""
    },
    defaultValue: {
      type: String,
      default: ""
    },
    color: {
      type: String,
      default: "gainsboro"
    },
    groupId: {
      type: String,
      required: true
    },
    phaseIndex: {
      type: Number,
      required: true
    },
    taskId: {
      type: String
    }
  },
  computed: {
    ...mapState("project", ["projects", "activeIndex", "logs"]),
    computedValue() {
      const {
        value,
        defaultValue,
        projects,
        activeIndex,
        logs,
        phaseIndex,
        groupId,
        taskId
      } = this;
      let cprojId = projects[activeIndex]._id;
      let cphaseId = projects[activeIndex]["phases"][phaseIndex]._id;
      let logName = getTaskLog(
        logs,
        cprojId,
        cphaseId,
        groupId,
        taskId,
        "name"
      );
      let taskName = value ? value : defaultValue;
      return logName ? logName : taskName;
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../../common/theme/container.css";
.name-cell-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  background-color: whitesmoke;
  .name-cell {
    height: 100%;
    width: calc(100% - 4px);
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    span {
      width: 100%;
      overflow: hidden;
      text-align: left;
      text-overflow: ellipsis;
      white-space: nowrap;
      cursor: pointer;
    }
  }
}
</style>
