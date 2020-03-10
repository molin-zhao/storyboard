<template>
  <div class="storyboard-container" @click="resetVisibleComponents">
    <loading
      v-if="storyboardLoading"
      :active="true"
      spinner="line-wave"
      color="#090723"
    />
    <div v-else class="storyboard color-primary">
      <!-- left menu -->
      <div class="menubar">
        <img src="/static/logo.png" style="width: 4vw; height: 4vw" />
        <div class="menubar-empty"></div>
        <div class="menubar-setting-wrapper">
          <badge-icon
            :wrapper-style="bell.wrapperStyle"
            :icon-style="bell.iconStyle"
            badge-class="badge-danger"
            :icon-name="bell.iconName"
            :number="90"
            @mouseover.native="mouseover('bell')"
            @mouseleave.native="mouseleave('bell')"
          >
            <popover ref="bell" style="left: 6vw; bottom: 0">
              <tooltip
                content-style="width: 200px; height: 200px"
                arrow-placement="left"
                arrow-position="bottom: 1.5vw"
              >
              </tooltip>
            </popover>
          </badge-icon>
          <image-btn
            src="/static/image/user_m_3.png"
            wrapper-style="width: 100%; height: 4.5vw"
            img-style="width: 4vw; height: 4vw; border-radius: 2vw"
            @mouseover.native="mouseover('avatar')"
            @mouseleave.native="mouseleave('avatar')"
          >
            <popover ref="avatar" style="left: 5vw; bottom: 0"> </popover>
          </image-btn>
        </div>
      </div>

      <!-- taskbar -->
      <div class="taskbar">
        <div class="taskbar-item-wrapper">
          <h2 class="display-only">
            {{ $t("STORYBOARD") }}
          </h2>
          <div class="project-wrapper">
            <span class="display-only">{{ $t("PROJECTS") }}</span>
            <div class="list-group list-group-flush project-list display-only">
              <a
                style="border: none; border-radius: 5px; padding: 5px"
                @click="projectLabelClick(index)"
                v-for="(item, index) in projects"
                :key="index"
                :class="projectLabel(index)"
                >{{ item.name }}</a
              >
            </div>
            <a
              id="create-project-btn"
              class="list-group-item display-only"
              style="
              width: 100%; 
              margin-top: 5px; 
              border-radius: 5px; 
              padding: 5px; 
              text-align: left; 
              background-color: gainsboro;
              cursor: pointer
              "
              data-toggle="modal"
              data-target="#modal-create-project"
            >
              {{ `+ ${$t("CREATE_PROJECT")}` }}
            </a>
            <div></div>
          </div>
        </div>
        <div class="ad"></div>
      </div>

      <!-- storyboard -->
      <div v-if="errorCode === -1" class="storyboard">
        <mainboard :index="projectSelectedIndex" />
        <router-view></router-view>
      </div>
      <div v-else class="storyboard">
        <div class="storyboard-empty">
          <h1>{{ $t("NETWORK_ERROR_TITLE") }}</h1>
          <h3>{{ $t("NETWORK_ERROR_DESC") }}</h3>
          <div>
            <span
              v-if="reloading"
              class="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
            <a
              v-else
              class="text-primary display-only"
              style="cursor: pointer"
              @click.stop="reload"
              >{{ $t("NETWORK_ERROR_RETRY") }}</a
            >
          </div>
        </div>
      </div>
    </div>

    <!-- modals -->
    <div id="modal-create-project" class="modal fade" role="dialog">
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title display-only">
              {{ $t("CREATE_PROJECT") }}
            </h5>
            <a
              style="font-size: 20px"
              class="display-only"
              aria-hidden="true"
              aria-label="Close"
              data-target="#modal-create-project"
              data-dismiss="modal"
              >&times;</a
            >
          </div>
          <div class="modal-body">
            <create-project-form ref="create-project-form" />
          </div>
          <div class="modal-footer">
            <button
              :disabled="computedCreateBtnDisabled"
              type="submit"
              :class="
                `btn btn-sm btn-${
                  projectCreateStatus === 'done' ? 'success' : 'primary'
                } create-btn`
              "
              @click="createNewProject"
            >
              <span
                v-if="projectCreateStatus === 'doing'"
                class="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
              <span v-else-if="projectCreateStatus === 'todo'">{{
                $t("CREATE")
              }}</span>
              <span v-else>{{ $t("DONE") }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import badgeIcon from "@/components/badgeIcon";
import imageBtn from "@/components/imageBtn";
import popover from "@/components/popover";
import tooltip from "@/components/tooltip";
import mainboard from "@/components/mainboard";
import createProjectForm from "@/components/form/createProject";
import { eventBus } from "@/common/utils/eventBus";
import { bell } from "@/common/theme/icon";
import { mapState, mapMutations } from "vuex";
import { mouseover, mouseleave } from "@/common/utils/mouse";
export default {
  components: {
    badgeIcon,
    imageBtn,
    popover,
    mainboard,
    tooltip,
    createProjectForm
  },
  data() {
    return {
      storyboardLoading: false,
      reloading: false,
      projectCreateStatus: "todo",
      projectSelectedIndex: 0,
      bell,
      errorCode: -1
    };
  },
  computed: {
    ...mapState("user", ["id", "token"]),
    ...mapState("project", ["projects"]),
    ...mapState("team", ["teams"]),
    projectLabel() {
      return function(index) {
        if (index === this.projectSelectedIndex) {
          return "list-group-item list-group-item-primary";
        }
        return "list-group-item list-group-item-action";
      };
    },
    computedCreateBtnDisabled() {
      const { projectCreateStatus } = this;
      if (projectCreateStatus === "todo") return false;
      return true;
    }
  },
  async mounted() {
    try {
      this.storyboardLoading = true;
      const info = await this.fetchInfo();
      this.add_projects(info.projects);
      this.add_teams(info.teams);
      this.add_userinfo(info.user);
    } catch (err) {
      this.errorCode = err.status;
    } finally {
      this.storyboardLoading = false;
    }
  },
  methods: {
    ...mapMutations({
      add_projects: "project/add_projects",
      add_teams: "team/add_teams",
      add_userinfo: "user/add_userinfo"
    }),
    mouseover,
    mouseleave,
    projectLabelClick(index) {
      this.projectSelectedIndex = index;
    },
    async createNewProject() {
      try {
        let createProjectFormEle = this.$refs["create-project-form"];
        if (!createProjectFormEle) return;
        let valid = createProjectFormEle.formCheck();
        if (!valid) return;
        let formData = createProjectFormEle.formData();
        let host = process.env.API_HOST;
        let url = host + "/project/create";
        const createRes = await this.$http.post(
          url,
          {
            ...formData
          },
          { emulateJSON: true }
        );
        this.add_projects(createRes.data.data);
        this.projectCreateStatus = "done";
      } catch (err) {
        this.projectCreateStatus = "todo";
      }
    },
    resetVisibleComponents() {
      return eventBus.$emit("reset-visible-component");
    },
    fetchInfo() {
      return new Promise(async (resolve, reject) => {
        try {
          let host = process.env.API_HOST;
          let url = host + `/user/storyboard?id=${this.id}`;
          const info = await this.$http.get(url);
          return resolve(info.data.data);
        } catch (err) {
          return reject(err);
        }
      });
    },
    async reload() {
      try {
        this.reloading = true;
        const info = await this.fetchInfo();
        this.add_projects(info.projects);
        this.add_teams(info.teams);
        this.add_userinfo(info.user);
      } catch (err) {
        this.errorCode = err.status;
      } finally {
        this.reloading = false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../common/theme/color.css";
@import "../common/theme/container.css";
.storyboard-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 0;
}
.storyboard {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  .menubar {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    height: 100%;
    width: 5%;
    .menubar-empty {
      width: 100%;
      height: 40%;
    }
    .menubar-setting-wrapper {
      width: 100%;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      align-items: center;
      padding-top: 1vh;
      padding-bottom: 1vh;
    }
  }
  .taskbar {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    height: 100%;
    width: 20%;
    border-top-left-radius: 2vw;
    background-color: white;
    border-right-width: 2px;
    border-right-color: whitesmoke;
    border-right-style: dashed;
    .taskbar-item-wrapper {
      width: 100%;
      height: 70%;
      padding: 1vw;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
    }
    .ad {
      width: 100%;
      height: 30%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
  }
  .storyboard {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    height: 100%;
    width: 75%;
    background-color: white;
  }
  .storyboard-empty {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    div {
      display: flex;
      height: 40px;
      width: 120px;
      justify-content: center;
      align-items: center;
    }
  }
}
.project-wrapper {
  width: 90%;
  height: 90%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  .project-list {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    a {
      width: 100%;
      text-align: left;
    }
    a:hover {
      color: black;
    }
    a.list-group-item-primary {
      color: dodgerblue;
    }
  }
}
#create-project-btn:active {
  background-color: whitesmoke;
}
.create-btn {
  height: 30px;
  width: 70px;
  border-radius: 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.list-group-item:active {
  -webkit-box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
  box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
}
</style>
