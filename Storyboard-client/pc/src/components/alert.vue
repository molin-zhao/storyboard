<template>
  <div
    :class="
      `alert alert-${type} alert-dismissible fade ${visible ? 'show' : null}`
    "
  >
    <span v-if="message" class="display-only">{{ message }}</span>
    <slot v-else></slot>
    <button @click="resetTimer" class="close">
      <span aria-hidden="true">&times;</span>
    </button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      visible: false,
      dismissTimer: null
    };
  },
  props: {
    type: {
      type: String,
      default: "secondary"
    },
    message: {
      type: String,
      default: "message"
    },
    interval: {
      type: Number,
      default: 3000
    }
  },
  methods: {
    show() {
      this.visible = true;
      this.dismissTimer = setTimeout(() => {
        // automatically close alert
        if (this) {
          this.visible = false;
          this.resetTimer();
        }
      }, this.interval);
    },
    dismiss() {
      this.visible = false;
    },
    resetTimer() {
      if (this.visible) this.visible = false;
      if (this.dismissTimer) clearTimeout(this.dismissTimer);
      this.dismissTimer = null;
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../common/theme/container.css";
div.alert {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10050 !important;
  min-width: 200px;
}
</style>
