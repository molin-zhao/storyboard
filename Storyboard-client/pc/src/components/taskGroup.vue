<template>
  <div class="task-group-wrapper">
    <div class="group-setting">
      <div v-if="!collapsed" class="group-setting-show">
        <div class="setting-btn">
          <span
            v-if="groupAdding || groupDeleting"
            class="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
            :style="`color: ${item.color}; width: 16px; height: 16px`"
          ></span>
          <badge-icon
            v-else
            :wrapper-style="triangledownfill.wrapperStyle"
            :icon-style="triangledownfill.iconStyle"
            :icon-name="triangledownfill.iconName"
            @click.native="mouseclick('group-setting')"
          >
            <popover
              ref="group-setting"
              style="left: 0; top: calc(100% + 10px)"
              @popover-visible="groupSettingShow"
            >
              <tooltip
                background-color="white"
                border-color="whitesmoke"
                contentStyle="width: 200px; height: 250px; background-color: white;border-radius: 10px;box-shadow: -5px 2px 5px lightgrey; -webkit-box-shadow: -5px 2px 5px lightgrey;border: 1px solid whitesmoke"
              >
                <div class="settings-top-align">
                  <a
                    @click="collapseGroup"
                    style="
                    border-top: none;
                    border-top-left-radius: 10px;
                    border-top-right-radius: 10px
                  "
                  >
                    <icon
                      class="setting-icon"
                      name="collapse"
                      style="color: grey"
                    />
                    <span style="color: grey">{{ $t("COLLAPSE_GROUP") }}</span>
                  </a>
                  <a @click.stop="changeGroupColor">
                    <icon
                      class="setting-icon"
                      name="eglasscolor"
                      style="color: grey"
                    />
                    <span style="color: grey">{{
                      $t("CHANGE_GROUP_COLOR")
                    }}</span>
                  </a>
                  <a @click="manageTask">
                    <icon
                      class="setting-icon"
                      name="manage"
                      style="color: grey"
                    />
                    <span style="color: grey">{{ $t("MANAGE_TASK") }}</span>
                  </a>
                  <a @click="addGroup">
                    <icon class="setting-icon" name="add" style="color: grey" />
                    <span style="color: grey">{{ $t("ADD_GROUP") }}</span>
                  </a>
                  <a
                    @click="deleteGroup"
                    style="
                    border-bottom: none;
                    border-bottom-left-radius: 10px;
                    border-bottom-right-radius: 10px
                  "
                  >
                    <icon
                      class="setting-icon"
                      name="delete"
                      style="color: var(--main-color-danger)"
                    />
                    <span style="color: var(--main-color-danger)">{{
                      $t("DELETE_GROUP")
                    }}</span>
                  </a>
                </div>
              </tooltip>
            </popover>
          </badge-icon>
        </div>

        <div class="setting-group-label">
          <div>
            <editable-text
              :default-value="$t('UNTITLE_GROUP', { index: groupIndex + 1 })"
              :value="computedGroupTitle"
              :input-style="`font-size: 18px; color: ${item.color}`"
              @input-change="groupNameChange"
            />
          </div>
        </div>
      </div>
      <div v-else class="group-setting-hide" @click="collapseGroup">
        <div class="group-color" :style="`background-color: ${item.color}`" />
        <span :style="`color: ${item.color}`">{{ item.name }}</span>
        <span style="position: absolute; right: 5px">{{
          $t("TASK_NUMBER", { number: item.tasks.length })
        }}</span>
      </div>
    </div>
    <div
      class="collapse show"
      :id="`collapseTask-${groupId}`"
      style="width: 100%"
    >
      <div class="group-body">
        <transition-group class="group-title">
          <a v-show="showDeleteTask" class="delete-task" key="ban">
            <icon
              name="ban"
              class="delete-task-icon"
              @click.native.stop="hideDeleteTask"
            />
          </a>
          <group-title
            v-for="(item, index) in titles"
            :item="item"
            :key="item.name"
            :title="$t(item.name)"
            :default-style="computedTitleStyle"
            :resizer="index < titles.length - 1 ? true : false"
            :sibling-resizing="titleResizing"
            @on-drag-start="onTitleDragStart"
            @on-drag-end="onTitleDragEnd"
            @on-drag-enter="onTitleDragEnter"
            @on-resizing="onTitleResizing(arguments)"
            @on-resizing-end="onTitleResizingEnd"
          />
        </transition-group>
        <group-row
          v-for="task in item.tasks"
          :key="task._id"
          class="group-cell"
        >
          <group-cell-wrapper
            :titles="titles"
            :task="task"
            :color="item.color"
            :phase-index="phaseIndex"
            :group-id="groupId"
            :show-delete-btn="showDeleteTask"
          />
        </group-row>
        <!-- add a task -->
        <add-task
          :titles="titles"
          :phase-index="phaseIndex"
          :group-id="groupId"
          :color="item.color"
          :editable="true"
          class="group-cell"
        />
      </div>
    </div>
  </div>
