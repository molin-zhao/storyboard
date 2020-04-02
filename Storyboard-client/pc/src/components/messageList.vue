<template>
  <div class="message-list-wrapper">
    <div class="header">
      <h4>{{ $t("MAILBOX") }}</h4>
    </div>
    <div v-if="computedMessagesKeys.length === 0" class="body-empty">
      <h5>{{ $t("NO_MESSAGE") }}</h5>
    </div>
    <div v-else class="body-list">
      <div
        class="message-cell"
        v-for="(from, index) in computedMessagesKeys"
        :key="index"
      >
        <message
          :from="from"
          :message="messages[from]"
          @click.native.stop="selectCell(from)"
        />
      </div>
    </div>
  </div>
</template>
<script>
import message from "@/components/message";
import { mapState } from "vuex";
export default {
  components: {
    message
  },
  computed: {
    ...mapState("message", ["messages"]),
    computedMessagesKeys() {
      const { messages } = this;
      return Object.keys(messages);
    }
  },
  methods: {
    selectCell(from) {
      const { messages } = this;
      let avatar = messages[from]["avatar"];
      let username = messages[from]["username"];
      let gender = messages[from]["gender"];
      let fromUser = {
        _id: from,
        avatar,
        username,
        gender
      };
      this.$emit("on-select", fromUser);
    }
  }
};
</script>
<style lang="scss">
.message-list-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}
.header {
  width: 100%;
  height: 10%;
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-bottom: 1px gainsboro solid;
}
.body-empty {
  width: 100%;
  height: 90%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.body-list {
  width: 100%;
  height: 90%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}
.message-cell {
  width: 100%;
  height: 100px;
  border-bottom: 1px gainsboro solid;
}
</style>
