<template>
  <div class="mainboard-wrapper">
    <div v-if="hasProject" class="mainboard">
      <div class="mainboard-title">
        <div class="mainboard-title-name">
          <span class="display-only" style="font-size: 40px">
            {{ computedProjectName }}
          </span>
        </div>
        <h5 v-if="isEdited(logs[projects[activeIndex]['_id']])">
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
              @mouseover.native="mouseover('online-member')"
              @mouseleave.native="mouseleave('online-member')"
            >
              <popover ref="online-member" style="right: 3vw; top: 0;">
                <tooltip
                  content-style="width: 250px; height: 250px;border-radius: 10px;box-shadow: -5px 2px 5px lightgrey; -webkit-box-shadow: -5px 2px 5px lightgrey;border: 1px solid whitesmoke;"
                  arrow-placement="right"
                  arrow-position="top: 1vw"
                  background-color="white"
                  border-color="whitesmoke"
                >
                  <div class="online-member-wrapper">
                    <div class="online-member-header">
                      <span>{{ $t("PROJECT_MEMBER") }}</span>
                    </div>
                    <div
                      v-if="computedMemberList.length === 0"
                      class="online-member-list"
                    >
                      <span>{{ $t("NO_PROJECT_MEMBER") }}</span>
                      <a
                        @click.stop="addProjectMember"
                        style="font-size: 14px; margin-top: 5px;"
                        class="text-primary"
                        >{{ $t("ADD_PROJECT_MEMBER") }}</a
                      >
                    </div>
                    <div v-else class="online-member-list">
                      <vue-scroll :ops="ops">
                        <div
                          class="online-member-cell"
                          v-for="(item, index) in computedMemberList"
                          :key="index"
                        >
                          <user-online-contact
                            :item="item"
                            :creator="computedProjectCreator"
                          />
                        </div>
                      </vue-scroll>
                    </div>
                    <div class="online-member-footer">
                      <a
                        style="font-size: 14px; margin-top: 5px;"
                        @click.stop="addProjectMember"
                        class="text-primary"
                      >
                        {{ $t("ADD_PROJECT_MEMBER") }}
                      </a>
                    </div>
                  </div>
                </tooltip>
              </popover>
            </badge-icon>
            <span class="online-user-count display-only">{{
              computedOnlineMemberCount
            }}</span>
          </div>
          <badge-icon
            :wrapper-style="more.wrapperStyle"
            :icon-style="more.iconStyle"
            :icon-name="more.iconName"
            @mouseover.native="mouseover('more')"
            @mouseleave.native="mouseleave('more')"
          >
            <popover ref="more" style="right: 2.5vw; top: -20px;">
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
                arrow-position="top: calc(1.5vw)"
                background-color="white"
                border-color="whitesmoke"
              >
                <div class="settings-top-align">
                  <a
                    @click.stop="syncProject"
                    style="
                      border-top: none;
                      border-top-left-radius: 10px;
                      border-top-right-radius: 10px;
                    "
                  >
                    <icon
                      class="setting-icon"
                      name="refresh"
                      style="color: grey;"
                    />
                    <span style="color: grey;">{{ $t("SYNC_PROJECT") }}</span>
                  </a>
                  <a
                    :style="computedSaveProjectBtnStyle"
                    @click.stop="saveProject"
                  >
                    <icon
                      class="setting-icon"
                      name="save"
                      :style="computedSaveProjectBtnColor"
                    />
                    <span
                      v-show="computedLogNumber"
                      class="badge badge-danger badge-pill"
                      style="
                        position: absolute;
                        left: 35px;
                        width: 28px;
                        height: 18px;
                        font-size: 10px;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                      "
                      >{{ computedLogNumber }}</span
                    >
                    <span
                      v-if="computedIsSavingProject"
                      class="spinner-border spinner-border-sm setting-icon"
                      :style="computedSaveProjectBtnColor"
                    ></span>
                    <span :style="computedSaveProjectBtnColor" v-else>{{
                      $t("SAVE_PROJECT")
                    }}</span>
                  </a>
                  <a @click.stop="importProject">
                    <icon
                      class="setting-icon"
                      name="import"
                      style="color: grey;"
                    />
                    <span style="color: grey;">{{ $t("IMPORT_PROJECT") }}</span>
                  </a>
                  <a
                    @click.stop="exportProject"
                    style="
                      border-bottom: none;
                      border-bottom-left-radius: 10px;
                      border-bottom-right-radius: 10px;
                    "
                  >
                    <icon
                      class="setting-icon"
                      name="export"
                      style="color: grey;"
                    />
                    <span style="color: grey;">{{ $t("EXPORT_PROJECT") }}</span>
                  </a>
                </div>
              </tooltip>
            </popover>
          </badge-icon>
        </div>
      </div>
      <div class="mainboard-info">
        <editable-text
          style="width: 40%; height: 100%; padding: 1px;"
          default-value="ADD_DESCRIPTION"
          :value="computedProjectDescription"
          input-style="font-size: 25px;"
          :row="3"
          @input-change="descriptionChange"
        />
      </div>
      <div class="mainboard-body">
        <phase />
      </div>
    </div>
    <div v-else class="mainboard">
      <div class="mainboard-title">
        <h1>{{ $t("MAIN_WELCOME") }} Storyboard</h1>
      </div>
      <div class="seperator"></div>
      <div class="mainboard-info" style="height: 100px;">
        <h3>{{ $t("MAIN_FEATURE_INTRO") }}</h3>
      </div>
      <div class="mainboard-left">
        <a class="link text-primary" @click="gotoCreateProject">{{
          $t("MAIN_CREATE_PROJECT")
        }}</a>
        <a class="link text-primary" @click="gotoCreateTeam">{{
          $t("MAIN_CREATE_GROUP")
        }}</a>
        <a class="link text-primary" @click="gotoEditProfile">{{
          $t("MAIN_EDIT_INFO")
        }}</a>
      </div>
    </div>

    <!-- modals -->
    <create-project />
    <create-phase />
    <create-project-members />
    <create-team />
    <create-warehouse />
  </div>
