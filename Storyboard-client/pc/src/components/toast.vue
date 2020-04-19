<template>
  <div
    v-show="visible"
    class="toast-wrapper shadow"
    role="alert"
    aria-live="polite"
    aria-atomic="true"
  >
    <div class="toast-header">
      <strong class="mr-auto">{{ $t("NOTIFICATION") }}</strong>
      <small>{{ $t("JUST_NOW") }}</small>
      <button
        @click.stop="resetTimer"
        type="button"
        class="ml-2 mb-1 close"
        aria-label="Close"
      >
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="toast-body" style="position: relative">
      <div class="toast-body-content" v-if="isType('online-offline')">
        <div class="user-avatar">
          <avatar
            style="width: 20px; height: 20px; border-radius: 10px"
            :src="computedUserAvatar"
            :user-id="computedUserId"
          />
        </div>
        <span class="user-name">{{ computedUsername }}</span>
        <span class="online-label">{{ computedUserOnlineOffline }}</span>
      </div>
      <div class="toast-body-content" v-else-if="isType('receive-message')">
        <div class="user-avatar">
          <avatar
            style="width: 20px; height: 20px; border-radius: 10px"
            :src="computedUserAvatar"
            :user-id="computedUserId"
          />
        </div>
        <span class="user-message">{{ message }}</span>
        <span class="message-label">{{ computedUnreadMessageCount }}</span>
      </div>
      <div
        class="toast-body-content"
        :style="computedSaveProjectLabelStyle"
        v-else-if="isType('save-project')"
      >
        <div class="user-avatar">
          <icon
            :name="computedSaveProjectIconName"
            :style="computedSaveProjectIconStyle"
          />
        </div>
        <span class="save-project-text">{{ comoputedSaveProjectName }}</span>
        <span class="save-project-label">{{ computedSaveProjectLabel }}</span>
      </div>
      <div class="toast-body-content" v-else></div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { getUnreadCount } from "@/common/utils/message";
import avatar from "@/components/avatar";
export default {
  components: {
    avatar
  },
  data() {
    return {
      visible: false,
      dismissTimer: null
    };
  },
  props: {
    meta: {
      type: Object,
      default: () => {}
    },
    messageType: {
      type: String,
      default: "receive-message"
    },
    message: {
      type: String,
      default: ""
    },
    interval: {
      type: Number,
      default: 5000
    }
  },
  computed: {
    ...mapState("message", ["messages"]),
    ...mapState("project", [
      "globalProjectMembers",
      "projectLookup",
      "projects"
    ]),
    computedUnreadMessageCount() {
      const { messages } = this;
      let unreadCount = getUnreadCount(messages);
      let unreadLabel = this.$t("UNREAD_MESSAGE");
      if (!unreadCount) return "";
      if (unreadCount > 99) return `[99+${unreadLabel}]`;
      return `[${unreadCount} ${unreadLabel}]`;
    },
    isType() {
      return function(type) {
        const { messageType } = this;
        return messageType === type;
      };
    },
    computedUsername() {
      const { meta } = this;
      if (meta && meta["username"]) return meta["username"];
      return "";
    },
    computedUserAvatar() {
      const { meta } = this;
      if (meta && meta["avatar"]) return meta["avatar"];
      return "";
    },
    computedUserId() {
      const { meta } = this;
      if (meta && meta["_id"]) return meta["_id"];
      return "";
    },
    computedUserOnlineOffline() {
      const { message } = this;
      if (message === "online") return this.$t("USER_ONLINE");
      return this.$t("USER_OFFLINE");
    },
    computedSaveProjectIconName() {
      const { message } = this;
      if (message === "success") return "check";
      return "warning";
    },
    computedSaveProjectIconStyle() {
      const { message } = this;
      if (message === "success") return "color: #5cb85c";
      return "color: #f0ad4e";
    },
    computedSaveProjectLabelStyle() {
      const { message } = this;
      if (message === "success") return "color: #5cb85c";
      return "color: #f0ad4e";
    },
    computedSaveProjectLabel() {
      const { message } = this;
      if (message === "success") return this.$t("SAVED");
      return this.$t("UNSAVED");
    },
    comoputedSaveProjectName() {
      const { meta, projectLookup, projects } = this;
      if (meta && meta["_id"]) {
        let projectId = meta["_id"];
        let projectIndex = projectLookup[projectId][0];
        let projectName = projects[projectIndex]["name"];
        return projectName;
      }
      return "";
    }
  },
  methods: {
    show() {
      if (!this.visible) {
        this.visible = true;
        this.dismissTimer = setTimeout(() => {
          if (this) {
            this.visible = false;
            this.resetTimer();
          }
        }, this.interval);
      } else {
        // already visible, reset dismiss timer
        if (this.dismissTimer) clearTimeout(this.dismissTimer);
        this.dismissTimer = setTimeout(() => {
          if (this) {
            this.visible = false;
            this.resetTimer();
          }
        }, this.interval);
      }
    },
    dismiss() {
      this.visible = false;
    },
    resetTimer() {
      if (this.visible) this.visible = false;
      if (this.dismissTimer) clearTimeout(this.dismissTimer);
      this.dismissTimer = null;
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../common/theme/container.css";
.toast-wrapper {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10048 !important;
  background-color: white;
  border: whitesmoke 1px solid;
  border-radius: 5px;
  max-width: 350px;
  min-width: 220px;
}
.toast-body-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  span {
    font-size: 14px;
  }
  .user-avatar {
    width: 15%;
    min-width: 25px;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
  }
  .user-name {
    width: 45%;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    color: lightgrey;
  }
  .message-label {
    width: 35%;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    color: orangered;
  }
  .online-label {
    width: 40%;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    font-weight: bold;
    color: black;
  }
  .user-message {
    max-width: 50%;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    color: lightgrey;
  }
  .save-project-label {
    width: 40%;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    font-weight: bold;
  }
  .save-project-text {
    max-width: 40%;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
}
</style>
