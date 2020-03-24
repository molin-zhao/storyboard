<template>
  <transition name="show">
    <div ref="popover" v-show="visible" class="my-popover">
      <slot></slot>
    </div>
  </transition>
</template>

<script>
export default {
  props: {
    autoHide: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      visible: false
    };
  },
  methods: {
    show() {
      if (!this.visible) this.visible = true;
    },
    hide() {
      if (this.visible) this.visible = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.my-popover {
  position: absolute;
  z-index: 100;
}
.show-enter-active,
.show-leave-active {
  transition: opacity 0.2s;
}

.show-enter,
.show-leave-active {
  opacity: 0;
}
</style>
