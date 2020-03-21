<template>
  <div class="mainboard-wrapper">
    <div v-if="hasProject" class="mainboard">
      <div class="mainboard-title">
        <div class="project-name">
          <span class="display-only" style="font-size: 40px">
            {{ computedProjectName }}
          </span>
        </div>
        <h5 v-if="isEdited(logs[projects[activeIndex]._id])">
          <span class="badge badge-pill badge-warning">{{ $t("EDITED") }}</span>
        </h5>
        <div class="mainboard-title-right">
          <div
            class="online-user"
            data-toggle="tooltip"
            data-placement="bottom"
            :title="$t('ONLINE_MEMBER')"
          >
            <badge-icon
              :wrapper-style="group.wrapperStyle"
              :icon-style="group.iconStyle"
              :icon-name="group.iconName"
            />
            <span class="online-user-count display-only">{{
              onlineUsers
            }}</span>
          </div>
          <badge-icon
            :wrapper-style="more.wrapperStyle"
            :icon-style="more.iconStyle"
            :icon-name="more.iconName"
            @mouseover.native="mouseover('more')"
            @mouseleave.native="mouseleave('more')"
          >
            <popover ref="more" style="right: 40px; top: -20px">
              <tooltip
                content-style="
                width: 200px;
                height: 200px;
                border-radius: 10px;
                box-shadow: -5px 2px 5px lightgrey; 
                -webkit-box-shadow: -5px 2px 5px lightgrey;
                border: 1px solid whitesmoke;
                "
                arrow-placement="right"
                arrow-position="top: calc(0.4vh + 20px)"
                background-color="white"
                border-color="whitesmoke"
              >
                <div class="settings-top-align">
                  <a
                    @click.stop="syncProject"
                    style="
                    border-top: none;
                    border-top-left-radius: 5px;
                    border-top-right-radius: 5px
                  "
                  >
                    <icon
                      class="setting-icon"
                      name="refresh"
                      style="color: grey"
                    />
                    <span style="color: grey">{{ $t("SYNC_PROJECT") }}</span>
                  </a>
                  <a
                    :style="
                      `pointer-events: ${computedLogNumber ? 'auto' : 'none'};`
                    "
                    @click.stop="saveProject"
                  >
                    <icon
                      class="setting-icon"
                      name="save"
                      :style="
                        `color: ${computedLogNumber ? 'grey' : 'lightgray'}`
                      "
                    />
                    <span
                      v-show="computedLogNumber"
                      class="badge badge-danger badge-pill"
                      style="
                      position: absolute; 
                      left: 35px; width: 28px; 
                      height: 18px;font-size: 10px;
                      display: flex;
                      justify-content: center;
                      align-items: center
                      "
                      >{{ computedLogNumber }}</span
                    >
                    <span
                      :style="
                        `color: ${computedLogNumber ? 'grey' : 'lightgray'}`
                      "
                      >{{ $t("SAVE_PROJECT") }}</span
                    >
                  </a>
                  <a @click.stop="importProject">
                    <icon
                      class="setting-icon"
                      name="import"
                      style="color: grey"
                    />
                    <span style="color: grey">{{ $t("IMPORT_PROJECT") }}</span>
                  </a>
                  <a
                    @click.stop="exportProject"
                    style="
                    border-bottom: none;
                    border-bottom-left-radius: 5px;
                    border-bottom-right-radius: 5px
                  "
                  >
                    <icon
                      class="setting-icon"
                      name="export"
                      style="color: grey"
                    />
                    <span style="color: grey">{{ $t("EXPORT_PROJECT") }}</span>
                  </a>
                </div>
              </tooltip>
            </popover>
          </badge-icon>
        </div>
      </div>
      <div class="mainboard-info">
        <editable-text
          style="width: 40%; height: 100%; padding: 1px"
          default-value="ADD_DESCRIPTION"
          :value="computedProjectDescription"
          input-style="font-size: 25px;"
          :row="3"
          @input-change="descriptionChange"
        />
      </div>
      <div class="mainboard-phases">
        <phase />
      </div>
    </div>
    <div v-else class="mainboard">
      <div class="mainboard-title">
        <h1>{{ $t("MAIN_WELCOME") }} Storyboard</h1>
      </div>
      <div class="seperator"></div>
      <div class="mainboard-info" style="height: 100px">
        <h3>{{ $t("MAIN_FEATURE_INTRO") }}</h3>
      </div>
      <div class="mainboard-left">
        <a class="link text-primary">{{ $t("MAIN_CREATE_PROJECT") }}</a>
        <a class="link text-primary">{{ $t("MAIN_CREATE_GROUP") }}</a>
        <a class="link text-primary">{{ $t("MAIN_EDIT_INFO") }}</a>
      </div>
    </div>
  </div>
