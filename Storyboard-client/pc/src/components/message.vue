<template>
  <a class="message-wrapper display-only">
    <div class="message-avatar">
      <avatar class="avatar" :src="computedUserAvatar" />
    </div>
    <div class="message-meta">
      <span>{{ computedUsername }}</span>
      <span style="color: grey">{{ computedLastMessage }}</span>
    </div>
    <div class="message-badge">
      <span class="badge badge-danger">{{ computedUnreadMessageCount }}</span>
    </div>
  </a>
</template>

<script>
import avatar from "@/components/avatar";
export default {
  components: {
    avatar
  },
  props: {
    message: {
      type: Object,
      required: true
    },
    from: {
      type: String,
      required: true
    }
  },
  computed: {
    computedUnreadMessageCount() {
      const { message, from } = this;
      let messageArr = message["messages"];
      let count = 0;
      for (let i = messageArr.length - 1; i >= 0; i--) {
        if (!messageArr[i]["read"]) count++;
      }
      return count > 0 ? count : null;
    },
    computedLastMessage() {
      const { message } = this;
      let lastMessage = message["messages"].pop();
      return lastMessage ? lastMessage.content : "";
    },
    computedUsername() {
      const { message, from } = this;
      return message["username"];
    },
    computedUserAvatar() {
      const { message } = this;
      return message["avatar"];
    }
  }
};
</script>

<style lang="scss" scoped>
.message-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  cursor: pointer;
}
.message-wrapper:active {
  -webkit-box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
  box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
}
.message-avatar {
  width: 15%;
  height: 100%;
  min-width: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .avatar {
    width: 30px;
    height: 30px;
    border-radius: 15px;
  }
}
.message-meta {
  width: 75%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  span {
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: left;
    white-space: nowrap;
    width: 95%;
  }
}
</style>
