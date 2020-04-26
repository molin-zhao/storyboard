<template>
  <transition name="fade">
    <div v-show="visible" class="chatbox" @click="hide">
      <div class="chatbox-background">
        <transition name="sidebar">
          <div
            v-show="visible"
            class="chatbox-wrapper shadow display-only"
            @click.stop="stopPropagation"
          >
            <div class="chatbox-header">
              <icon
                name="close"
                class="close"
                @click.native.stop="hide"
                style="color: black"
              />
            </div>
            <div class="chatbox-body">
              <chat :to="to" />
            </div>
          </div>
        </transition>
      </div>
    </div>
  </transition>
</template>

<script>
import chat from "@/components/chat";
import { stopPropagation } from "@/common/utils/mouse";
export default {
  components: {
    chat
  },
  props: {
    to: {
      type: Object
    }
  },
  data() {
    return {
      visible: false
    };
  },
  methods: {
    stopPropagation,
    show() {
      if (!this.visible) {
        this.visible = true;
      }
    },
    hide() {
      if (this.visible) {
        this.visible = false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../common/theme/container.css";
.chatbox {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10040 !important;
  background-color: #0000001a;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  font-family: sans-serif;
}
.chatbox-background {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  height: 100%;
  position: relative;
}
.chatbox-wrapper {
  position: absolute;
  width: 400px;
  height: 100%;
  background-color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.chatbox-body {
  width: 100%;
  height: calc(100% - 30px);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}
.chatbox-header {
  width: 100%;
  height: 30px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  position: relative;
  padding: 0px 5px 0px 5px;
}
.close {
  position: absolute;
  right: 5px;
  width: 20px;
  height: 20px;
  cursor: pointer;
  color: black;
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

.sidebar-enter,
.sidebar-leave-to {
  opacity: 0;
  right: -400px;
}
.sidebar-leave,
.sidebar-enter-to {
  opacity: 1;
  right: 0px;
}
.sidebar-enter-active,
.sidebar-leave-active {
  transition: all 0.35s;
}
</style>