</template>

<script>
import groupRow from "@/components/groupRow";
import groupCell from "@/components/groupCell";
import groupCellWrapper from "@/components/groupCellWrapper";
import groupTitle from "@/components/groupTitle";
import badgeIcon from "@/components/badgeIcon";
import editableText from "@/components/editableText";
import popover from "@/components/popover";
import tooltip from "@/components/tooltip";
import addTask from "@/components/addTask";
import { mapState, mapMutations } from "vuex";
import { eventBus } from "@/common/utils/eventBus";
import { mouseclick, hide } from "@/common/utils/mouse";
import { getGroupLog } from "@/common/utils/log";
import * as URL from "@/common/utils/url";
export default {
  components: {
    groupTitle,
    groupRow,
    groupCell,
    groupCellWrapper,
    badgeIcon,
    editableText,
    popover,
    tooltip,
    addTask
  },
  computed: {
    ...mapState("project", ["projects", "activeIndex", "logs"]),
    ...mapState("user", ["id", "token"]),
    computedTitleStyle() {
      const { index, titles } = this;
      return `height: 100%; background-color: white; ${
        index === 0 ? "border-top-left-radius: 10px;" : null
      };${
        index === titles.length - 1 ? "border-top-right-radius: 10px;" : null
      }`;
    },
    computedGroupTitle() {
      const { projects, activeIndex, logs, phaseIndex, groupId, item } = this;
      let cprojId = projects[activeIndex]._id;
      let cphaseId = projects[activeIndex]["phases"][phaseIndex]._id;
      let logName = getGroupLog(logs, cprojId, cphaseId, groupId, "name");
      return logName ? logName : item.name;
    },
    triangledownfill() {
      const { color } = this.item;
      return {
        wrapperStyle: {
          plain: `width: 16px; height: 16px; border-radius: 8px; background-color: ${color};`,
          active: "background-color: aliceblue;"
        },
        iconStyle: {
          plain: "width: 100%; height: 100%; color: white;",
          active: "color: cornflowerblue;"
        },
        iconName: {
          plain: "triangledownfill"
        }
      };
    }
  },
  props: {
    phaseIndex: {
      type: Number,
      required: true
    },
    groupId: {
      type: String,
      required: true
    },
    item: {
      type: Object
    },
    groupIndex: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      titles: [
        {
          name: "TITLE_NAME",
          init_w: "25%",
          offset_w: 0,
          min_w: 300,
          draggable: false
        },
        {
          name: "TITLE_STATUS",
          init_w: "12%",
          offset_w: 0,
          min_w: 100,
          draggable: true
        },
        {
          name: "TITLE_MEMBER",
          init_w: "15%",
          offset_w: 0,
          min_w: 100,
          draggable: true
        },
        {
          name: "TITLE_PRIORITY",
          init_w: "12%",
          offset_w: 0,
          min_w: 100,
          draggable: true
        },
        {
          name: "TITLE_TIMELINE",
          init_w: "21%",
          offset_w: 0,
          min_w: 150,
          draggable: true
        },
        {
          name: "TITLE_PROGRESS",
          init_w: "15%",
          offset_w: 0,
          min_w: 100,
          draggable: true
        }
      ],
      dragging: null,
      titleResizing: false,
      collapsed: false,
      showDeleteTask: false,
      groupDeleting: false,
      groupAdding: false
    };
  },
  methods: {
    mouseclick,
    hide,
    ...mapMutations({
      add_log: "project/add_log",
      remove_log: "project/remove_log",
      add_group: "project/add_group",
      delete_group: "project/delete_group"
    }),
    onTitleDragStart(item) {
      this.dragging = item;
    },
    onTitleDragEnd(item) {
      this.dragging = null;
    },
    onTitleDragEnter(item) {
      if (item === this.dragging) return;
      const newTitle = [...this.titles];
      const src = newTitle.indexOf(this.dragging);
      const dst = newTitle.indexOf(item);
      if (newTitle[dst].draggable && newTitle[src].draggable) {
        newTitle.splice(dst, 0, ...newTitle.splice(src, 1));
        this.titles = newTitle;
      }
    },
    onTitleResizing(args) {
      if (!this.titleResizing) this.titleResizing = true;
      let currentElement = args[0];
      let moveLen = args[1];
      let crntEleOffsetWd = args[2];
      let nxtEleOffsetWd = args[3];

      let nextSiblingIndex = this.titles.indexOf(currentElement) + 1;
      if (nextSiblingIndex > this.titles.length - 1) return;
      let nextElement = this.titles[nextSiblingIndex];

      let crntElMinWd = currentElement.min_w;
      let nxtElMinWd = nextElement.min_w;
      let crntThreshold = crntEleOffsetWd + moveLen;
      let nxtThreshold = nxtEleOffsetWd - moveLen;
      if (crntThreshold > crntElMinWd && nxtThreshold > nxtElMinWd) {
        currentElement.offset_w = currentElement.offset_w + moveLen;
        nextElement.offset_w = nextElement.offset_w - moveLen;
      }
    },
    onTitleResizingEnd() {
      if (this.titleResizing) this.titleResizing = false;
    },
    collapseGroup() {
      const { groupId } = this;
      if (this.collapsed) {
        $(`#collapseTask-${groupId}`).collapse("show");
      } else {
        $(`#collapseTask-${groupId}`).collapse("hide");
      }
      this.collapsed = !this.collapsed;
    },
    showGroup() {
      if (this.collapsed) {
        this.collapsed = false;
      }
    },
    async addGroup() {
      try {
        const { projects, activeIndex, phaseIndex } = this;
        let phaseId = projects[activeIndex]["phases"][phaseIndex]._id;
        let url = URL.POST_CREATE_GROUP();
        this.groupAdding = true;
        const resp = await this.$http.post(
          url,
          {
            phaseId
          },
          { emulateJSON: true }
        );
        let group = resp.data.data;
        if (group) {
          this.add_group({ phaseId, group });
        } else {
          this.$alert.show({
            type: "warning",
            message: this.$t("ADD_GROUP_ERROR"),
            interval: 5000
          });
        }
      } catch (err) {
        console.log(err);
        this.$alert.show({
          type: "warning",
          message: this.$t("ADD_GROUP_ERROR"),
          interval: 5000
        });
      } finally {
        this.groupAdding = false;
      }
    },
    groupSettingShow(val) {
      this.groupSettingVisible = val;
    },
    changeGroupColor() {},
    manageTask() {
      this.showDeleteTask = true;
    },
    hideDeleteTask() {
      this.showDeleteTask = false;
    },
    deleteGroup() {
      const { projects, activeIndex, phaseIndex, groupId } = this;
      if (projects[activeIndex]["phases"][phaseIndex]["groups"].length === 1) {
        return this.$alert.show({
          type: "warning",
          message: this.$t("ATLEAST_ONE_GROUP"),
          interval: 3000
        });
      }
      this.$confirm.show({
        title: this.$t("DELETE_GROUP_TITLE"),
        message: this.$t("DELETE_GROUP_MESSAGE"),
        success: async () => {
          try {
            let projectId = projects[activeIndex]._id;
            let phaseId = projects[activeIndex]["phases"][phaseIndex]._id;
            let url = URL.DELETE_GROUP(phaseId, groupId);
            this.groupDeleting = true;
            const resp = await this.$http.delete(url);
            if (resp.data.data === "ok") {
              this.delete_group({ phaseId, groupId });
            } else {
              this.$alert.show({
                type: "warning",
                message: this.$t("DELETE_GROUP_ERROR"),
                interval: 5000
              });
            }
          } catch (err) {
            console.log(err);
            this.$alert.show({
              type: "warning",
              message: this.$t("DELETE_GROUP_ERROR"),
              interval: 5000
            });
          } finally {
            this.groupDeleting = false;
          }
        },
        confirmLabel: this.$t("CONFIRM"),
        cancelLabel: this.$t("CANCEL")
      });
    },
    groupNameChange(val) {
      const { item, projects, activeIndex, phaseIndex, groupId } = this;
      let projectId = projects[activeIndex]._id;
      let phaseId = projects[activeIndex]["phases"][phaseIndex]._id;
      if (val === item.name) {
        this.remove_log({ projectId, phaseId, groupId, field: "name" });
      } else {
        this.add_log({
          projectId,
          phaseId,
          groupId,
          field: "name",
          value: val
        });
      }
    }
  },
  mounted() {
    eventBus.$on("reset-visible-component", () => {
      this.hide("group-setting");
    });
  }
};
</script>

<style lang="scss" scoped>
.task-group-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  position: relative;
  margin-bottom: 10px;
  .group-setting {
    width: 100%;
    height: 60px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    .group-setting-show {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
    }
    .group-setting-hide {
      width: 96%;
      height: 60%;
      margin-left: 4%;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      background-color: whitesmoke;
      cursor: pointer;
      position: relative;
    }
    .group-setting-hide:active {
      -webkit-box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
      box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
    }
    .setting-btn {
      width: 4%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      position: relative;
    }
    .setting-group-label {
      width: 16%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      div {
        width: 100%;
        height: 80%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }
    }
  }
  .group-body {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-end;
  }
  .group-title {
    width: 96%;
    height: 40px;
    margin-bottom: 2px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: nowrap;
    position: relative;
  }
  .group-cell {
    width: 96%;
    height: 40px;
    margin-bottom: 1px;
  }
}
</style>
