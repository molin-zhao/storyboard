<template>
  <div class="row-item-wrapper" :style="computedStyle">
    <div class="row-item" v-if="isType('TITLE_NAME')">
      <name
        :phase-index="phaseIndex"
        :group-id="groupId"
        :editable="true"
        :value="task.name"
        :task-id="task._id"
        :default-value="$t('ADD_TASK_NAME')"
        :color="color"
        @name-change="taskNameChange"
      />
    </div>
    <div class="row-item" v-else-if="isType('TITLE_STATUS')">
      <status
        :phase-index="phaseIndex"
        :group-id="groupId"
        :status="task.status"
        :task-id="task._id"
        :editable="true"
      />
    </div>
    <div class="row-item" v-else-if="isType('TITLE_MEMBER')">
      <member :member="task.members" />
    </div>
    <div class="row-item" v-else-if="isType('TITLE_PRIORITY')">
      <priority
        :phase-index="phaseIndex"
        :group-id="groupId"
        :priority="task.priority"
        :editable="true"
        :task-id="task._id"
      />
    </div>
    <div class="row-item" v-else-if="isType('TITLE_TIMELINE')">
      <timeline
        :start-date="task.start_date"
        :due-date="task.due_date"
        :phase-index="phaseIndex"
        :group-id="groupId"
        :editable="true"
        :task-id="task._id"
      />
    </div>
    <div class="row-item" v-else-if="isType('TITLE_PROGRESS')">
      <task-progress
        :phase-index="phaseIndex"
        :group-id="groupId"
        :status="task.status"
        :start-date="task.start_date"
        :due-date="task.due_date"
        :task-id="task._id"
        :editable="true"
      />
    </div>
    <div v-else></div>
  </div>
</template>

<script>
import name from "@/components/cell/name";
import member from "@/components/cell/member";
import priority from "@/components/cell/priority";
import status from "@/components/cell/status";
import timeline from "@/components/cell/timeline";
import taskProgress from "@/components/cell/taskProgress";
export default {
  components: {
    name,
    member,
    priority,
    status,
    timeline,
    taskProgress
  },
  props: {
    title: {
      type: Object,
      required: true
    },
    task: {
      type: Object,
      required: true
    },
    color: {
      type: String,
      default: "gainsboro"
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
  computed: {
    isType() {
      return function(name) {
        return this.title.name === name;
      };
    },
    computedStyle() {
      return `width: calc(${this.title.init_w} + ${this.title.offset_w}px); ${this.style};`;
    }
  },
  methods: {
    taskNameChange(val) {
      console.log(val);
    }
  }
};
</script>

<style lang="scss" scoped>
.row-item-wrapper {
  height: 100%;
  .row-item {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .row-item-name {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
  }
}
</style>
