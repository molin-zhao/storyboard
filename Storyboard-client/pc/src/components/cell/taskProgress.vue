<template>
  <div class="progress-wrapper display-only" :style="computedColor">
    {{ computedProgress }}
  </div>
</template>

<script>
import {
  getTimestampFromISODate,
  getTimestampFromDate,
  displayTimeFromTimestamp
} from "@/common/utils/date";
import { getTaskLog } from "@/common/utils/log";
import { mapState } from "vuex";
export default {
  data() {
    return {
      backgroundColor: "whitesmoke",
      color: "black",
      label: ""
    };
  },
  props: {
    startDate: {
      type: String,
      default: ""
    },
    dueDate: {
      type: String,
      default: ""
    },
    status: {
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
      type: String,
      required: true
    }
  },
  computed: {
    ...mapState("project", ["projects", "activeIndex", "logs"]),
    computedStartDate() {
      const {
        startDate,
        projects,
        activeIndex,
        phaseIndex,
        taskId,
        logs,
        groupId
      } = this;
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
    computedEndDate() {
      const {
        dueDate,
        projects,
        activeIndex,
        phaseIndex,
        taskId,
        logs,
        groupId
      } = this;
      let cprojId = projects[activeIndex]._id;
      let cphaseId = projects[activeIndex]["phases"][phaseIndex]._id;
      let logEnd = getTaskLog(
        logs,
        cprojId,
        cphaseId,
        groupId,
        taskId,
        "due_date"
      );
      return logEnd ? logEnd : dueDate;
    },
    computedStatus() {
      const {
        projects,
        activeIndex,
        phaseIndex,
        logs,
        groupId,
        taskId,
        status
      } = this;
      let cproId = projects[activeIndex]._id;
      let cphaId = projects[activeIndex]["phases"][phaseIndex]._id;
      let logStatus = getTaskLog(
        logs,
        cproId,
        cphaId,
        groupId,
        taskId,
        "status"
      );
      return logStatus ? logStatus : status;
    },
    computedProgress() {
      const { computedStartDate, computedEndDate, status } = this;
      if (!computedStartDate) return this.$t("PROGRESS_UNTRACKED");
      if (status === "done") return this.$t("PROGRESS_DONE");

      /**
       * compute progress by startDate and dueDate
       */
      let startTimestamp = getTimestampFromISODate(computedStartDate);
      let dueTimestamp = getTimestampFromISODate(computedEndDate);
      let nowTimestamp = getTimestampFromDate(new Date());
      /**
       * compute abs(now - start) and abs(end - now)
       * show the result of the smaller one
       */
      let timestampToStart = nowTimestamp - startTimestamp;
      let timestampToDue = nowTimestamp - dueTimestamp;
      if (isNaN(timestampToDue)) {
        // only have timestampToStart
        if (timestampToStart < 0) {
          // before task start
          this.label = "before";
          const { number, unit } = displayTimeFromTimestamp(-timestampToStart);
          return this.$t("PROGRESS_BEFORE", {
            progress: this.$t(unit, { number })
          });
        } else {
          // task is undergoing
          this.label = "undergoing";
          const { number, unit } = displayTimeFromTimestamp(timestampToStart);
          return this.$t("PROGRESS_UNDERGOING", {
            progress: this.$t(unit, { number })
          });
        }
      } else {
        if (timestampToStart < 0) {
          // before task start
          this.label = "before";
          const { number, unit } = displayTimeFromTimestamp(-timestampToStart);
          return this.$t("PROGRESS_BEFORE", {
            progress: this.$t(unit, { number })
          });
        } else if (timestampToStart >= 0 && timestampToDue <= 0) {
          // task is undergoing
          if (timestampToStart <= 0.8 * (dueTimestamp - startTimestamp)) {
            // undergoing
            this.label = "undergoing";
            const { number, unit } = displayTimeFromTimestamp(timestampToStart);
            return this.$t("PROGRESS_UNDERGOING", {
              progress: this.$t(unit, { number })
            });
          } else {
            this.label = "due";
            const { number, unit } = displayTimeFromTimestamp(-timestampToDue);
            return this.$t("PROGRESS_DUE", {
              progress: this.$t(unit, { number })
            });
          }
        } else {
          // task is defered
          this.label = "defer";
          const { number, unit } = displayTimeFromTimestamp(timestampToDue);
          return this.$t("PROGRESS_DEFER", {
            progress: this.$t(unit, { number })
          });
        }
      }
    },
    computedColor() {
      const { computedStatus, label } = this;
      if (computedStatus === "done")
        return "background-color: #5cb85c; color: white";
      switch (label) {
        case "before":
          return "background-color: whitesmoke; color: black";
        case "undergoing":
          return "background-color: gainsboro; color: black";
        case "due":
          return "background-color: #f0ad4e; color: white";
        case "defer":
          return "background-color: #d9534f; color: white";
        default:
          return "background-color: whitesmoke; color: grey";
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.progress-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}
</style>
