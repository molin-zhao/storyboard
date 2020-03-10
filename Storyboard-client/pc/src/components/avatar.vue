<template>
  <img @error="defaultImage()" />
</template>

<script>
export default {
  props: {
    defaultImg: {
      type: String,
      default: "/static/image/user_empty.png"
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

<style lang="scss" scoped></style>
