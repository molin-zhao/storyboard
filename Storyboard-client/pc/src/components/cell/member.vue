<template>
  <div
    class="member-wrapper"
    @mouseenter="mouseenter"
    @mouseleave="mouseleave"
    @click="mouseclick(`member-popover`, $event)"
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
      <popover ref="member-popover" style="top: calc(100% + 10px);">
        <tooltip
          content-style="
        width: 300px; 
        height: 250px; 
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
          <div class="member-detail">
            <div class="member-detail-header">
              <span class="display-only">{{ $t("TASK_MEMBERS") }}</span>
            </div>
            <div class="member-detail-body">
              <div class="member-empty" v-if="members.length === 0">
                <span style="font-size: 20px">{{
                  $t("NO_TASK_MEMBER_ALLOC")
                }}</span>
                <a
                  class="text-primary"
                  style="
                  display: flex; 
                  flex-direction: row; 
                  justifycontent: center; 
                  align-items: center"
                  @click="showCreateTaskMember"
                  ><icon name="add" />{{ $t("ASSIGN_TASK") }}</a
                >
              </div>
              <vue-scroll v-else :ops="ops">
                <div
                  style="width: 100%; height: 100px"
                  v-for="item in members"
                  :key="item._id"
                ></div>
              </vue-scroll>
            </div>
          </div>
        </tooltip>
      </popover>
    </div>

    <!-- assign member modal -->
    <create-task-members />
    <create-project-members />
  </div>
</template>

<script>
import avatar from "@/components/avatar";
import popover from "@/components/popover";
import tooltip from "@/components/tooltip";
import vueScroll from "vuescroll";
import createTaskMembers from "@/components/form/createTaskMembers";
import createProjectMembers from "@/components/form/createProjectMembers";
import { eventBus } from "@/common/utils/eventBus";
import { mouseclick, hide } from "@/common/utils/mouse";
export default {
  components: {
    avatar,
    popover,
    tooltip,
    vueScroll,
    createTaskMembers,
    createProjectMembers
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
      ops: {
        vuescroll: {
          mode: "native"
        },
        scrollPanel: {
          scrollingX: false
        },
        bar: {
          background: "lightgrey"
        }
      }
    };
  },
  mounted() {
    eventBus.$on("reset-visible-component", () => {
      this.hide(`member-popover`);
    });
  },
  computed: {
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
    }
  },
  methods: {
    mouseclick,
    hide,
    mouseenter() {
      if (!this.hover) this.hover = true;
    },
    mouseleave() {
      if (this.hover) this.hover = false;
    },
    showCreateTaskMember() {
      $("#modal-create-task-member").modal("show");
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
  -webkit-box-shadow: -5px 2px 5px lightgrey;
  box-shadow: -5px 2px 5px lightgrey;
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
  padding: 5px;
  .member-detail-header {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    height: 20%;
    width: 100%;
  }
  .member-detail-body {
    height: 80%;
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
}
</style>
