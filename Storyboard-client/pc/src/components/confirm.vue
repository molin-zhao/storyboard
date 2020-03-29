<template>
  <transition name="fade">
    <div
      v-show="visible"
      class="confirm-wrapper display-only"
      @click="hideModal"
    >
      <div
        @click.stop="clickModal"
        class="modal-dialog modal-dialog-centered my-modal"
      >
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title display-only">
              {{ title }}
            </h5>
            <a
              style="font-size: 20px; cursor: pointer"
              class="display-only"
              aria-hidden="true"
              aria-label="Close"
              @click="close"
              >&times;</a
            >
          </div>
          <div class="modal-body">
            <p>{{ message }}</p>
          </div>
          <div class="modal-footer">
            <button v-if="processing" class="btn btn-sm btn-primary" disabled>
              <span
                class="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
            </button>
            <button
              v-else
              @click.stop="confirm"
              type="button"
              class="btn btn-sm btn-primary"
            >
              {{ confirmLabel }}
            </button>
            <button
              class="btn btn-sm btn-danger"
              @click.stop="cancel"
              :disabled="processing ? true : false"
            >
              {{ cancelLabel }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  data() {
    return {
      visible: false,
      processing: false
    };
  },
  props: {
    title: {
      type: String,
      default: ""
    },
    message: {
      type: String,
      default: ""
    },
    success: {
      type: Function,
      default: null
    },
    fail: {
      type: Function,
      default: null
    },
    confirmLabel: {
      type: String,
      default: ""
    },
    cancelLabel: {
      type: String,
      default: ""
    }
  },
  methods: {
    show() {
      if (!this.visible) this.visible = true;
    },
    close() {
      if (this.visible) this.visible = false;
    },
    confirm() {
      if (this.success) this.success();
      this.close();
    },
    cancel() {
      if (this.fail) this.fail();
      this.close();
    },
    hideModal() {
      if (this.visible) this.visible = false;
    },
    clickModal() {
      return;
    }
  }
};
</script>

<style lang="scss" scoped>
.confirm-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10049 !important;
  background-color: #0000001a;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.my-modal {
  min-width: 500px;
  min-height: 300px;
}

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
</style>
