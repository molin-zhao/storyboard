<template>
  <div class="status-wrapper" @click="mouseclick('status-popover', $event)">
    <wave-btn
      class="status-btn"
      btn-style="width: 100%; height: 100%; color: white;"
      :btn-color="`${computedColor(computedStatus)}e6`"
      :wave-color="`${computedColor(computedStatus)}ff`"
      :title="$t(computedTitle(computedStatus))"
    />
    <popover ref="status-popover" style="top: calc(100% + 10px)">
      <tooltip
        contentStyle="
          width: 150px; height: 200px; 
          border-radius: 5px; 
          box-shadow: -5px 2px 5px gainsboro; 
          -webkit-box-shadow: -5px 2px 5px gainsboro;
          border: 1px solid whitesmoke;
          "
        arrow-placement="top"
        background-color="white"
        arrow-position="left: 50%; transform: translateX(-50%)"
        border-color="whitesmoke"
      >
        <div class="status-options">
          <div
            class="status-option"
            v-for="item in options"
            :key="item"
            :style="computedOptionStyle(item)"
            @click="selectStatus(item)"
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
import { mouseclick, hide } from "@/common/utils/mouse";
import { eventBus } from "@/common/utils/eventBus";
import { mapState, mapMutations } from "vuex";
import { getTaskLog } from "@/common/utils/log";
export default {
  components: {
    waveBtn,
    popover,
    tooltip
  },
  props: {
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
    status: {
      type: String,
      default: "planned"
    },
    newTask: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      selectedStatus: "",
      options: ["planned", "working", "stuck", "defer", "done"]
    };
  },
  computed: {
    ...mapState("project", ["projects", "activeIndex", "logs"]),
    computedStatus() {
      const {
        logs,
        taskId,
        status,
        projects,
        activeIndex,
        phaseIndex,
        groupId
      } = this;
      let projectId = projects[activeIndex]["_id"];
      let phaseId = projects[activeIndex]["phases"][phaseIndex]["_id"];
      let logStatus = getTaskLog(
        logs,
        projectId,
        phaseId,
        groupId,
        taskId,
        "status"
      );
      return logStatus ? logStatus : status;
    },
    computedColor() {
      return function(status) {
        switch (status) {
          case "working":
            return "#6495ed";
            break;
          case "planned":
            return "#d3d3d3";
            break;
          case "stuck":
            return "#f0ad4e";
            break;
          case "done":
            return "#5cb85c";
            break;
          case "defer":
            return "#d9534f";
            break;
          default:
            return "#000000";
            break;
        }
      };
    },
    computedTitle() {
      return function(status) {
        switch (status) {
          case "working":
            return "STATUS_WORKING";
            break;
          case "planned":
            return "STATUS_PLANNED";
            break;
          case "stuck":
            return "STATUS_STUCK";
            break;
          case "done":
            return "STATUS_DONE";
            break;
          case "defer":
            return "STATUS_DEFER";
            break;
          default:
            return "";
            break;
        }
      };
    },
    computedOptionStyle() {
      return function(status) {
        if (this.computedStatus === status)
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
    selectStatus(item) {
      const {
        status,
        projects,
        activeIndex,
        phaseIndex,
        groupId,
        taskId,
        newTask
      } = this;
      if (this.computedStatus === item) return;
      if (newTask) return this.$emit("on-change", item);
      let projectId = projects[activeIndex]["_id"];
      let phaseId = projects[activeIndex]["phases"][phaseIndex]["_id"];
      if (status === item)
        return this.remove_log({
          projectId,
          phaseId,
          groupId,
          taskId,
          field: "status"
        });
      return this.add_log({
        projectId,
        phaseId,
        groupId,
        taskId,
        field: "status",
        value: item
      });
    }
  },
  mounted() {
    eventBus.$on("reset-visible-component", () => {
      this.hide(`status-popover`);
    });
  }
};
</script>

<style lang="scss" scoped>
.status-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
}
.status-btn {
  width: 100%;
  height: 100%;
}

.status-options {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 5px;
  width: 100%;
  height: 100%;
  .status-option {
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
