<template>
  <div ref="sidebar" class="sidebar" :style="computedStyle">
    <div class="sidebar-content-wrapper">
      <div class="sidebar-header">
        <a class="sidebar-close" @click.stop="hide"
          ><icon name="close" style="width: 70%; height: 70%"
        /></a>
      </div>
      <div class="sidebar-content">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
import { eventBus } from "@/common/utils/eventBus";
export default {
  data() {
    return {
      visible: false,
      popup: false,
      timer: null
    };
  },
  props: {
    positionVisible: {
      type: String,
      default: "translateX(-5px)"
    },
    positionInvisible: {
      type: String,
      default: "translateX(25vw)"
    },
    sidebarStyle: {
      type: String,
      default: "height: 100vh; width: 25vw;"
    },
    sidebarClass: {
      type: String,
      default: "sidebar-default"
    },
    interval: {
      type: Number,
      default: 1
    }
  },
  computed: {
    computedStyle() {
      const { visible, positionVisible, positionInvisible, interval } = this;
      return `
      transition: all ${interval}s ease; 
      -moz-transition: all ${interval}s ease;
      -webkit-transition: all ${interval}s ease;
      -o-transition: all ${interval}s ease; 
      transform: ${visible ? positionVisible : positionInvisible}; 
      ${this.sidebarStyle}`;
    }
  },
  created() {
    document.addEventListener("click", this.checkMouseClick);
  },
  beforeDestroy() {
    document.removeEventListener("click", this.checkMouseClick);
  },
  methods: {
    checkMouseClick(event) {
      const e = event || window.event;
      const { type, target } = e;
      const sidebar = this.$refs["sidebar"];
      if (!sidebar) return;
      if (!sidebar.contains(target)) {
        return this.hide();
      }
    },
    show() {
      if (!this.visible) {
        this.visible = true;
        this.$emit("sidebar-show");
        if (this.timer) {
          clearTimeout(this.timer);
          this.timer = null;
        }
        this.timer = setTimeout(() => {
          this.popup = true;
          if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
          }
        }, this.interval * 1000);
      }
    },
    hide() {
      if (this.visible) {
        this.visible = false;
        this.$emit("sidebar-hide");
        if (this.timer) {
          clearTimeout(this.timer);
          this.timer = null;
        }
        this.timer = setTimeout(() => {
          this.popup = false;
          if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
          }
        }, this.interval * 1000);
      }
    }
  },
  mounted() {
    // eventBus.$on("reset-visible-component", () => {
    //   this.hide();
    // });
  }
};
</script>

<style lang="scss" scoped>
.sidebar {
  position: absolute;
  z-index: 999;
}
.sidebar-content-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}
.sidebar-header {
  width: 100%;
  height: 30px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
}
.sidebar-content {
  width: 100%;
  height: calc(100% - 30px);
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}
.sidebar-close {
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
}
</style>
