<template>
  <div
    class="wrapper"
    :style="computedWrapperStyle"
    ref="icon"
    @click.stop="checkMouseClick"
    @mouseover="checkMouseover"
    @mouseleave="checkMouseleave"
  >
    <icon :name="computedIconName" :style="computedIconStyle" />
    <div :style="badgeStyle">
      <span :class="`display-only badge ${badgeClass}`">{{
        computedBadgeNumber
      }}</span>
    </div>
    <slot></slot>
  </div>
</template>

<script>
import { eventBus } from "@/common/utils/eventBus";
export default {
  data() {
    return {
      clicked: false,
      mouseover: false
    };
  },
  props: {
    number: {
      type: Number,
      default: 0
    },
    wrapperStyle: {
      type: Object,
      default: {
        plain: "",
        active: "",
        hover: ""
      }
    },
    iconStyle: {
      type: Object,
      default: {
        plain: "",
        active: "",
        hover: ""
      }
    },
    iconName: {
      type: Object,
      required: true,
      default: {
        plain: "",
        active: "",
        hover: ""
      }
    },
    badgeClass: {
      type: String
    },
    badgeStyle: {
      type: String
    },
    autoReset: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    computedBadgeNumber() {
      const { number } = this;
      if (!number) return "";
      if (typeof number !== "number") return "";
      if (number > 99) return "99+";
      if (number === 0) return "";
      return `${number}`;
    },
    computedWrapperStyle() {
      const { plain, active, hover } = this.wrapperStyle;
      if (this.clicked && active) return `${plain}; ${active}`;
      else if (this.mouseover && hover) return `${plain}; ${hover}`;
      else return `${plain}`;
    },
    computedIconName() {
      const { plain, active, hover } = this.iconName;
      if (this.clicked && active) return `${active}`;
      else if (this.mouseover && hover) return `${hover}`;
      else return `${plain}`;
    },
    computedIconStyle() {
      const { plain, active, hover } = this.iconStyle;
      if (this.clicked && active) return `${plain}; ${active}`;
      else if (this.mouseover && hover) return `${plain}; ${hover}`;
      else return `${plain}`;
    }
  },
  methods: {
    checkMouseClick() {
      this.clicked = !this.clicked;
    },
    checkMouseover() {
      if (!this.mouseover) this.mouseover = true;
    },
    checkMouseleave() {
      if (this.mouseover) this.mouseover = false;
    }
  },
  mounted() {
    eventBus.$on("reset-visible-component", () => {
      if (this.autoReset && this.clicked) this.clicked = false;
    });
  }
};
</script>

<style lang="scss" scoped>
@import "../common/theme/container.css";
.wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0;
  position: relative;
  cursor: pointer;
  div {
    position: absolute;
    top: 5px;
    right: 5px;
  }
  span {
    font-size: 12px;
  }
}
</style>