</template>

<script>
import badgeIcon from "@/components/badgeIcon";
import popover from "@/components/popover";
import tooltip from "@/components/tooltip";
import sidebar from "@/components/sidebar";
import editableText from "@/components/editableText";
import datepicker from "@/components/datepicker";
import vueScroll from "vuescroll";
import userOnlineContact from "@/components/userOnlineContactCell";
import phase from "@/components/phase";
import createProject from "@/components/form/createProject";
import createProjectMembers from "@/components/form/createProjectMembers";
import createTeam from "@/components/form/createTeam";
import createPhase from "@/components/form/createPhase";
import createWarehouse from "@/components/form/createWarehouse";
import { isEdited, logCount, confirmLog } from "@/common/utils/log";
import { mouseclick, mouseover, mouseleave } from "@/common/utils/mouse";
import { group, more } from "@/common/theme/style";
import { mapState, mapMutations } from "vuex";
import * as URL from "@/common/utils/url";
export default {
  data() {
    return {
      // component style
      group,
      more,
      members: [],
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
      },
      savingIds: {},
      syncIds: {}
    };
  },
  components: {
    badgeIcon,
    popover,
    sidebar,
    editableText,
    tooltip,
    datepicker,
    phase,
    vueScroll,
    userOnlineContact,
    createProject,
    createProjectMembers,
    createTeam,
    createWarehouse,
    createPhase
  },
  computed: {
    ...mapState("project", ["projects", "activeIndex", "logs"]),
    ...mapState("user", ["id", "token"]),
    hasProject() {
      const { projects, activeIndex } = this;
      return projects[activeIndex] ? true : false;
    },
    computedProjectName() {
      const { projects, activeIndex, logs } = this;
      let projectId = projects[activeIndex]["_id"];
      if (logs[projectId] && logs[projectId]["name"]) {
        return logs[projectId]["name"];
      }
      return projects[activeIndex]["name"];
    },
    computedProjectDescription() {
      const { projects, activeIndex, logs } = this;
      let projectId = projects[activeIndex]["_id"];
      if (logs[projectId] && logs[projectId]["description"]) {
        return logs[projectId]["description"];
      }
      return projects[activeIndex]["description"];
    },
    computedLogNumber() {
      const { projects, activeIndex, logs } = this;
      let project = logs[projects[activeIndex]._id];
      let count = logCount(project);
      if (count === 0) return "";
      if (count > 99) return "99+";
      return `${count}`;
    },
    computedOnlineMemberCount() {
      const { members } = this;
      return members.length;
    },
    computedMemberList() {
      const { projects, activeIndex } = this;
      return projects[activeIndex]["members"];
    },
    computedIsSavingProject() {
      const { projects, activeIndex, savingIds } = this;
      let projectId = projects[activeIndex]["_id"];
      return Object.keys(savingIds).includes(projectId);
    },
    computedIsSyncProject() {
      const { projects, activeIndex, syncIds } = this;
      let projectId = projects[activeIndex]["_id"];
      return Object.keys(syncIds).includes(projectId);
    },
    computedSaveProjectBtnStyle() {
      const { computedLogNumber, computedIsSavingProject } = this;
      return `pointer-events: ${
        computedLogNumber && !computedIsSavingProject ? "auto" : "none"
      };`;
    },
    computedSaveProjectBtnColor() {
      const { computedLogNumber, computedIsSavingProject } = this;
      return `color: ${
        computedLogNumber && !computedIsSavingProject ? "grey" : "lightgray"
      }`;
    },
    computedProjectCreator() {
      const { projects, activeIndex } = this;
      let project = projects[activeIndex];
      if (project) return project["creator"];
      return {};
    }
  },
  methods: {
    mouseclick,
    mouseover,
    mouseleave,
    isEdited,
    ...mapMutations({
      add_log: "project/add_log",
      remove_log: "project/remove_log",
      sync_project: "project/sync_project",
      merge_logs: "project/merge_logs"
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
    async fetchOnlineUsers() {
      try {
        const { projects, activeIndex } = this;
        let projectId = projects[activeIndex]._id;
        let url = URL.GET_PROJECT_ONLINE_MEMBERS(projectId);
        const resp = await this.$http.get(url);
        let resMembers = resp.data.data.members;
        this.members = resMembers.filter(member => member.online);
      } catch (err) {
        console.log(err);
      }
    },
    async syncProject() {
      const { activeIndex, projects } = this;
      let projectId = projects[activeIndex]["_id"];
      try {
        let url = URL.GET_SYNC_PROJECT(projectId);
        this.syncIds[projectId] = true;
        const resp = await this.$http.get(url);
        this.sync_project(resp.data.data);
      } catch (err) {
      } finally {
        delete this.syncIds[projectId];
      }
    },
    async saveProject() {
      const { logs, id, activeIndex, projects } = this;
      let projectId = projects[activeIndex]["_id"];
      try {
        // console.log(logs);
        let logInfo = confirmLog(logs[projectId]);
        let data = { user: id, ...logInfo };
        let url = URL.POST_SAVE_PROJECT_LOG();
        this.$set(this.savingIds, projectId, true);
        const resp = await this.$http.post(url, data, { emulateJson: true });
        this.merge_logs({ ids: resp.data.data, logs: logInfo });
      } catch (err) {
      } finally {
        this.$delete(this.savingIds, projectId);
      }
    },
    importProject() {},
    exportProject() {},
    addProjectMember() {
      $("#modal-create-project-member").modal("show");
    },
    gotoCreateProject() {
      $("#modal-create-project").modal("show");
    },
    gotoCreateTeam() {
      $("#modal-create-team").modal("show");
    },
    gotoEditProfile() {
      this.$router.push({ name: "account" });
    }
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
}

.mainboard-info {
  height: 10%;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}
.mainboard-body {
  height: 82%;
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
  position: relative;
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
.online-member-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .online-member-header {
    width: 100%;
    height: 20%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .online-member-list {
    width: 100%;
    height: 60%;
    padding: 0px 5px 0px 5px;
    display: flex;
    flex-direction: column;
    padding: 10px;
    justify-content: center;
    align-items: center;
    .online-member-cell {
      width: 100%;
      height: 50px;
    }
  }
  .online-member-footer {
    width: 100%;
    height: 20%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    a {
      cursor: pointer;
    }
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
