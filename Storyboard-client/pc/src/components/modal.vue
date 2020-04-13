<template>
  <transition name="fade">
    <div
      v-show="visible"
      class="modal-wrapper"
      role="dialog"
      @click.stop="hide"
    >
      <transition name="top-in">
        <div
          v-show="visible"
          class="modal-dialog modal-dialog-centered my-modal"
          role="document"
          @click.stop="stopPropagation"
        >
          <div class="modal-content">
            <div class="modal-header">
              <slot name="modal-header"></slot>
              <a
                style="font-size: 20px; cursor: pointer"
                class="display-only"
                aria-hidden="true"
                aria-label="Close"
                @click.stop="hide"
                >&times;</a
              >
            </div>
            <slot name="modal-body"></slot>
            <slot name="modal-footer"></slot>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script>
import { stopPropagation } from "@/common/utils/mouse";
export default {
  data() {
    return {
      visible: false
    };
  },
  methods: {
    stopPropagation,
    show() {
      this.visible = true;
    },
    hide() {
      this.visible = false;
    }
  },
  watch: {
    visible(newVal, oldVal) {
      if (!newVal) this.$emit("on-modal-hide");
      else this.$emit("on-modal-show");
    }
  }
};
</script>

<style lang="scss" scoped>
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
.fade-leave,
.fade-enter-to {
  opacity: 1;
}
.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s;
}

.top-in-enter,
.top-in-leave-to {
  transform: translateY(-200px);
}
.top-in-leave,
.top-in-enter-to {
  transform: translateY(0);
}
.top-in-enter-active,
.top-in-leave-active {
  transition: all 0.35s;
}
</style>
