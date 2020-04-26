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
          />
          <badge-icon
            :wrapper-style="user.wrapperStyle"
            :icon-style="user.iconStyle"
            :icon-name="user.iconName"
            :number="0"
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
                  <div class="settings-user-thumbnail">
                    <div class="thumbnail-user">
                      <avatar
                        style="width: 50px; height: 50px; border-radius: 25px"
                        :src="avatar"
                        :user-id="id"
                      />
                      <div class="thumbnail-username">
                        <icon
                          :name="computedUserGenderName"
                          :style="computedUserGenderStyle"
                        />
                        <span>{{ username }}</span>
                      </div>
                    </div>
                    <div v-if="socketConnecting" class="thumbnail-status">
                      <div class="connecting">
                        <span
                          class="spinner-grow spinner-grow-sm"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        <span>{{ $t("CONNECTING") }}</span>
                      </div>
                    </div>
                    <div v-else class="thumbnail-status">
                      <online-status :status="computedIsOnline" />
                      <a
                        v-if="!computedIsOnline"
                        class="reconnect"
                        @click="connectToServer"
                      >
                        {{ $t("RECONNECT") }}
                      </a>
                    </div>
                  </div>
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
                  <!-- <a @click="goTo('warehouse')">
                    <icon
                      class="setting-icon"
                      name="warehouse"
                      style="color: black;"
                    />
                    <span style="color: black;">{{ $t("WAREHOUSE") }}</span>
                  </a> -->
                  <!-- <a @click="goTo('settings')">
                    <icon
                      class="setting-icon"
                      name="setting"
                      style="color: black;"
                    />
                    <span style="color: black;">{{ $t("SETTINGS") }}</span>
                  </a> -->
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
          </badge-icon>
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
        <mainboard v-show="viewIsVisible('mainboard')" />
        <settings v-show="viewIsVisible('settings')" />
        <profile v-show="viewIsVisible('profile')" />
        <warehouse v-show="viewIsVisible('warehouse')" />
        <team v-show="viewIsVisible('team')" />
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
import onlineStatus from "@/components/onlineStatus";
import avatar from "@/components/avatar";
import vueScroll from "vuescroll";
import settings from "@/router-views/settings";
import profile from "@/router-views/profile";
import mainboard from "@/router-views/mainboard";
import warehouse from "@/router-views/warehouse";
import team from "@/router-views/team";
import * as URL from "@/common/utils/url";
import { eventBus } from "@/common/utils/eventBus";
import { bell, user, ops } from "@/common/theme/style";
import { mapState, mapMutations, mapActions } from "vuex";
import { mouseover, mouseleave, mouseclick } from "@/common/utils/mouse";
import { parser } from "@/common/utils/array";
import {
  createSocketConnection,
  establishSocketConnection,
  fetchUserMessages
} from "@/common/utils/socket";
import { isEdited, generateLookup } from "@/common/utils/log";
import { getUnreadCount } from "@/common/utils/message";
export default {
  components: {
    badgeIcon,
    imageBtn,
    popover,
    tooltip,
    onlineStatus,
    avatar,
    vueScroll,
    mainboard,
    settings,
    profile,
    warehouse,
    team
  },
  data() {
    return {
      storyboardLoading: false,
      reloading: false,
      socketConnecting: false,
      visibleView: "mainboard",
      viewNames: ["mainboard", "settings", "profile", "warehouse", "team"],
      bell,
      user,
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
      "email",
      "socket"
    ]),
    ...mapState("project", [
      "projects",
      "activeIndex",
      "logs",
      "globalProjectMembers"
    ]),
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
      return getUnreadCount(this.messages);
    },
    computedUserGenderName() {
      const { gender } = this;
      if (gender === "m") return "malebody";
      return "femalebody";
    },
    computedUserGenderStyle() {
      const { gender } = this;
      if (gender === "m") return "color: cornflowerblue";
      return "color: lightpink";
    },
    computedIsOnline() {
      const { socket } = this;
      return socket && socket.connected;
    },
    viewIsVisible() {
      return function(route) {
        const { visibleView } = this;
        return visibleView === route;
      };
    }
  },
  async mounted() {
    await this.fetchInfo();
    await this.connectToServer();
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
      add_socket: "user/add_socket",
      remove_socket: "user/remove_socket",
      update_global_members: "project/update_global_members",
      update_global_member_status: "project/update_global_member_status",
      push_messages: "message/push_messages",
      save_message: "message/save_message"
    }),
    mouseover,
    mouseleave,
    mouseclick,
    isEdited,
    projectLabelClick(index) {
      this.select_index(index);
      this.goTo("mainboard");
    },
    resetVisibleComponents() {
      return eventBus.$emit("reset-visible-component");
    },
    fetchInfo() {
      return new Promise(async (resolve, reject) => {
        try {
          const url = URL.GET_USER_STORYBOARD(this.id);
          this.storyboardLoading = true;
          const resp = await this.$http.get(url);
          const info = resp.data.data;
          this.reload_projects(info.projects);
          this.reload_teams(info.teams);
          this.add_userinfo(info.user);
          this.save_userinfo(info.user);
          this.storyboardLoading = false;
          return resolve(info.user);
        } catch (err) {
          this.errorCode = err.status;
          this.storyboardLoading = false;
          return reject(err);
        }
      });
    },
    connectToServer() {
      return new Promise(async (resolve, reject) => {
        try {
          const { id, token, username, avatar, gender } = this;
          const userInfo = { id, token, username, avatar, gender };
          this.socketConnecting = true;
          this.restore_message();
          const getUrl = URL.GET_USER_MESSAGE(id);
          const getResp = await this.$http.get(getUrl);
          const msg = getResp.data.data;
          if (msg.length > 0) {
            let messageIds = parser(msg, "_id");
            const delUrl = URL.POST_DEL_USER_MESSAGE();
            const delResp = await this.$http.post(delUrl, { id, messageIds });
          }
          const socket = createSocketConnection({
            online: this.userOnlineCallback,
            offline: this.userOfflineCallback,
            receiveMessage: this.userReceiveMessageCallback
          });
          socket.emit("establish-connection", userInfo, ack => {
            if (!ack) {
              socket.close();
              throw new Error("connect failed");
            } else {
              console.log("connected");
              this.add_socket(socket);
              this.push_messages(msg);
              this.save_message();
              this.socketConnecting = false;
              return resolve();
            }
          });
        } catch (err) {
          this.socketConnecting = false;
          return reject(err);
        }
      });
    },
    async reload() {
      try {
        const { id, token } = this;
        const url = URL.GET_USER_STORYBOARD(id);
        this.reloading = true;
        const resp = await this.$http.get(url);
        const info = resp.data.data;
        this.reload_projects(info.projects);
        this.reload_teams(info.teams);
        this.add_userinfo(info.user);
        this.save_userinfo(info.user);
        this.errorCode = -1;
      } catch (err) {
        this.errorCode = err.status;
      } finally {
        this.reloading = false;
      }
    },
    async getNewMembersOnlineStatus(projects) {
      try {
        const { id, globalProjectMembers, socket } = this;
        let newMembers = [];
        for (let project of projects) {
          let members = project["members"];
          for (let member of members) {
            let memberId = member["_id"];
            if (
              memberId !== id &&
              typeof globalProjectMembers[memberId] === "undefined"
            ) {
              newMembers.push(memberId);
            }
          }
        }
        if (newMembers.length > 0) {
          const resp = await this.$http.post(url, { memberIds: newMembers });
          this.update_global_members(resp.data.data);
          if (socket && socket.connected)
            socket.emit("notify-list", newMembers);
        }
      } catch (err) {}
    },
    userOnlineCallback(user) {
      const { globalProjectMembers } = this;
      const userId = user["_id"];
      if (!userId) return;
      if (globalProjectMembers[userId] === false) {
        let payload = { user, status: "online" };
        this.update_global_member_status(payload);
        this.$toast.show({
          meta: user,
          message: "online",
          messageType: "online-offline",
          interval: 5000
        });
      }
    },
    userOfflineCallback(user) {
      const { globalProjectMembers } = this;
      const userId = user["_id"];
      if (!userId) return;
      if (globalProjectMembers[userId] === true) {
        let payload = { user, status: "offline" };
        this.update_global_member_status(payload);
        this.$toast.show({
          meta: user,
          message: "offline",
          messageType: "online-offline",
          interval: 5000
        });
      }
    },
    userReceiveMessageCallback(message) {
      this.push_messages(message);
      this.save_message();
      this.$toast.show({
        meta: message["from"],
        message: message["content"],
        messageType: "receive-message",
        interval: 5000
      });
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
      const { visibleView, viewNames } = this;
      if (viewNames.indexOf(route) === -1) {
        this.visibleView = viewNames[0];
      } else {
        if (visibleView !== route) this.visibleView = route;
      }
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
          // root index changed
          const lookups = generateLookup(newValue);
          this.add_lookup(lookups);
        }
        this.getNewMembersOnlineStatus(newValue);
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
.settings-user-thumbnail {
  width: 100%;
  height: 100px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  .thumbnail-user {
    width: 60%;
    height: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    .thumbnail-username {
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      align-items: flex-start;
      flex: 1;
      height: 60%;
      padding: 10px;
      span {
        text-align: left;
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 14px;
      }
    }
  }
  .thumbnail-status {
    width: 40%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-end;
    position: relative;
    .connecting {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      align-items: center;
      font-size: 14px;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      color: gray;
    }
    .reconnect {
      position: absolute;
      bottom: 10px;
      width: 60%;
      height: 20px;
      border-radius: 10px;
      background-color: lightblue;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-content: center;
      color: var(--main-color-blue);
      font-size: 12px;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }
    .reconnect:active {
      -webkit-box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
      box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
    }
  }
}
</style>
