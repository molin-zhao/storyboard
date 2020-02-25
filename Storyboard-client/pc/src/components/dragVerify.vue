<template>
  <div class="jc-component-range">
    <div class="jc-range" :class="slideToRight ? 'success' : ''">
      <div ref="block" :style="computedBlockStyle">
        <icon :name="slideToRight ? successIcon : startIcon" />
      </div>
      {{ slideToRight ? successText : startText }}
    </div>
  </div>
</template>

<script>
import icon from "@/components/icon";
export default {
  components: {
    icon
  },
  props: {
    onSuccess: {
      type: Function
    },
    onFailure: {
      type: Function
    },
    successIcon: {
      type: String,
      default: "roundcheckfill"
    },
    successText: {
      type: String,
      default: "验证成功"
    },
    startIcon: {
      type: String,
      default: "slideright"
    },
    startText: {
      type: String,
      default: "拖动滑块到最右边"
    },
    status: {
      type: String
    }
  },
  data() {
    return {
      disX: 0,
      startX: null,
      maxX: null,
      minX: 0,
      slideToRight: false,
      sliding: false
    };
  },
  created() {
    document.addEventListener("mousedown", this.onMouseDown);
    document.addEventListener("mouseup", this.onMouseUp);
    document.addEventListener("mousemove", this.onMouseMove);
  },
  beforeCreate() {
    document.removeEventListener("mousedown", this.onMouseDown);
    document.removeEventListener("mouseup", this.onMouseUp);
    document.removeEventListener("mousemove", this.onMouseMove);
  },
  computed: {
    computedBlockStyle() {
      const { sliding, slideToRight, maxX, minX, disX } = this;
      let transition = sliding ? "" : "transition: .5s all";
      let dest;
      if (disX <= minX) dest = minX;
      else if (disX >= maxX) dest = maxX;
      else dest = disX;
      return `${transition}; transform: translateX(${dest}px)`;
    }
  },
  mounted() {
    const blockEl = this.$refs["block"];
    const blockParentEl = blockEl.parentElement;
    this.maxX = blockParentEl.offsetWidth - blockEl.offsetWidth + 2;
  },
  methods: {
    onMouseDown() {
      const e = event || window.event;
      const { type, target, clientX } = e;
      if (this.$refs["block"] && this.$refs["block"].contains(target)) {
        if (this.slideToRight) return false;
        if (!this.sliding) {
          this.sliding = true;
          this.startX = clientX;
        }
      } else {
        if (this.sliding) {
          this.sliding = false;
          this.startX = null;
        }
      }
    },
    onMouseMove(e) {
      const { clientX, currentTarget, target } = e;
      const { sliding, minX, maxX, slideToRight } = this;
      if (sliding && !slideToRight) {
        let endX = clientX;
        // (endX - startX) = move length
        // if move left, move length is negative
        // if move right, move length is positive
        let moveLen = endX - this.startX;
        let destX = this.disX + moveLen;
        if (destX >= maxX) {
          // success
          if (!slideToRight) {
            this.slideToRight = true;
            this.onSuccess && this.onSuccess();
          }
        }
        this.disX = destX;
        this.startX = endX;
      }
    },
    onMouseUp() {
      const e = event || window.event;
      const { clientX, currentTarget, target } = e;
      if (this.sliding) this.sliding = false;
      if (!this.slideToRight) {
        this.disX = 0;
        this.startX = null;
      }
      if (this.$refs["block"] && this.$refs["block"].contains(target)) {
        this.onFailure && this.onFailure();
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@mixin jc-flex {
  display: flex;
  justify-content: center;
  align-items: center;
}
.jc-component-range {
  width: 100%;
  .jc-range {
    padding: 0;
    background-color: whitesmoke;
    position: relative;
    transition: 1s all;
    border-radius: 5px;
    user-select: none;
    color: #333;
    @include jc-flex;
    height: 45px; /*no*/
    &.success {
      background-color: #7ac23c;
      color: #fff;
      div {
        color: #7ac23c;
      }
    }
    div {
      position: absolute;
      border-radius: 5px;
      left: 0;
      width: 60px; /*no*/
      height: 100%;
      color: #919191;
      background-color: #fff;
      border: 1px solid #bbb;
      cursor: pointer;
      @include jc-flex;
    }
  }
}
</style>
