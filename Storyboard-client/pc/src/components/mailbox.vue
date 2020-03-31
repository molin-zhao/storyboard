<template>
  <transition name="fade">
    <div
      v-show="visible"
      class="wrapper"
      :style="`font-family: ${font}`"
      @click="hide"
    >
      <div class="mailbox-background">
        <transition name="sidebar">
          <div
            v-show="visible"
            class="mailbox-wrapper shadow"
            @click.stop="stopPropagation"
          >
            <div class="mailbox-header">
              <icon name="close" class="close" @click.native.stop="hide" />
            </div>
            <div class="mailbox-body">
              <message-list @on-select="selectTo" />
            </div>
          </div>
        </transition>
        <transition name="sidebar">
          <div v-show="to" class="mailbox-wrapper" style="z-index: 1">
            <div class="mailbox-header">
              <icon name="back" class="back" @click.native.stop="back" />
              <icon name="close" class="close" @click.native.stop="hide" />
            </div>
            <div class="mailbox-body">
              <chat :font="font" :to="to" />
            </div>
          </div>
        </transition>
      </div>
    </div>
  </transition>
</template>

<script>
import chat from "@/components/chat";
import messageList from "@/components/messageList";
import { stopPropagation } from "@/common/utils/mouse";
import { mapState, mapMutations } from "vuex";
export default {
  components: {
    chat,
    messageList
  },
  props: {
    font: {
      type: String,
      default: "kai"
    }
  },
  data() {
    return {
      visible: false,
      to: null
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
        this.to = null;
      }
    },
    selectTo(val) {
      this.to = val;
    },
    back() {
      this.to = null;
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../common/theme/container.css";
.wrapper {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10040 !important;
  background-color: #0000001a;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
.mailbox-background {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  height: 100%;
  position: relative;
}

.mailbox-wrapper {
  position: absolute;
  width: 400px;
  height: 100%;
  background-color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.mailbox-header {
  width: 100%;
  height: 30px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  position: relative;
  padding: 0px 5px 0px 5px;
}

.mailbox-body {
  width: 100%;
  position: relative;
  height: calc(100% - 30px);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}

.close {
  position: absolute;
  right: 5px;
  width: 30px;
  height: 30px;
  cursor: pointer;
  color: black;
}
.back {
  width: 30px;
  height: 30px;
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
  //   transform: translateX(400px);
  right: -400px;
}
.sidebar-leave,
.sidebar-enter-to {
  opacity: 1;
  //   transform: translateX(0);
  right: 0px;
}
.sidebar-enter-active,
.sidebar-leave-active {
  transition: all 0.35s;
}
</style>
