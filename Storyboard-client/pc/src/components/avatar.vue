<template>
  <img class="wrapper" @error="defaultImage()" :src="computedImageSource" />
</template>

<script>
import { DFS_DOMAIN } from "@/common/config/static";
export default {
  props: {
    defaultImg: {
      type: String,
      default: "/static/image/user_empty.png"
    },
    src: {
      type: String
    }
  },
  computed: {
    computedImageSource() {
      const { src } = this;
      if (!src) return "";
      if (src.startsWith("/static")) return src;
      return `${DFS_DOMAIN}/${src}`;
    }
  },
  methods: {
    defaultImage() {
      let img = event.srcElement;
      img.src = this.defaultImg;
      img.onerror = null;
    }
  }
};
</script>

<style lang="scss" scoped>
.wrapper {
  object-fit: cover;
}
</style>
