<template>
  <div class="priority-wrapper" @click="mouseclick('priority', $event)">
    <wave-btn
      class="priority-btn"
      :btn-color="`${computedColor(computedPriority)}e6`"
      :wave-color="`${computedColor(computedPriority)}ff`"
      :title="$t(computedTitle(computedPriority))"
      btn-style="width: 100%; height: 100%; color: white;"
    />
    <popover ref="priority" style="top: calc(100% + 10px);">
      <tooltip
        content-style="
        width: 150px; 
        height: 120px; 
        border-radius: 5px; 
        box-shadow: -5px 2px 5px gainsboro; 
        -webkit-box-shadow: -5px 2px 5px gainsboro;
        border: 1px solid whitesmoke;
        "
        arrow-placement="top"
        arrow-position="left: 50%; transform: translateX(-50%)"
        background-color="white"
        border-color="whitesmoke"
      >
        <div class="priority-options">
          <div
            class="priority-option"
            v-for="item in options"
            :key="item"
            :style="computedOptionStyle(item)"
            @click="selectPriority(item)"
          >
            <wave-btn
              class="option-btn"
              btn-style="color: white;"
              :btn-color="`${computedColor(item)}e6`"
              :wave-color="`${computedColor(item)}ff`"
              :title="$t(computedTitle(item))"
            />
          </div>
        </div>
      </tooltip>
    </popover>
  </div>
</template>

<script>
import waveBtn from "@/components/waveBtn";
import popover from "@/components/popover";
import tooltip from "@/components/tooltip";
import { mapMutations, mapState } from "vuex";
import { mouseclick, hide } from "@/common/utils/mouse";
import { getTaskLog } from "@/common/utils/log";
import { eventBus } from "@/common/utils/eventBus";
export default {
  components: {
    waveBtn,
    popover,
    tooltip
  },
  props: {
    priority: {
      type: String,
      default: ""
    },
    editable: {
      type: Boolean,
      default: true
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
    },
    newTask: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      options: ["low", "medium", "high"]
    };
  },
  computed: {
    ...mapState("project", ["projects", "activeIndex", "logs"]),
    computedPriority() {
      const {
        projects,
        activeIndex,
        phaseIndex,
        logs,
        groupId,
        taskId,
        priority
      } = this;
      let cproId = projects[activeIndex]._id;
      let cphaId = projects[activeIndex]["phases"][phaseIndex]._id;
      let logPrioriy = getTaskLog(
        logs,
        cproId,
        cphaId,
        groupId,
        taskId,
        "priority"
      );
      return logPrioriy ? logPrioriy : priority;
    },
    computedColor() {
      return function(priority) {
        switch (priority) {
          case "medium":
            return "#6495ed";
            break;
          case "low":
            return "#d3d3d3";
            break;
          case "high":
            return "#ff6347";
            break;
          default:
            return "#000000";
            break;
        }
      };
    },
    computedTitle() {
      return function(priority) {
        switch (priority) {
          case "medium":
            return "PRIORITY_MEDIUM";
            break;
          case "low":
            return "PRIORITY_LOW";
            break;
          case "high":
            return "PRIORITY_HIGH";
            break;
          default:
            return "";
            break;
        }
      };
    },
    computedOptionStyle() {
      return function(priority) {
        if (this.computedPriority === priority)
          return "border: 2px LightSalmon solid";
        return "";
      };
    }
  },
  methods: {
    mouseclick,
    hide,
    ...mapMutations({
      add_log: "project/add_log",
      remove_log: "project/remove_log"
    }),
    selectPriority(item) {
      const {
        priority,
        projects,
        activeIndex,
        phaseIndex,
        groupId,
        taskId,
        newTask
      } = this;
      if (this.computedPriority === item) return;
      if (newTask) return this.$emit("on-change", item);
      let projectId = projects[activeIndex]._id;
      let phaseId = projects[activeIndex]["phases"][phaseIndex]._id;
      if (priority === item)
        return this.remove_log({
          projectId,
          phaseId,
          groupId,
          taskId,
          field: "priority"
        });
      return this.add_log({
        projectId,
        phaseId,
        groupId,
        taskId,
        field: "priority",
        value: item
      });
    }
  },
  mounted() {
    eventBus.$on("reset-visible-component", () => {
      this.hide("priority");
    });
  }
};
</script>

<style lang="scss" scoped>
.priority-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
}
.priority-btn {
  width: 100%;
  height: 100%;
}

.priority-options {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 5px;
  .priority-option {
    width: 100%;
    height: 38px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    .option-btn {
      width: 100%;
      height: 90%;
    }
  }
}
</style>
