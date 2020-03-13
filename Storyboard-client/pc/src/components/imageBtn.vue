<template>
  <div class="wrapper display-only" :style="wrapperStyle">
    <img
      :src="src"
      @error="defaultImage()"
      :class="imgBorder"
      :style="imgStyle"
      @mouseover="onMouseover()"
      @mouseleave="onMouseleave()"
    />
    <slot></slot>
  </div>
</template>

<script>
export default {
  data() {
    return {
      mouseover: false
    };
  },
  computed: {
    imgBorder() {
      if (this.mouseover) return `${this.mouseoverClass}`;
      return "";
    }
  },
  props: {
    src: {
      type: String,
      required: true
    },
    wrapperStyle: {
      type: String
    },
    mouseoverClass: {
      type: String,
      default: "img-mouseover-light"
    },
    imgStyle: {
      type: String
    },
    defaultImg: {
      type: String,
      default: "/static/image/user_empty.png"
    }
  },
  methods: {
    onMouseover() {
      this.mouseover = true;
    },
    onMouseleave() {
      this.mouseover = false;
    },
    defaultImage() {
      let img = event.srcElement;
      img.src = this.defaultImg;
      img.onerror = null;
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../common/theme/color.css";
@import "../common/theme/container.css";
.wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2px;
  position: relative;
}
</style>
