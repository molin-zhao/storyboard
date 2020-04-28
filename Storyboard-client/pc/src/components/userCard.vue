<template>
  <div class="card-wrapper display-only">
    <div class="content-wrapper">
      <div class="avatar-wrapper">
        <avatar
          icon-color="lightgrey"
          style="width: 60px; height: 60px; borderRadius: 30"
          :src="item.avatar"
          :user-id="item._id"
        />
      </div>
      <div class="username-wrapper">
        <div class="user-gender">
          <icon :name="computedGenderName" :style="computedGenderStyle" />
          <span
            class="badge badge-warning"
            style="margin-left: 5px; font-size: 12px; width: auto"
            v-show="isCreator"
            >{{ $t("CREATOR") }}</span
          >
        </div>
        <span class="username">{{ item.username }}</span>
      </div>
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
    isCreator: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    computedGenderName() {
      const { item } = this;
      if (item.gender === "m") return "male";
      return "female";
    },
    computedGenderStyle() {
      const { item } = this;
      const color = item.gender === "m" ? "cornflowerblue" : "lightpink";
      return `
        width: 20px;
        height: 20px;
        color: ${color}
        `;
    }
  }
};
</script>

<style lang="scss" scoped>
.card-wrapper {
  width: 100%;
  height: 100%;
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.content-wrapper {
  width: 100%;
  height: 100%;
  border: 1px lightgrey solid;
  border-radius: 10px;
  box-shadow: -5px 2px 5px gainsboro;
  -webkit-box-shadow: -5px 2px 5px gainsboro;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  .avatar-wrapper {
    height: 100%;
    min-width: 70px;
    width: 30%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .username-wrapper {
    height: 60%;
    width: 70%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    .user-gender {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      width: 100%;
      height: 30%;
    }
    span {
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }
    .username {
      margin-top: 5px;
      font-size: 15px;
      font-weight: bold;
    }
  }
}
</style>
