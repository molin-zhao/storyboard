<template>
  <div class="user-wrapper" style="border-bottom: 1px gainsboro solid">
    <div class="avatar">
      <avatar :src="item.avatar" class="avatar-img" />
    </div>
    <div class="user-meta">
      <div class="status">
        <icon :name="computedGender" :style="computedGenderStyle" />
        <online-status style="margin-left: 5px" :status="computedIsOnline" />
      </div>
      <div class="username">
        <span>{{ item.username }}</span>
        <span
          class="badge badge-warning"
          style="margin-left: 5px; font-size: 12px; width: auto"
          v-show="computedIsCreator"
          >{{ $t("CREATOR") }}</span
        >
      </div>
    </div>
    <div class="operation">
      <icon
        v-show="computedMessageVisible"
        name="message"
        style="color: var(--main-color-blue)"
        @click.native.stop="chat"
      />
    </div>
  </div>
</template>

<script>
import avatar from "@/components/avatar";
import onlineStatus from "@/components/onlineStatus";
import { mapState } from "vuex";
export default {
  components: {
    avatar,
    onlineStatus
  },
  props: {
    item: {
      type: Object,
      required: true
    },
    creator: {
      type: Object
    }
  },
  computed: {
    ...mapState("user", ["id", "socket"]),
    computedGender() {
      const { item } = this;
      return item.gender === "m" ? "male" : "female";
    },
    computedGenderStyle() {
      const { item } = this;
      return item.gender === "m" ? "color: cornflowerblue" : "color: lightpink";
    },
    computedMessageVisible() {
      const { id, item } = this;
      return id !== item._id;
    },
    computedIsCreator() {
      const { creator, item } = this;
      return creator && creator._id === item._id;
    },
    computedIsOnline() {
      const { item, id, socket } = this;
      if (id === item._id) return socket && socket.connected;
      return item.online;
    }
  },
  methods: {
    chat() {
      this.$chatbox.show({
        to: this.item
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.user-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}
.avatar {
  width: 15%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  .avatar-img {
    height: 30px;
    width: 30px;
    border-radius: 15px;
    background-color: none;
  }
}
.user-meta {
  width: 65%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  .status {
    width: 100%;
    height: 30%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
  }
  .username {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: nowrap;
    width: 100%;
    height: 30%;
    span {
      font-size: 14px;
      overflow: hidden;
      text-overflow: ellipsis;
      text-align: left;
      white-space: nowrap;
      max-width: 50%;
      margin-left: 2px;
    }
  }
}
.operation {
  display: flex;
  height: 100%;
  justify-content: center;
  align-items: center;
  width: 20%;
}
</style>
