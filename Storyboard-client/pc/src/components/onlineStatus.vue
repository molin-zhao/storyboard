<template>
  <div class="wrapper">
    <div class="indicator" :style="computedOnlineIndicatorStyle" />
    <span class="display-only" :style="computedOnlineTextStyle">{{
      computedOnlineStatus
    }}</span>
  </div>
</template>

<script>
export default {
  props: {
    status: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    computedOnlineStatus() {
      const { status } = this;
      if (status) return this.$t("ONLINE");
      return this.$t("OFFLINE");
    },
    computedOnlineIndicatorStyle() {
      const { status } = this;
      return `background-color: ${status ? "#5cb85c" : "lightgrey"}`;
    },
    computedOnlineTextStyle() {
      const { status } = this;
      return `color: ${status ? "#5cb85c" : "gray"}; font-size: 14px`;
    }
  }
};
</script>

<style lang="scss" scoped>
.wrapper {
  width: 60px;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  span {
    margin-left: 5px;
  }
}
.indicator {
  width: 10px;
  height: 10px;
  border-radius: 5px;
}
</style>
