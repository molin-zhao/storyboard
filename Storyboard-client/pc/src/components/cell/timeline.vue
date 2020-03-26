<template>
  <div
    @mouseenter="mouseenter"
    @mouseleave="mouseleave"
    @click="mouseclick('timeline-popover', $event)"
    class="timeline-wrapper"
  >
    <wave-btn
      :class="`timeline-btn ${isHover ? 'timeline-wrapper-hover' : null}`"
      btn-style="width: 100%; height: 100%; color: white; font-size: 13px"
      btn-color="#000000e6"
      wave-color="#000000ff"
      :title="computedTitle"
    />
    <popover ref="timeline-popover" style="top: calc(100% + 10px);">
      <tooltip
        content-style="
        width: 300px; 
        height: 400px; 
        border-radius: 5px; 
        box-shadow: -5px 2px 5px lightgrey; 
        -webkit-box-shadow: -5px 2px 5px lightgrey;
        border: 1px solid whitesmoke;
        "
        arrow-placement="top"
        arrow-position="left: 50%; transform: translateX(-50%)"
        background-color="white"
        border-color="whitesmoke"
      >
        <div
          class="datepicker-header display-only"
          @click.stop="stopPropagation"
        >
          <a
            class="check-btn"
            @click.stop="mouseclick('timeline-popover', $event)"
          >
            <icon name="check" class="check-btn-icon" />
          </a>
          <span style="font-size: 18px">{{ $t("EDIT_DATE") }}</span>
          <a class="refresh-btn" @click.stop="clear">
            <icon name="refresh" class="refresh-btn-icon" />
          </a>
          <div
            style="
            width: 90%; 
            height: 1px; 
            background-color: gainsboro;
            position: absolute;
            bottom: 0;
            "
          ></div>
        </div>
        <div class="datepicker-body" @click.stop="stopPropagtion">
          <datepicker
            :init="projects[activeIndex].createdAt"
            :start="computedStart"
            :end="computedDue"
            :select-period="true"
            @select-timeline="selectTimeline(arguments)"
            @select-start="selectStart"
            @select-end="selectEnd"
          />
        </div>
      </tooltip>
    </popover>
  </div>
</template>