</template>

<script>
import badgeIcon from "@/components/badgeIcon";
import popover from "@/components/popover";
import tooltip from "@/components/tooltip";
import sidebar from "@/components/sidebar";
import editableText from "@/components/editableText";
import datepicker from "@/components/datepicker";
import phase from "@/components/phase";
import { isEdited, logCount } from "@/common/utils/log";
import { mouseclick, mouseover, mouseleave } from "@/common/utils/mouse";
import { group, more } from "@/common/theme/icon";
import { mapState, mapMutations } from "vuex";
export default {
  data() {
    return {
      // component style
      group,
      more,
      // self data
      onlineUsers: 1
    };
  },
  components: {
    badgeIcon,
    popover,
    sidebar,
    editableText,
    tooltip,
    datepicker,
    phase
  },
  computed: {
    ...mapState("project", ["projects", "activeIndex", "logs"]),
    hasProject() {
      const { projects, activeIndex } = this;
      return projects[activeIndex] ? true : false;
    },
    computedProjectName() {
      const { projects, activeIndex, logs } = this;
      let projectId = projects[activeIndex]._id;
      if (logs[projectId] && logs[projectId]["name"]) {
        return logs[projectId]["name"];
      }
      return projects[activeIndex].name;
    },
    computedProjectDescription() {
      const { projects, activeIndex, logs } = this;
      let projectId = projects[activeIndex]._id;
      if (logs[projectId] && logs[projectId]["description"]) {
        return logs[projectId]["description"];
      }
      return projects[activeIndex].description;
    },
    computedLogNumber() {
      const { projects, activeIndex, logs } = this;
      let project = logs[projects[activeIndex]._id];
      let count = logCount(project);
      if (count === 0) return "";
      if (count > 99) return "99+";
      return `${count}`;
    }
  },
  methods: {
    mouseclick,
    mouseover,
    mouseleave,
    isEdited,
    ...mapMutations({
      add_log: "project/add_log",
      remove_log: "project/remove_log"
    }),
    descriptionChange(val) {
      const { projects, activeIndex } = this;
      if (projects[activeIndex].description !== val) {
        // original description changed, add a log
        this.add_log({
          projectId: projects[activeIndex]._id,
          field: "description",
          value: val
        });
      } else {
        this.remove_log({
          projectId: projects[activeIndex]._id,
          field: "description"
        });
      }
    },
    syncProject() {
      console.log("sync");
    },
    saveProject() {
      console.log("save");
    },
    importProject() {},
    exportProject() {}
  },
  mounted() {
    $(document).ready(function() {
      $('[data-toggle="tooltip"]').tooltip();
    });
  }
};
</script>

<style lang="scss" scoped>
.mainboard-wrapper {
  width: 100%;
  height: 100%;
  .mainboard {
    padding: 10px 10px 0 10px; // padding bottom 0px
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    .mainboard-title {
      .project-name {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        flex-wrap: nowrap;
        width: 20%;
        height: 100%;
        span {
          overflow: hidden;
          text-overflow: ellipsis;
          text-align: left;
          white-space: nowrap;
          width: 100%;
        }
      }
      width: 100%;
      height: 8%;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      position: relative;
      .mainboard-title-right {
        position: absolute;
        height: 100%;
        width: 50%;
        right: 0;
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        align-items: center;
      }
    }
  }
}

.mainboard-info {
  height: 10%;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}
.mainboard-phases {
  height: 80%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}
.mainboard-left {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
}
.online-user {
  margin-right: 2vw;
  width: 6vw;
  height: 3vw;
  border-radius: 1vw;
  border: lightgrey solid 1px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  .online-user-count {
    width: 3vw;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-left: lightgrey solid 1px;
  }
}
.seperator {
  width: 100%;
  height: 1px;
  border-radius: 0.5px;
  background-color: lightgray;
}

.link {
  cursor: pointer;
  margin-left: 30px;
  margin-bottom: 5px;
}
</style>
