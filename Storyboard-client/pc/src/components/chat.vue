<template>
  <div class="chat-wrapper">
    <span
      v-if="!to || loading"
      class="spinner-border spinner-border-bg"
      role="status"
      aria-hidden="true"
    ></span>
    <div v-else class="chat">
      <div class="chat-user">
        <div class="chat-user-avatar-wrapper">
          <avatar class="chat-user-avatar" :user-id="to._id" :src="to.avatar" />
        </div>
        <div class="chat-user-meta">
          <div class="chat-user-label">
            <icon
              v-if="to.gender === 'm'"
              name="male"
              style="color: cornflowerblue"
            />
            <icon v-else name="female" style="color: lightpink" />
            <online-status style="margin-left: 5px" :status="onlineStatus" />
          </div>
          <div class="chat-user-name">
            <span>{{ to.username }}</span>
          </div>
        </div>
      </div>
      <div class="chat-body">
        <vue-scroll :ops="ops">
          <chat-message
            v-for="(message, index) in computedMessages"
            :key="index"
            :message="message"
          />
        </vue-scroll>
        <div class="chat-input">
          <chat-input @send-message="sendMessage" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import vueScroll from "vuescroll";
import avatar from "@/components/avatar";
import onlineStatus from "@/components/onlineStatus";
import chatInput from "@/components/chatInput";
import chatMessage from "@/components/chatMessage";
import { stopPropagation, mouseclick } from "@/common/utils/mouse";
import { mapState, mapMutations } from "vuex";
import * as URL from "@/common/utils/url";
import { createMessage } from "@/common/utils/message";

export default {
  components: {
    vueScroll,
    avatar,
    onlineStatus,
    chatInput,
    chatMessage
  },
  props: {
    to: {
      type: Object,
      default: () => null
    },
    font: {
      type: String,
      default: "kai"
    }
  },
  data() {
    return {
      visible: false,
      loading: false,
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
      onlineStatus: false
    };
  },
  computed: {
    ...mapState("user", [
      "id",
      "token",
      "avatar",
      "gender",
      "username",
      "socket"
    ]),
    ...mapState("message", ["messages", "pendingMessages", "failedMessages"]),
    computedMessages() {
      const { messages, to } = this;
      if (messages[to._id]) return messages[to._id]["messages"];
      return [];
    }
  },
  methods: {
    ...mapMutations({
      save_message: "message/save_message",
      append_message: "message/append_message",
      add_pending: "message/add_pending",
      remove_pending: "message/remove_pending",
      add_failed: "message/add_failed",
      remove_failed: "message/remove_failed"
    }),
    mouseclick,
    stopPropagation,
    show() {
      if (!this.visible) {
        this.visible = true;
      }
    },
    hide() {
      if (this.visible) {
        this.visible = false;
      }
    },
    sendMessage(val) {
      const { socket, id, to, gender, avatar, username } = this;
      console.log(socket);
      if (!socket)
        return this.$alert.show({
          type: "warning",
          message: this.$t("SEND_MESSAGE_ERROR"),
          interval: 5000
        });

      let data = createMessage(
        "chat",
        val,
        {
          _id: id,
          gender,
          avatar,
          username
        },
        to._id
      );
      this.add_pending(data._id);
      this.append_message(data);
      this.save_message();
      socket.emit("send-message", data, ack => {
        if (!ack) this.add_failed(data._id);
        this.remove_pending(data._id);
        this.save_message();
      });
    }
  },
  watch: {
    async to(newVal, oldVal) {
      if (newVal) {
        try {
          const { _id } = newVal;
          this.loading = true;
          let url = URL.GET_USER_ONLINE(_id);
          const resp = await this.$http.get(url);
          this.onlineStatus = resp.data.data;
        } catch (err) {
          console.log(err);
        } finally {
          this.loading = false;
        }
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.chat-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.chat {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  .chat-user {
    width: 100%;
    height: 10%;
    padding: 10px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    border-bottom: 1px gainsboro solid;
    .chat-user-avatar-wrapper {
      height: 100%;
      width: 20%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
    }
    .chat-user-avatar {
      width: 50px;
      height: 50px;
      border-radius: 25px;
    }
    .chat-user-meta {
      width: calc(100% - 50px);
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    .chat-user-label {
      width: 100%;
      height: 25%;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
    }
    .chat-user-name {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      flex-wrap: nowrap;
      width: 100%;
      height: 25%;
      span {
        overflow: hidden;
        text-overflow: ellipsis;
        text-align: left;
        white-space: nowrap;
        width: 95%;
      }
    }
  }
  .chat-body {
    width: 100%;
    height: 90%;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    background-color: #f5f5f580;
  }
}
.chat-input {
  position: absolute;
  bottom: 0;
  border-top: 0.2px lightgrey solid;
  padding: 15px 0px 15px 5px;
  width: 100%;
  background-color: whitesmoke;
}
</style>