<script>
import waveBtn from "@/components/waveBtn";
import popover from "@/components/popover";
import tooltip from "@/components/tooltip";
import datepicker from "@/components/datepicker";
import { eventBus } from "@/common/utils/eventBus";
import { mouseclick, hide, stopPropagation } from "@/common/utils/mouse";
import { NOW_ISO, parseISODate } from "@/common/utils/date";
import { mapState, mapMutations } from "vuex";
import { getTaskLog } from "@/common/utils/log";
export default {
  components: {
    waveBtn,
    popover,
    tooltip,
    datepicker
  },
  data() {
    return {
      hover: false,
      selectedStartDate: "",
      selectedEndDate: "",
      month_name: [
        "JAN",
        "FEB",
        "MAR",
        "ARP",
        "MAY",
        "JUN",
        "JUL",
        "AUG",
        "SEP",
        "OCT",
        "NOV",
        "DEC"
      ]
    };
  },
  props: {
    index: {
      type: [Number, String],
      default: 0
    },
    startDate: {
      type: String,
      default: ""
    },
    dueDate: {
      type: String,
      default: ""
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
  mounted() {
    eventBus.$on("reset-visible-component", () => {
      this.hide(`timeline-popover`);
    });
  },
  methods: {
    mouseclick,
    hide,
    stopPropagation,
    ...mapMutations({
      add_log: "project/add_log",
      remove_log: "project/remove_log"
    }),
    mouseenter() {
      if (!this.hover) this.hover = true;
    },
    mouseleave() {
      if (this.hover) this.hover = false;
    },
    selectTimeline(args) {
      this.selectedStartDate = args[0];
      this.selectedEndDate = args[1];
      this.confirm();
    },
    selectStart(iso) {
      this.selectedStartDate = iso;
      this.confirm();
    },
    selectEnd(iso) {
      this.selectedEndDate = iso;
      this.confirm();
    },
    clear() {
      this.selectedStartDate = null;
      this.selectedEndDate = null;
      this.confirm();
    },
    cancel() {
      console.log("cancel");
    },
    confirm() {
      const {
        startDate,
        dueDate,
        projects,
        activeIndex,
        groupId,
        taskId,
        phaseIndex,
        selectedStartDate,
        selectedEndDate,
        newTask
      } = this;
      let projectId = projects[activeIndex]._id;
      let phaseId = projects[activeIndex]["phases"][phaseIndex]._id;
      let modifiedSelectedStartDate =
        selectedStartDate === null ? "" : selectedStartDate;
      let modifiedSelectedEndDate =
        selectedEndDate === null ? "" : selectedEndDate;
      if (newTask)
        return this.$emit(
          "on-change",
          modifiedSelectedStartDate,
          modifiedSelectedEndDate
        );
      if (startDate !== modifiedSelectedStartDate) {
        this.add_log({
          projectId,
          phaseId,
          groupId,
          taskId,
          field: "start_date",
          value: selectedStartDate
        });
      } else {
        this.remove_log({
          projectId,
          phaseId,
          groupId,
          taskId,
          field: "start_date"
        });
      }
      if (dueDate !== modifiedSelectedEndDate) {
        this.add_log({
          projectId,
          phaseId,
          groupId,
          taskId,
          field: "due_date",
          value: selectedEndDate
        });
      } else {
        this.remove_log({
          projectId,
          phaseId,
          groupId,
          taskId,
          field: "due_date"
        });
      }
    }
  },
  computed: {
    ...mapState("project", ["projects", "activeIndex", "logs"]),
    isHover() {
      const popover = this.$refs["timeline-popover"];
      if (this.hover || (popover && popover.visible)) {
        return true;
      }
      return false;
    },
    computedTitle() {
      const {
        startDate,
        dueDate,
        month_name,
        projects,
        activeIndex,
        phaseIndex,
        groupId,
        taskId,
        logs,
        selectedStartDate,
        selectedEndDate
      } = this;
      let startTimeStr = this.$t("TITLE_INITDATE");
      let endTimeStr = this.$t("TITLE_DUEDATE");
      let cprojId = projects[activeIndex]._id;
      let cphaseId = projects[activeIndex]["phases"][phaseIndex]._id;
      let logStart = getTaskLog(
        logs,
        cprojId,
        cphaseId,
        groupId,
        taskId,
        "start_date"
      );
      let logEnd = getTaskLog(
        logs,
        cprojId,
        cphaseId,
        groupId,
        taskId,
        "due_date"
      );
      let startSource =
        selectedStartDate === null
          ? ""
          : selectedStartDate || logStart || startDate;
      let endSource =
        selectedEndDate === null ? "" : selectedEndDate || logEnd || dueDate;
      if (startSource) {
        let start = parseISODate(startSource);
        let startMonthIndex = start.getMonth();
        let beginDate = start.getDate();
        startTimeStr = `${this.$t(month_name[startMonthIndex])} ${beginDate}`;
      }
      if (endSource) {
        let end = parseISODate(endSource);
        let endMonthIndex = end.getMonth();
        let endDate = end.getDate();
        endTimeStr = `${this.$t(month_name[endMonthIndex])} ${endDate}`;
      }
      return `${startTimeStr} - ${endTimeStr}`;
    },
    computedStart() {
      const {
        projects,
        selectedStartDate,
        activeIndex,
        logs,
        phaseIndex,
        groupId,
        taskId,
        startDate,
        dueDate
      } = this;
      if (selectedStartDate === null) return "";
      if (selectedStartDate) return selectedStartDate;
      let cprojId = projects[activeIndex]._id;
      let cphaseId = projects[activeIndex]["phases"][phaseIndex]._id;
      let logStart = getTaskLog(
        logs,
        cprojId,
        cphaseId,
        groupId,
        taskId,
        "start_date"
      );
      return logStart ? logStart : startDate;
    },
    computedDue() {
      const {
        projects,
        selectedEndDate,
        activeIndex,
        logs,
        phaseIndex,
        groupId,
        taskId,
        startDate,
        dueDate
      } = this;
      if (selectedEndDate === null) return "";
      if (selectedEndDate) return selectedEndDate;
      let cprojId = projects[activeIndex]._id;
      let cphaseId = projects[activeIndex]["phases"][phaseIndex]._id;
      let logDue = getTaskLog(
        logs,
        cprojId,
        cphaseId,
        groupId,
        taskId,
        "due_date"
      );
      return logDue ? logDue : dueDate;
    }
  }
};
</script>

<style lang="scss" scoped>
.timeline-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: whitesmoke;
  position: relative;
}
.timeline-wrapper-hover {
  -webkit-transform: translateY(-3px);
  -ms-transform: translateY(-3px);
  transform: translateY(-3px);
  -webkit-box-shadow: -5px 2px 5px lightgrey;
  box-shadow: -5px 2px 5px lightgrey;
  -webkit-transition: all 0.3s ease-out;
  transition: all 0.3s ease-out;
  border-radius: 2px;
}
.timeline-btn {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
.datepicker-header {
  height: 20%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
}
.datepicker-body {
  height: 80%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.datepicker-footer {
  height: 15%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  .footer-btns {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
  }
}

.refresh-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: 20px;
  width: 30px;
  height: 30px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}
.refresh-btn:active,
.check-btn:active {
  -webkit-box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
  box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
}
.check-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 20px;
  width: 30px;
  height: 30px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}
.check-btn-icon {
  width: 20px;
  height: 20px;
  color: var(--main-color-success);
}

.refresh-btn-icon {
  width: 20px;
  height: 20px;
  color: black;
}
</style>
