<template>
  <div class="wrapper">
    <icon class="empty" name="useravatarempty" :style="computedIconStyle" />
    <img
      v-show="computedImageSource && show"
      @error="defaultImage()"
      :src="computedImageSource"
    />
  </div>
</template>

<script>
import { DFS_DOMAIN } from "@/common/config/static";
import * as URL from "@/common/utils/url";
export default {
  data() {
    return {
      lookup: false,
      lookupSrc: "",
      show: true
    };
  },
  props: {
    defaultImg: {
      type: String,
      default: "/static/image/user_empty.png"
    },
    src: {
      type: String
    },
    iconColor: {
      type: String,
      default: "black"
    },
    iconStyle: {
      type: String,
      default: ""
    },
    userId: {
      type: String,
      default: ""
    }
  },
  computed: {
    computedImageSource() {
      const { src, lookupSrc } = this;
      let _src = lookupSrc || src;
      if (!_src) return "";
      if (_src.startsWith("/static")) return _src;
      return `${DFS_DOMAIN}/${_src}`;
    },
    computedIconStyle() {
      const { iconColor, iconStyle } = this;
      return `color: ${iconColor}; ${iconStyle}`;
    }
  },
  methods: {
    async defaultImage() {
      const { userId, lookup, defaultImg, computedImageSource } = this;
      let img = event.srcElement;
      if (!computedImageSource) {
        img.onerror = null;
        return;
      }
      if (!lookup && userId) {
        try {
          let url = URL.GET_USER_AVATAR(userId);
          const resp = await this.$http.get(url);
          this.lookup = true;
          this.lookupSrc = resp.data.data;
        } catch (err) {
          console.log(err);
          this.show = false;
        } finally {
          img.onerror = null;
        }
      } else {
        this.show = false;
        img.onerror = null;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.wrapper {
  position: relative;
  img {
    position: absolute;
    object-fit: cover;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    z-index: 1;
  }
}

.empty {
  width: 100%;
  height: 100%;
}
</style>
