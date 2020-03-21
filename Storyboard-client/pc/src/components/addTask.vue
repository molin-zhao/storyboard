<template>
  <div class="add-task-wrapper">
    <div
      class="group-color"
      :style="`background-color: ${color}; opacity: ${focused ? 1 : 0.5}`"
    />
    <div class="add-text">
      <editableText
        @on-focus="onFocus"
        @lost-focus="lostFocus"
        defaultValue="ADD_TASK"
        @on-typing="onInputChange"
        input-style="border-radius: 0px"
      />
    </div>
    <div v-if="focused" class="add-button" @click.stop="stopPropagation">
      <a
        class="create-task-btn display-only"
        @click.stop="addTask"
        :style="computedButtonDisabledStyle"
      >
        <span
          v-if="taskCreating"
          class="spinner-border spinner-border-sm"
          role="status"
          aria-hidden="true"
        ></span>
        <span v-else> {{ $t("ADD") }} </span>
      </a>
    </div>
  </div>
</template>

<script>
import editableText from "@/components/editableText";
import { stopPropagation } from "@/common/utils/mouse";
export default {
  components: {
    editableText
  },
  props: {
    editable: {
      type: Boolean,
      default: false
    },
    color: {
      type: String,
      default: "none"
    }
  },
  data() {
    return {
      focused: false,
      taskName: "",
      taskCreating: false
    };
  },
  computed: {
    computedButtonDisabled() {
      return this.taskName ? false : true;
    },
    computedButtonDisabledStyle() {
      return `opacity: ${this.taskName ? 1 : 0.7}; pointer-events: ${
        this.taskName ? "auto" : "none"
      }`;
    }
  },
  methods: {
    stopPropagation,
    onFocus() {
      if (!this.focused) this.focused = true;
    },
    lostFocus() {
      if (this.focused) this.focused = false;
    },
    onInputChange(val) {
      this.taskName = val;
    },
    addTask() {
      console.log("create task");
    }
  }
};
</script>

<style lang="scss" scoped>
.add-task-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  height: 100%;
  .add-text {
    width: 94%;
    height: 100%;
  }
  .add-button {
    width: calc(6% - 1px);
    height: 100%;
    margin-right: 1px;
    a {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      color: white;
      width: 100%;
      height: 100%;
      border-radius: 0;
      cursor: pointer;
    }
    a:active {
      -webkit-box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
      box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
    }
  }
}
.create-task-btn {
  background-color: var(--main-color-blue);
}
</style>
