<template>
  <modal
    ref="confirm-modal"
    @on-modal-hide="modalHide"
    @on-modal-show="modalShow"
  >
    <h5 slot="modal-header" class="modal-title">
      {{ title }}
    </h5>
    <div slot="modal-body" class="modal-body">
      <p>{{ message }}</p>
    </div>
    <div slot="modal-footer" class="modal-footer">
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
        class="btn btn-sm btn-primary create-btn"
      >
        {{ confirmLabel }}
      </button>
      <button
        class="btn btn-sm btn-danger create-btn"
        @click.stop="cancel"
        :disabled="processing ? true : false"
      >
        {{ cancelLabel }}
      </button>
    </div>
  </modal>
</template>

<script>
import modal from "@/components/modal";
export default {
  components: {
    modal
  },
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
      if (!this.visible) {
        let modal = this.$refs["confirm-modal"];
        if (modal) return modal.show();
      }
    },
    close() {
      if (this.visible) {
        let modal = this.$refs["confirm-modal"];
        if (modal) return modal.hide();
      }
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
    },
    modalHide() {
      this.visible = false;
    },
    modalShow() {
      this.visible = true;
    }
  }
};
</script>

<style lang="scss" scoped></style>
