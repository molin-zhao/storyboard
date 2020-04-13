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
        <img src="/static/logo.png" style="width: 4vw; height: 4vw;" />
        <div class="menubar-empty"></div>
        <div class="menubar-setting-wrapper">
          <badge-icon
            :wrapper-style="bell.wrapperStyle"
            :icon-style="bell.iconStyle"
            badge-class="badge-danger badge-pill"
            :icon-name="bell.iconName"
            :number="computedUnreadMessageCount"
            @click.native.stop="showMailbox"
          >
            <popover ref="bell" style="left: 6vw; bottom: 0;">
              <tooltip
                content-style="width: 200px; height: 200px"
                arrow-placement="left"
                arrow-position="bottom: 1.5vw"
              >
              </tooltip>
            </popover>
          </badge-icon>
          <image-btn
            :src="avatar"
            default-img="/static/image/user_empty.png"
            wrapper-style="width: 100%; height: 4.5vw"
            img-style="width: 54px; height: 54px; border-radius: 27px"
            @mouseover.native="mouseover('avatar')"
            @mouseleave.native="mouseleave('avatar')"
          >
            <popover ref="avatar" style="left: 6vw; bottom: 0;">
              <tooltip
                content-style="
                width: 300px;
                height: 300px;
                border-radius: 10px;
                box-shadow: -5px 2px 5px lightgrey; 
                -webkit-box-shadow: -5px 2px 5px lightgrey;
                border: 1px solid whitesmoke;
                "
                arrow-placement="left"
                arrow-position="bottom: 1.5vw"
                background-color="white"
                border-color="whitesmoke"
              >
                <div class="settings">
                  <a
                    @click="goTo('mainboard')"
                    style="
                      border-top: none;
                      border-top-left-radius: 10px;
                      border-top-right-radius: 10px;
                    "
                  >
                    <icon
                      class="setting-icon"
                      name="tasks"
                      style="color: black;"
                    />
                    <span style="color: black;">{{ $t("MAINBOARD") }}</span>
                  </a>
                  <a @click="goTo('team')">
                    <icon
                      class="setting-icon"
                      name="team"
                      style="color: black;"
                    />
                    <span style="color: black;">{{ $t("TEAM") }}</span>
                  </a>
                  <a @click="goTo('warehouse')">
                    <icon
                      class="setting-icon"
                      name="warehouse"
                      style="color: black;"
                    />
                    <span style="color: black;">{{ $t("WAREHOUSE") }}</span>
                  </a>
                  <a @click="goTo('settings')">
                    <icon
                      class="setting-icon"
                      name="setting"
                      style="color: black;"
                    />
                    <span style="color: black;">{{ $t("SETTINGS") }}</span>
                  </a>
                  <a @click="goTo('account')">
                    <icon
                      class="setting-icon"
                      name="account"
                      style="color: black;"
                    />
                    <span style="color: black;">{{ $t("PROFILE") }}</span>
                  </a>
                  <a
                    @click="logout"
                    style="
                      border-bottom: none;
                      border-bottom-left-radius: 10px;
                      border-bottom-right-radius: 10px;
                    "
                  >
                    <icon
                      class="setting-icon"
                      name="exit"
                      style="color: var(--main-color-danger);"
                    />
                    <span style="color: var(--main-color-danger);">{{
                      $t("LOGOUT")
                    }}</span>
                  </a>
                </div>
              </tooltip>
            </popover>
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
              <vue-scroll :ops="ops">
                <a
                  style="
                  border: none;
                  border-radius: 5px;
                  padding: 5px;
                  cursor: pointer;
                "
                  @click="projectLabelClick(index)"
                  v-for="(item, index) in projects"
                  :key="index"
                  :class="projectLabel(index)"
                  >{{ item.name
                  }}<span
                    v-if="isEdited(logs[item._id])"
                    class="editing-badge"
                    :style="computedProjectEditedStyle(index)"
                  ></span
                ></a>
              </vue-scroll>
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
                cursor: pointer;
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
        <router-view></router-view>
      </div>
      <div v-else class="storyboard">
        <div class="storyboard-empty">
          <h1>{{ $t("NETWORK_ERROR_TITLE") }}</h1>
          <h3>{{ $t("NETWORK_ERROR_DESC") }}</h3>
          <div>
            <span
              v-if="reloading"
              class="spinner-border spinner-border-sm text-primary"
              role="status"
              aria-hidden="true"
            ></span>
            <a
              v-else
              class="text-primary display-only"
              style="cursor: pointer;"
              @click.stop="reload"
              >{{ $t("NETWORK_ERROR_RETRY") }}</a
            >
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
import vueScroll from "vuescroll";
import * as URL from "@/common/utils/url";
import { eventBus } from "@/common/utils/eventBus";
import { bell, ops } from "@/common/theme/style";
import { mapState, mapMutations, mapActions } from "vuex";
import { mouseover, mouseleave, mouseclick } from "@/common/utils/mouse";
import {
  createSocketConnection,
  getNotifyMembers
} from "@/common/utils/socket";
import { isEdited, generateLookup } from "@/common/utils/log";
import { getUnreadCount } from "@/common/utils/message";
export default {
  components: {
    badgeIcon,
    imageBtn,
    popover,
    tooltip,
    vueScroll
  },
  data() {
    return {
      storyboardLoading: false,
      reloading: false,
      bell,
      ops,
      errorCode: -1
    };
  },
  computed: {
    ...mapState("user", [
      "id",
      "token",
      "avatar",
      "username",
      "gender",
      "phone",
      "email"
    ]),
    ...mapState("project", ["projects", "activeIndex", "logs"]),
    ...mapState("team", ["teams"]),
    ...mapState("message", ["messages"]),
    projectLabel() {
      return function(index) {
        if (index === this.activeIndex) {
          return "list-group-item list-group-item-primary";
        }
        return "list-group-item list-group-item-action";
      };
    },
    computedProjectEditedStyle() {
      return function(index) {
        const { activeIndex } = this;
        if (index === activeIndex) return "background-color: #6495ed";
        return "background-color: lightgrey";
      };
    },
    computedUnreadMessageCount() {
      const { messages } = this;
      return getUnreadCount(messages);
    }
  },
  async mounted() {
    try {
      const { id, token } = this;
      this.storyboardLoading = true;
      const info = await this.fetchInfo();
      this.reload_projects(info.projects);
      this.reload_teams(info.teams);
      this.add_userinfo(info.user);
      this.save_userinfo(info.user);
      this.restore_message();
      this.add_socket(
        createSocketConnection({
          id,
          token,
          nList: getNotifyMembers(info.projects)
        })
      );
    } catch (err) {
      this.errorCode = err.status;
    } finally {
      this.storyboardLoading = false;
    }
  },
  methods: {
    ...mapActions({
      save_userinfo: "user/save_userinfo",
      remove_credential: "/user/remove_credential",
      remove_userinfo: "user/remove_userinfo",
      restore_message: "message/restore_message"
    }),
    ...mapMutations({
      reload_projects: "project/reload_projects",
      select_index: "project/select_index",
      add_lookup: "project/add_lookup",
      reload_teams: "team/reload_teams",
      add_userinfo: "user/add_userinfo",
      add_socket: "user/add_socket"
    }),
    mouseover,
    mouseleave,
    mouseclick,
    isEdited,
    projectLabelClick(index) {
      this.select_index(index);
      if (this.$route.name !== "mainboard") {
        console.log("go to mainboard");
        this.$router.replace("/storyboard");
      }
    },
    resetVisibleComponents() {
      return eventBus.$emit("reset-visible-component");
    },
    fetchInfo() {
      return new Promise(async (resolve, reject) => {
        try {
          let url = URL.GET_USER_STORYBOARD(this.id);
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
        this.reload_projects(info.projects);
        this.reload_teams(info.teams);
        this.add_userinfo(info.user);
        this.save_userinfo(info.user);
        this.restore_message();
        this.errorCode = -1;
      } catch (err) {
        this.errorCode = err.status;
      } finally {
        this.reloading = false;
      }
    },
    logout() {
      this.$confirm.show({
        title: this.$t("LOGOUT_TITLE"),
        message: this.$t("LOGOUT_MESSAGE"),
        success: async () => {
          try {
            let url = URL.GET_LOGOUT(this.id);
            this.storyboardLoading = true;
            const logout = await this.$http.get(url);
            this.remove_credential();
            this.remove_userinfo();
            this.storyboardLoading = false;
            this.$router.replace("/");
          } catch (err) {
            console.log(err);
            this.storyboardLoading = false;
          }
        },
        confirmLabel: this.$t("CONFIRM"),
        cancelLabel: this.$t("CANCEL")
      });
    },
    goTo(route) {
      if (this.$route.name !== route) return this.$router.push({ name: route });
    },
    showMailbox() {
      const { id, avatar, username, gender } = this;
      this.$mailbox.show();
    }
  },
  watch: {
    projects: {
      deep: true,
      handler: function(newValue, oldValue) {
        console.log("project changed");
        let oldProjectKeys = oldValue.map(pro => pro._id);
        let newProjectKeys = newValue.map(pro => pro._id);
        if (newProjectKeys.toString() !== oldProjectKeys.toString()) {
          const lookups = generateLookup(newValue);
          this.add_lookup(lookups);
        }
      }
    }
  }
};
</script>

<style lang="scss" scoped>
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
    max-height: 90%;
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
.list-group-item:active {
  -webkit-box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
  box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
}
.editing-badge {
  width: 10px;
  height: 10px;
  background-color: green;
  border-radius: 5px;
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
}
</style>
