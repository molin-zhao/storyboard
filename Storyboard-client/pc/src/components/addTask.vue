<template>
  <div class="add-task-wrapper">
    <div
      v-for="(item, index) in titles"
      :key="index"
      class="row-item-wrapper"
      :style="computedStyle(item)"
    >
      <div class="row-item" v-show="isType(item, 'TITLE_NAME')">
        <div
          class="group-color"
          :style="`background-color: ${color}; opacity: ${focused ? 1 : 0.5}`"
        />
        <editableText
          ref="input"
          @on-focus="onFocus"
          @lost-focus="lostFocus"
          defaultValue="ADD_TASK"
          @on-typing="onInputChange"
          input-style="border-radius: 0px"
        />
      </div>
      <div class="row-item" v-show="isType(item, 'TITLE_STATUS') && focused">
        <status
          :phase-index="phaseIndex"
          :group-id="groupId"
          :status="taskStatus"
          :editable="true"
          @on-change="onStatusChange"
          :new-task="true"
        />
      </div>
      <div class="row-item" v-show="isType(item, 'TITLE_MEMBER') && focused">
        <member
          :member="taskMembers"
          :phase-index="phaseIndex"
          :group-id="groupId"
          @on-change="onMemberChange"
          :new-task="true"
        />
      </div>
      <div class="row-item" v-show="isType(item, 'TITLE_PRIORITY') && focused">
        <priority
          :phase-index="phaseIndex"
          :group-id="groupId"
          :priority="taskPriority"
          :editable="true"
          @on-change="onPriorityChange"
          :new-task="true"
        />
      </div>
      <div class="row-item" v-show="isType(item, 'TITLE_TIMELINE') && focused">
        <timeline
          :start-date="taskStartDate"
          :due-date="taskDueDate"
          :phase-index="phaseIndex"
          :group-id="groupId"
          :editable="true"
          @on-change="onTimelineChange(arguments)"
          :new-task="true"
        />
      </div>
      <div v-show="isType(item, 'TITLE_PROGRESS') && focused" class="row-item">
        <div class="add-button" @click.stop="stopPropagation">
          <a
            class="create-task-btn display-only"
            @click.stop="addTask"
            :style="computedButtonDisabledStyle"
          >
            <span
              v-if="taskCreating"
              class="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
            <span v-else> {{ $t("ADD") }} </span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import editableText from "@/components/editableText";
import status from "@/components/cell/status";
import member from "@/components/cell/member";
import priority from "@/components/cell/priority";
import timeline from "@/components/cell/timeline";
import { stopPropagation } from "@/common/utils/mouse";
import * as URL from "@/common/utils/url";
import { mapState, mapMutations } from "vuex";
export default {
  components: {
    editableText,
    status,
    member,
    priority,
    timeline
  },
  props: {
    editable: {
      type: Boolean,
      default: false
    },
    color: {
      type: String,
      default: "none"
    },
    titles: {
      type: Array,
      default: () => []
    },
    phaseIndex: {
      type: Number,
      required: true
    },
    groupId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      focused: false,
      taskName: "",
      taskPriority: "medium",
      taskStatus: "planned",
      taskMembers: [],
      taskStartDate: "",
      taskDueDate: "",
      taskCreating: false
    };
  },
  computed: {
    ...mapState("user", ["id", "token"]),
    computedButtonDisabled() {
      return this.taskName ? false : true;
    },
    computedButtonDisabledStyle() {
      return `opacity: ${this.taskName ? 1 : 0.7}; pointer-events: ${
        this.taskName ? "auto" : "none"
      }`;
    },
    isType() {
      return function(title, name) {
        return title.name === name;
      };
    },
    computedStyle() {
      return function(title) {
        const { focused } = this;
        if (title.name === "TITLE_NAME") {
          if (focused)
            return `width: calc(${title.init_w} + ${title.offset_w}px); border-right: 1px solid white;`;
          return "width: 100%";
        } else {
          if (focused)
            return `width: calc(${title.init_w} + ${title.offset_w}px); border-right: 1px solid white;`;
          return "width: 0px;";
        }
      };
    },
    computedTitles() {
      const { titles } = this;
      return titles.slice(1);
    }
  },
  methods: {
    stopPropagation,
    ...mapMutations({
      add_task: "project/add_task"
    }),
    onFocus() {
      if (!this.focused) this.focused = true;
    },
    lostFocus() {
      if (this.focused) this.focused = false;
    },
    onInputChange(val) {
      this.taskName = val;
    },
    onStatusChange(val) {
      this.taskStatus = val;
    },
    onPriorityChange(val) {
      this.taskPriority = val;
    },
    onMemberChange(val) {
      this.taskMembers = val;
    },
    onTimelineChange(args) {
      this.taskStartDate = args[0];
      this.taskDueDate = args[1];
    },
    init() {
      this.taskName = "";
      this.taskPriority = "medium";
      this.taskStatus = "planned";
      this.taskMembers = [];
      this.taskStartDate = "";
      this.taskDueDate = "";
      this.taskCreating = false;
      let inputEl = this.$refs["input"][0];
      if (inputEl) {
        inputEl.clear();
        inputEl.endEditing();
      }
    },
    async addTask() {
      try {
        const {
          id,
          groupId,
          taskName,
          taskStatus,
          taskMembers,
          taskPriority,
          taskStartDate,
          taskDueDate
        } = this;
        let url = URL.POST_CREATE_TASK();
        this.taskCreating = true;
        const resp = await this.$http.post(
          url,
          {
            groupId,
            user: id,
            name: taskName,
            status: taskStatus,
            members: taskMembers,
            priority: taskPriority,
            startDate: taskStartDate,
            dueDate: taskDueDate
          },
          { emulateJSON: true }
        );
        let task = resp.data.data;
        this.add_task({ groupId, task });
        return this.init();
      } catch (err) {
        console.log(err);
      } finally {
        this.taskCreating = false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.add-task-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  height: 100%;
}

.add-text {
  height: 100%;
}
.add-button {
  width: 100%;
  height: 100%;
  a {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: white;
    width: 100%;
    height: 100%;
    border-radius: 0;
    cursor: pointer;
  }
  a:active {
    -webkit-box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
    box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
  }
}

.create-task-btn {
  background-color: var(--main-color-blue);
}

.row-item-wrapper {
  height: 100%;
  .row-item {
    height: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
  }
}
</style>
