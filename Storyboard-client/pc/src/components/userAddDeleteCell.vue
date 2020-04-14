<template>
  <div class="user-wrapper" style="border-bottom: 1px gainsboro solid">
    <div class="avatar">
      <avatar
        default-img="/static/image/user_empty.png"
        :src="item.avatar"
        class="avatar-img"
      />
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
      <a
        :class="computedOperationClass"
        @click.stop="operation"
        :style="computedOperationStyle"
        >{{ computedOperationLabel }}</a
      >
    </div>
  </div>
</template>

<script>
import avatar from "@/components/avatar";
import { mapState } from "vuex";
export default {
  components: {
    avatar
  },
  props: {
    item: {
      type: Object,
      required: true
    },
    excludeList: {
      type: Array
    },
    creator: {
      type: Object
    }
  },
  computed: {
    ...mapState("user", ["id"]),
    computedOperationLabel() {
      const { excludeList, item, computedIsCreator, id } = this;
      if (id === item._id || computedIsCreator) return this.$t("DEFAULT");
      if (excludeList && excludeList.includes(item._id))
        return this.$t("REMOVE");
      return this.$t("ADD");
    },
    computedOperationClass() {
      const { excludeList, item, id } = this;
      if (id === item._id) return "text-secondary op-link";
      if (excludeList && excludeList.includes(item._id))
        return "text-danger op-link";
      return "text-primary op-link";
    },
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
    computedOperationStyle() {
      const { id, item, computedIsCreator } = this;
      let disabled = id === item._id || computedIsCreator;
      return `pointer-events: ${disabled ? "none" : "auto"}`;
    }
  },
  methods: {
    operation() {
      const { excludeList, item } = this;
      if (excludeList && excludeList.includes(item._id))
        return this.$emit("remove-user", item);
      return this.$emit("add-user", item);
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
  align-items: flex-start;
  flex-wrap: nowrap;
  width: 65%;
  height: 100%;
  div {
    width: 100%;
    height: 50%;
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
.op-link {
  cursor: pointer;
}
</style>
