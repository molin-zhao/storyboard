<template>
  <div class="wrapper" style="border-bottom: 1px gainsboro solid">
    <div class="avatar">
      <avatar
        default-img="/static/image/user_empty.png"
        :src="item.avatar"
        class="avatar-img"
      />
    </div>
    <div class="username">
      <icon :name="computedGender" :style="computedGenderStyle" /><span>{{
        item.username
      }}</span>
    </div>
    <div class="operation">
      <a :class="computedOperationClass" @click.stop="operation">{{
        computedOperationLabel
      }}</a>
    </div>
  </div>
</template>

<script>
import avatar from "@/components/avatar";
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
    }
  },
  computed: {
    computedOperationLabel() {
      const { excludeList, item } = this;
      if (excludeList && excludeList.includes(item._id))
        return this.$t("REMOVE");
      return this.$t("ADD");
    },
    computedOperationClass() {
      const { excludeList, item } = this;
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
.wrapper {
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
