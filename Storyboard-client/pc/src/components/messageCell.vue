<template>
  <transition name="fade">
    <div class="message-cell-wrapper" v-show="visible">
      <div
        class="front-layer"
        :data-type="computedDataType"
        :style="slideEffect"
        @mousedown="touchStart($event)"
        @mouseup="touchEnd($event)"
        @mousemove="touchMove($event)"
        @click="cellOnClick"
      >
        <slot></slot>
      </div>
      <div v-show="btns" ref="btn-group" class="back-layer">
        <div
          v-for="(btn, index) in btns"
          :key="index"
          class="back-btn"
          :style="computedBtnStyle(index)"
          @click="btnOnClick(index)"
        >
          {{ computedBtnLabel(index) }}
        </div>
      </div>
    </div>
  </transition>
</template>
<script>
export default {
  mounted() {
    this.visible = true;
    const { btns } = this;
    if (btns) {
      let btnGroupWidth = this.$refs["btn-group"].offsetWidth;
      this.btnGroupWidth = btnGroupWidth;
    }
  },
  beforeDestroy() {
    this.visible = false;
  },
  data() {
    return {
      startX: 0,
      distX: 0,
      slideEffect: "", // 滑动的效果，用于添加style
      btnsAllAppeared: false,
      btnActiveIndex: -1,
      visible: false,
      btnGroupWidth: 0
    };
  },
  props: {
    index: {
      type: Number,
      required: true
    },
    activeIndex: {
      type: Number,
      default: -1
    },
    btns: {
      type: Array,
      default: () => null
    },
    movable: {
      type: Boolean,
      default: false
    },
    moveAutoCompleteThreshold: {
      type: Number,
      default: 0.4
    },
    onClick: {
      type: Function,
      default: null
    }
  },
  computed: {
    computedBtnStyle() {
      return function(index) {
        const { btns, btnActiveIndex, btnGroupWidth } = this;
        let backgroundColor = btns[index]["backgroundColor"]
          ? btns[index]["backgroundColor"]
          : "lightgrey";
        if (btnActiveIndex !== -1) {
          if (btnActiveIndex === index) {
            return `background-color: ${backgroundColor}; width: ${btnGroupWidth}px`;
          }
          return `background-color: ${backgroundColor}; width: 0`;
        }
        return `background-color: ${backgroundColor}; width: ${btns[index]["width"]}`;
      };
    },
    computedBtnLabel() {
      return function(index) {
        const { btns, btnActiveIndex } = this;
        if (btnActiveIndex === index) {
          return btns[index]["activeLabel"]
            ? btns[index]["activeLabel"]
            : this.$t("CONFIRM");
        }
        return btns[index]["defaultLabel"] ? btns[index]["defaultLabel"] : "";
      };
    },
    computedDataType() {
      const { btnsAllAppeared } = this;
      return btnsAllAppeared ? 1 : 0;
    }
  },
  methods: {
    touchStart(e) {
      const { movable, index, btnsAllAppeared } = this;
      if (!movable) return;
      this.startX = e.clientX;
      if (!btnsAllAppeared) this.$emit("on-move", index);
    },
    touchEnd(e) {
      const {
        movable,
        index,
        btnsAllAppeared,
        moveAutoCompleteThreshold,
        btnGroupWidth
      } = this;
      const { clientX } = e;
      if (!movable) return;
      this.distX = clientX - this.startX;
      if (this.distX < 0 && !btnsAllAppeared) {
        // moving to the left and btns not fully appeared
        if (
          -this.distX < Math.floor(btnGroupWidth * moveAutoCompleteThreshold)
        ) {
          this.slideEffect = "transform: translateX(0);";
        } else {
          this.slideEffect = `transform: translateX(-${btnGroupWidth}px);`;
          this.btnsAllAppeared = true;
          this.$emit("active", index);
        }
      } else if (this.distX > 0 && btnsAllAppeared) {
        // moving to the right and btns already fully appeared
        if (this.distX > Math.ceil(btnGroupWidth * moveAutoCompleteThreshold)) {
          this.slideEffect = "transform: translateX(0);";
          this.btnsAllAppeared = false;
        } else {
          this.slideEffect = `transform: translateX(-${btnGroupWidth}px)`;
        }
      }
    },
    touchMove(e) {
      const { clientX } = e;
      const { btnsAllAppeared, btnGroupWidth } = this;
      this.distX = clientX - this.startX;
      if ((this.distX < 0 || this.distX === 0) && !btnsAllAppeared) {
        // moving to left and btns not fully appeared
        if (-this.distX >= Math.floor(btnGroupWidth)) {
          this.slideEffect = `transform: translateX(-${btnGroupWidth}px);`;
        } else {
          this.slideEffect = `transform:translateX("${this.distX}px);`;
        }
      } else if (this.distX > 0 && btnsAllAppeared) {
        // moving to right and btns already appeared
        if (this.distX >= Math.floor(btnGroupWidth)) {
          this.slideEffect = `transform: translateX(${btnGroupWidth}px);`;
        } else {
          this.slideEffect = `transform:translateX(${this.distX -
            btnGroupWidth}px);`;
        }
      }
    },
    // recover to original state
    recover() {
      if (this.btnsAllAppeared) {
        this.btnsAllAppeared = false;
        this.btnActiveIndex = -1;
        this.slideEffect = "transform: translateX(0);";
      }
    },
    btnOnClick(index) {
      const { btns, btnActiveIndex } = this;
      if (btnActiveIndex === index) {
        if (btns[index].onConfirm) btns[index].onConfirm();
        return this.recover();
      } else {
        this.btnActiveIndex = index;
      }
    },
    cellOnClick() {
      const { onClick } = this;
      if (onClick) return onClick();
    }
  },
  watch: {
    activeIndex(newVal, oldVal) {
      if (newVal === -1) {
        this.recover();
      }
    }
  }
};
</script>
<style lang="scss">
.message-cell-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}
.front-layer {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 2;
  width: 100%;
  height: 100%;
  background-color: white;
  overflow: hidden;
  -webkit-transition: all 0.5s;
  transition: all 0.5s;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

.back-layer {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: flex-end;
  flex-direction: row;
  align-items: center;
  background-color: white;
  .back-btn {
    height: 100%;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: white;
    -webkit-transition: all 0.3s;
    transition: all 0.3s;
  }
}
div[data-type="0"] {
  transform: translateX(0);
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
  height: 0;
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
