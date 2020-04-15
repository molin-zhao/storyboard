<template>
  <div
    class="member-wrapper"
    @mouseenter="mouseenter"
    @mouseleave="mouseleave"
    @click="mouseclick('member-popover', $event)"
    @mousewheel.stop="onMouseWheel"
  >
    <div
      :class="
        `member-wrapper-container ${isHover ? 'member-wrapper-hover' : null}`
      "
    >
      <avatar v-if="members.length === 0" class="member-avatar" src="" />
      <img
        v-else
        v-for="(member, index) in computedMember"
        :key="member.id"
        :src="member.avatar"
        class="member-avatar"
        :style="computedStyle(index)"
      />
    </div>
    <popover ref="member-popover" style="top: calc(100% + 10px); z-index: 10">
      <tooltip
        content-style="
        width: 250px; 
        height: 300px; 
        border-radius: 5px; 
        box-shadow: -2px 1px 2px whitesmoke; 
        -webkit-box-shadow: -2px 1px 2px whitesmoke;
        border: 1px solid whitesmoke;
        "
        arrow-placement="top"
        arrow-position="left: 50%; transform: translateX(-50%)"
        background-color="white"
        border-color="whitesmoke"
      >
        <div class="member-detail">
          <div class="member-detail-header">
            <span class="display-only">{{ $t("TASK_MEMBERS") }}</span>
          </div>
          <div class="member-detail-body">
            <div class="member-empty" v-if="members.length === 0">
              <span style="font-size: 20px">{{
                $t("NO_TASK_MEMBER_ALLOC")
              }}</span>
            </div>
            <vue-scroll v-else :ops="ops">
              <div
                style="width: 100%; height: 60px"
                v-for="item in members"
                :key="item._id"
              >
                <user-status-contact-cell :item="item" />
              </div>
            </vue-scroll>
          </div>
          <div class="member-detail-footer">
            <a @click="showEditTaskMember" class="text-primary">{{
              $t("EDIT_TASK_MEMBER")
            }}</a>
          </div>
        </div>
      </tooltip>
    </popover>
    <modal ref="edit-task-members">
      <h5 class="modal-title display-only" slot="modal-header">
        {{ $t("ASSIGN_TASK") }}
      </h5>
      <div slot="modal-body" class="modal-body">
        <form style="wrapper">
          <div class="form-group form-left-centered">
            <label>{{ $t("TASK_MEMBERS") }}{{ computedMemberCount }}</label>
            <div v-if="computedProjectMembers.length > 0" class="member-source">
              <vue-scroll :ops="ops">
                <div
                  style="width: 100%; height: 60px"
                  v-for="item in computedProjectMembers"
                  :key="item._id"
                >
                  <user-select-unselect-cell
                    :item="item"
                    :exclude-list="computedTaskMemberIds"
                    @add-user="addUser"
                    @remove-user="removeUser"
                  />
                </div>
              </vue-scroll>
            </div>
            <div v-else class="member-source">
              <span style="font-size: 20px">{{ $t("NO_PROJECT_MEMBER") }}</span>
              <a
                class="text-primary"
                style="
                  display: flex; 
                  flex-direction: row; 
                  justifycontent: center; 
                  align-items: center"
                @click.stop="createProjectMember"
                ><icon name="add" />{{ $t("ADD_PROJECT_MEMBER") }}</a
              >
            </div>
          </div>
        </form>
      </div>
      <div class="modal-footer" slot="modal-footer">
        <button
          :disabled="computedProcessBtnDisabled"
          type="submit"
          :class="computedProcessBtnClass"
          @click.stop="editTaskMembers"
        >
          <span
            v-if="processStatus === 'doing'"
            class="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          ></span>
          <span v-else-if="processStatus === 'todo'">{{ $t("CONFIRM") }}</span>
          <span v-else>{{ $t("DONE") }}</span>
        </button>
      </div>
    </modal>
  </div>
</template>

