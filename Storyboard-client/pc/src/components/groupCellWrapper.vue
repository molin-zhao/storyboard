<template>
  <div class="group-cell-wrapper">
    <a
      v-show="showDeleteBtn"
      class="delete-task"
      :style="computedDeleteTaskStyle"
    >
      <span
        v-if="taskDeleting"
        class="spinner-border spinner-border-sm text-danger"
        role="status"
        aria-hidden="true"
      ></span>
      <icon
        v-else
        name="delete"
        class="delete-task-icon"
        @click.native.stop="deleteTask(task._id)"
      />
    </a>
    <group-cell
      v-for="title in titles"
      :key="title.name"
      :title="title"
      :task="task"
      :color="color"
      :phase-index="phaseIndex"
      :group-id="groupId"
      style="border-right: 1px solid white;"
      :editable="editable"
    />
  </div>
</template>

<script>
import groupCell from "@/components/groupCell";
import * as URL from "@/common/utils/url";
import { mapState, mapMutations } from "vuex";
export default {
  components: {
    groupCell
  },
  props: {
    titles: {
      type: Array,
      default: () => []
    },
    task: {
      type: Object,
      default: () => ({})
    },
    color: {
      type: String,
      default: "gainsboro"
    },
    phaseIndex: {
      type: Number,
      default: 0
    },
    groupId: {
      type: String,
      default: ""
    },
    editable: {
      type: Boolean,
      default: false
    },
    showDeleteBtn: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      taskDeleting: false
    };
  },
  computed: {
    ...mapState("user", ["id", "token"]),
    computedDeleteTaskStyle() {
      const { taskDeleting } = this;
      return `pointer-events: ${taskDeleting ? "none" : "auto"}`;
    }
  },
  methods: {
    ...mapMutations({
      delete_task: "project/delete_task"
    }),
    deleteTask(taskId) {
      this.$confirm.show({
        title: this.$t("DELETE_TASK_TITLE"),
        message: this.$t("DELETE_TASK_MESSAGE"),
        success: async () => {
          try {
            const { groupId } = this;
            let url = URL.DELETE_TASK(groupId, taskId);
            this.taskDeleting = true;
            const resp = await this.$http.delete(url);
            if (resp.data.data === "ok") {
              this.delete_task({ groupId, taskId });
            } else {
              this.$alert.show({
                type: "warning",
                message: this.$t("DELETE_TASK_ERROR"),
                interval: 5000
              });
            }
          } catch (err) {
            this.$alert.show({
              type: "warning",
              message: this.$t("DELETE_TASK_ERROR"),
              interval: 5000
            });
          } finally {
            this.taskDeleting = false;
          }
        },
        confirmLabel: this.$t("CONFIRM"),
        cancelLabel: this.$t("CANCEL")
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.group-cell-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: nowrap;
  position: relative;
}
</style>
