<template>
  <input :type="type" @input="onInput($event)" :disabled="disabled" />
</template>

<script>
export default {
  data() {
    return {
      timer: null
    };
  },
  props: {
    type: {
      type: String,
      default: "text"
    },
    interval: {
      type: Number,
      default: 500
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    onInput(e) {
      clearTimeout(this.timer);
      this.$emit("on-typing");
      let value = e.target.value;
      if (value.length > 0) {
        this.timer = setTimeout(() => {
          clearTimeout(this.timer);
          this.$emit("on-change", value);
          this.timer = null;
        }, this.interval);
      } else {
        this.$emit("on-change", "");
        this.timer = null;
      }
    }
  }
};
</script>

<style lang="scss" scoped></style>
