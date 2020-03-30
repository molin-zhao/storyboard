<template>
  <div class="message-wrapper display-only">
    <div class="message-to" v-if="computedMessageSent">
      <div class="message-option">
        <span
          v-if="computedMessagePending"
          class="spinner-border spinner-border-sm"
          style="color: gainsboro"
          role="status"
          aria-hidden="true"
        ></span>
        <badge-icon
          v-else-if="computedMessageFailed"
          :wrapper-style="messageWarning.wrapperStyle"
          :icon-style="messageWarning.iconStyle"
          :icon-name="messageWarning.iconName"
          :reverse="true"
          @click.native="mouseclick('failed-message')"
        >
          <popover
            ref="failed-message"
            style="right: 0; top: calc(100% + 10px)"
          >
            <tooltip
              background-color="white"
              border-color="whitesmoke"
              contentStyle="width: 150px; height: 100px; background-color: white; border-radius: 10px; box-shadow: -5px 2px 5px lightgrey; -webkit-box-shadow: -5px 2px 5px lightgrey; border: 1px solid whitesmoke"
            >
              <div class="settings-top-align">
                <a
                  @click="resendMessage"
                  style="border-top: none; border-top-left-radius: 10px; border-top-right-radius: 10px"
                >
                  <icon
                    class="setting-icon"
                    name="send"
                    style="color: #6495ed"
                  />
                  <span style="color: #6495ed">{{ $t("RESEND_MESSAGE") }}</span>
                </a>
                <a
                  @click="deleteMessage"
                  style="border-bottom: none; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px"
                >
                  <icon
                    class="setting-icon"
                    name="delete"
                    style="color: var(--main-color-danger)"
                  />
                  <span style="color: var(--main-color-danger)">{{
                    $t("DELETE_MESSAGE")
                  }}</span>
                </a>
              </div>
            </tooltip>
          </popover>
        </badge-icon>
        <div v-else></div>
      </div>
      <div class="message-content">
        <div style="background-color: #5cb85cE6">
          <span>{{ message.content }}</span>
        </div>
      </div>
      <div class="message-avatar-wrapper">
        <avatar :src="avatar" class="message-avatar" />
      </div>
    </div>
    <div class="message-from" v-else>
      <div class="message-avatar-wrapper">
        <avatar :src="message.from.avatar" class="message-avatar" />
      </div>
      <div class="message-content">
        <div style="background-color: whitesmoke">
          <span>{{ message.content }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import popover from "@/components/popover";
import tooltip from "@/components/tooltip";
import badgeIcon from "@/components/badgeIcon";
import avatar from "@/components/avatar";
import { mapMutations, mapState } from "vuex";
import { mouseclick } from "@/common/utils/mouse";
export default {
  components: {
    popover,
    tooltip,
    badgeIcon,
    avatar
  },
  props: {
    message: {
      type: Object,
      default: () => {}
    }
  },
  computed: {
    ...mapState("user", ["socket", "id", "avatar"]),
    ...mapState("message", ["pendingMessages", "failedMessages"]),
    computedMessagePending() {
      const { pendingMessages, message } = this;
      if (pendingMessages.indexOf(message._id) !== -1) return true;
      return false;
    },
    computedMessageFailed() {
      // const { failedMessages, message } = this;
      // if (failedMessages.indexOf(message._id) !== -1) return true;
      // return false;
      return true;
    },
    computedMessageSent() {
      const { message, id } = this;
      return message.from._id === id;
    },
    messageWarning() {
      return {
        wrapperStyle: {
          plain: "width: 20px; height: 20px; cursor: pointer"
        },
        iconStyle: {
          plain: "width: 100%; height: 100%; color: var(--main-color-danger);",
          active: "color: cornflowerblue;"
        },
        iconName: {
          plain: "warning"
        }
      };
    }
  },
  methods: {
    ...mapMutations({
      add_pending: "message/add_pending",
      remove_pending: "message/remove_pending",
      add_failed: "message/add_failed",
      remove_failed: "message/remove_failed",
      save_message: "message/save_message",
      remove_message: "message/remove/message"
    }),
    mouseclick,
    resendMessage(message) {
      const { socket } = this;
      if (!socket)
        return this.$alert.show({
          type: "warning",
          message: this.$t("SEND_MESSAGE_ERROR"),
          interval: 5000
        });
      this.add_pending(message._id);
      this.remove_failed(messasge._id);
      this.save_message();
      socket.emit("send-message", message, ack => {
        if (!ack) this.add_failed(message._id);
        this.remove_pending(message._id);
        this.save_message();
      });
    },
    deleteMessage(message) {
      this.remove_pending(message._id);
      this.remove_failed(message._id);
      this.remove_message(message._id);
    },
    messageWarningClickInside() {
      console.log("inside");
      return this.mouseclick("failed-message");
    },
    messageWarningClickOutside() {
      console.log("outside");
      return this.mouseclick("failed-message");
    }
  }
};
</script>

<style lang="scss" scoped>
.message-wrapper {
  width: 100%;
}
.message-from {
  width: 100%;
  padding: 10px 0px 10px 0px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
}
.message-to {
  width: 100%;
  padding: 10px 0px 10px 0px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: flex-start;
}
.message-avatar-wrapper {
  width: 20%;
  min-width: 50px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  .message-avatar {
    width: 36px;
    height: 36px;
    border-radius: 18px;
  }
}
.message-content {
  max-width: 60%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  div {
    width: 100%;
    padding: 5px 15px 5px 15px;
    border-radius: 10px;
    flex-wrap: wrap;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    span {
      width: 100%;
      font-size: 16px;
      color: black;
    }
  }
}
.message-option {
  width: 15%;
  min-width: 30px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding-top: 10px;
  position: relative;
}
</style>