<script>
import avatar from "@/components/avatar";
import popover from "@/components/popover";
import tooltip from "@/components/tooltip";
import vueScroll from "vuescroll";
import modal from "@/components/modal";
import userSelectUnselectCell from "@/components/userSelectUnselectCell";
import userStatusContactCell from "@/components/userStatusContactCell";
import { parser, arrayEqual } from "@/common/utils/array";
import { eventBus } from "@/common/utils/eventBus";
import { mouseclick, hide, stopPropagation } from "@/common/utils/mouse";
import { mapState, mapMutations } from "vuex";
import { ops } from "@/common/theme/style";
import * as URL from "@/common/utils/url";
export default {
  components: {
    avatar,
    popover,
    tooltip,
    vueScroll,
    modal,
    userSelectUnselectCell,
    userStatusContactCell
  },
  props: {
    members: {
      type: Array,
      default: () => []
    },
    displayNumber: {
      type: Number,
      default: 3
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
      defualt: false
    }
  },
  data() {
    return {
      hover: false,
      taskMembers: this.members,
      processStatus: "todo",
      ops
    };
  },
  mounted() {
    eventBus.$on("reset-visible-component", () => {
      this.hide(`member-popover`);
    });
  },
  computed: {
    ...mapState("project", ["projects", "activeIndex"]),
    ...mapState("user", ["token", "id"]),
    computedMember() {
      const { members, displayNumber } = this;
      if (members.length > displayNumber)
        return members.slice(0, displayNumber);
      return members;
    },

    computedStyle() {
      return function(index) {
        let length = this.members.length;
        let zIndex = `z-index: ${length - index}`;
        if (index > 0) {
          return `${zIndex}; margin-left: -10px`;
        }
        return `${zIndex};`;
      };
    },
    isHover() {
      const popover = this.$refs["member-popover"];
      if (this.hover || (popover && popover.visible)) {
        return true;
      }
      return false;
    },
    computedProcessBtnDisabled() {
      const { processStatus, computedTaskMemberIds, members } = this;
      let taskMembersIds = members.map(val => val["_id"]);
      let disabled =
        processStatus !== "todo" ||
        arrayEqual(taskMembersIds, computedTaskMemberIds);
      return disabled;
    },
    computedProcessBtnClass() {
      const { processStatus } = this;
      return `btn btn-sm btn-${
        processStatus === "done" ? "success" : "primary"
      } create-btn`;
    },
    computedProjectMembers() {
      const { projects, activeIndex } = this;
      const project = projects[activeIndex];
      if (project) return project["members"];
      return [];
    },
    computedTaskMemberIds() {
      const { taskMembers } = this;
      return parser(taskMembers, "_id");
    },
    computedMemberCount() {
      const { taskMembers, computedProjectMembers } = this;
      return ` (${taskMembers.length}/${computedProjectMembers.length})`;
    }
  },
  watch: {
    members(newVal, oldVal) {
      if (newVal && newVal.length > 0) {
        this.taskMembers = newVal;
      }
    }
  },
  methods: {
    ...mapMutations({
      edit_task_members: "project/edit_task_members"
    }),
    mouseclick,
    hide,
    stopPropagation,
    onMouseWheel() {},
    mouseenter() {
      if (!this.hover) this.hover = true;
    },
    mouseleave() {
      if (this.hover) this.hover = false;
    },
    showEditTaskMember() {
      let modal = this.$refs["edit-task-members"];
      if (modal) modal.show();
    },
    removeUser(user) {
      this.taskMembers = this.taskMembers.filter(u => u._id !== user._id);
    },
    addUser(user) {
      const { taskMembers } = this;
      let containUser = taskMembers.some(u => {
        if (u._id === user._id) return true;
      });
      if (!containUser) this.taskMembers = taskMembers.concat(user);
    },
    createProjectMember() {
      let modal = this.$refs["edit-task-members"];
      if (modal) modal.hide();
      setTimeout(() => {
        $("#modal-create-project-member").modal("show");
      }, 350);
    },
    async editTaskMembers() {
      try {
        const {
          computedTaskMemberIds,
          groupId,
          taskId,
          id,
          taskMembers
        } = this;
        const url = URL.POST_EDIT_TASK_MEMBER();
        const data = {
          members: computedTaskMemberIds,
          user: id,
          taskId
        };
        this.processStatus = "doing";
        const resp = await this.$http.post(url, data, { emulateJson: true });
        this.processStatus = "done";
        this.edit_task_members({ groupId, taskId, members: taskMembers });
        setTimeout(() => {
          let modal = this.$refs["edit-task-members"];
          if (modal) return modal.hide();
        }, 1000);
      } catch (err) {
        this.processStatus = "todo";
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.member-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  background-color: whitesmoke;
  cursor: pointer;
  position: relative;
  .member-wrapper-container {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
  }
  .member-avatar {
    width: 30px;
    height: 30px;
    object-fit: cover;
    border-radius: 15px;
  }
}
.member-wrapper-hover {
  -webkit-transform: translateY(-3px);
  -ms-transform: translateY(-3px);
  transform: translateY(-3px);
  -webkit-box-shadow: -2px 1px 2px gainsboro;
  box-shadow: -2px 1px 2px gainsboro;
  -webkit-transition: all 0.3s ease-out;
  transition: all 0.3s ease-out;
  border-radius: 2px;
}

.member-detail {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 10px;
  .member-detail-header {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    height: 20%;
    width: 100%;
  }
  .member-detail-body {
    height: 60%;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    .member-empty {
      width: 100%;
      height: 50%;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      align-items: center;
    }
  }
  .member-detail-footer {
    height: 20%;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
}

.member-source {
  width: 100%;
  height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
