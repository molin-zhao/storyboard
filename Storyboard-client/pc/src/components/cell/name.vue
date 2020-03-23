<template>
  <div class="name-cell-wrapper">
    <div class="group-color" :style="`background-color: ${color}`" />
    <div class="name-cell">
      <editable-text
        :row="1"
        :value="computedValue"
        :editable="editable"
        :default-value="defaultValue"
        @input-change="inputChange"
      />
    </div>
  </div>
</template>

<script>
import editableText from "@/components/editableText";
import { mapState, mapMutations } from "vuex";
import { getTaskLog } from "@/common/utils/log";
export default {
  components: {
    editableText
  },
  props: {
    editable: {
      type: Boolean,
      default: true
    },
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
      type: String,
      required: true
    }
  },
  computed: {
    ...mapState("project", ["projects", "activeIndex", "logs"]),
    computedValue() {
      const {
        value,
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
      return logName ? logName : value;
    }
  },
  methods: {
    ...mapMutations({
      add_log: "project/add_log",
      remove_log: "project/remove_log"
    }),
    inputChange(val) {
      const {
        value,
        projects,
        activeIndex,
        phaseIndex,
        groupId,
        taskId
      } = this;
      let projectId = projects[activeIndex]._id;
      let phaseId = projects[activeIndex]["phases"][phaseIndex]._id;
      if (val === value) {
        this.remove_log({ projectId, phaseId, groupId, taskId, field: "name" });
      } else {
        this.add_log({
          projectId,
          phaseId,
          groupId,
          taskId,
          field: "name",
          value: val
        });
      }
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
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
}
</style>
