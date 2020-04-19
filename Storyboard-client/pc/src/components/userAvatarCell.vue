<template>
  <div class="selected-user" v-tooltip:right="computedTooltipTitle">
    <avatar
      style="width: 50px; height: 50px; border-radius: 5px; object-fit: cover"
      :src="item.avatar"
      default-img="/static/image/user_empty.png"
    />
    <icon v-show="canRemove" name="close" class="selected-user-remove" />
  </div>
</template>

<script>
import { sliceFromLeft } from "@/common/utils/string";
import avatar from "@/components/avatar";
export default {
  components: {
    avatar
  },
  props: {
    item: {
      type: Object
    },
    canRemove: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    computedTooltipTitle() {
      const { item } = this;
      return sliceFromLeft(item.username, 10);
    }
  }
};
</script>

<style lang="scss" scoped>
.selected-user {
  cursor: pointer;
  width: 20%;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  .selected-user-remove {
    position: absolute;
    top: 0px;
    right: 10px;
    width: 20px;
    height: 20px;
    font-weight: bold;
  }
}
</style>
