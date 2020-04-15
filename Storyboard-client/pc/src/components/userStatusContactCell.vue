<template>
  <div class="user-wrapper" style="border-bottom: 1px gainsboro solid">
    <div class="avatar">
      <avatar :src="item.avatar" class="avatar-img" />
    </div>
    <div class="username">
      <div>
        <icon :name="computedGender" :style="computedGenderStyle" />
        <span
          class="badge badge-warning"
          style="margin-left: 5px; font-size: 12px; width: auto"
          v-show="computedIsCreator"
          >{{ $t("CREATOR") }}</span
        >
      </div>
      <div>
        <span>{{ item.username }}</span>
      </div>
    </div>
    <div class="operation">
      <span :class="computedBadgeClass" style="font-size: 10px">{{
        computedBadgeLabel
      }}</span>
    </div>
    <div class="operation">
      <icon
        v-show="computedShowMessage"
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
import { stopPropagation } from "@/common/utils/mouse";
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
    },
    memberStuck: {
      type: Array,
      default: () => []
    },
    memberDone: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    ...mapState("user", ["id"]),
    computedGender() {
      const { item } = this;
      return item.gender === "m" ? "male" : "female";
    },
    computedGenderStyle() {
      const { item } = this;
      return item.gender === "m" ? "color: cornflowerblue" : "color: lightpink";
    },
    computedIsCreator() {
      const { creator, item } = this;
      return creator && creator._id === item._id;
    },
    computedShowMessage() {
      const { id, item } = this;
      return id !== item._id;
    },
    computedBadgeClass() {
      const { memberStuck, memberDone, item } = this;
      if (memberStuck.includes(item._id)) return "badge badge-warning";
      if (memberDone.includes(item._id)) return "badge badge-success";
      return "badge badge-light";
    },
    computedBadgeLabel() {
      const { memberStuck, memberDone, item } = this;
      if (memberStuck.includes(item._id)) return this.$t("STATUS_STUCK");
      if (memberDone.includes(item._id)) return this.$t("STATUS_DONE");
      return this.$t("STATUS_WORKING");
    }
  },
  methods: {
    stopPropagation,
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
.username {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex-wrap: nowrap;
  width: 45%;
  height: 100%;
  div {
    width: 100%;
    height: 30%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
  }
  span {
    font-size: 14px;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: left;
    white-space: nowrap;
    width: 95%;
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
