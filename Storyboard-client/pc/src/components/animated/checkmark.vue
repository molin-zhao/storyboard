<template>
  <i class="icon-span" :class="{ 'icon-span-select': checked }"></i>
</template>

<script>
export default {
  props: {
    checked: {
      type: Boolean,
      default: true
    }
  }
};
</script>

<style lang="scss" scoped>
.icon-span {
  cursor: pointer;
  display: inline-block;
  background-color: #fff;
  border-radius: 100%;
  border: 1px solid #ccc;
  position: relative;
  width: 30px;
  height: 30px;
  vertical-align: middle;
}
.icon-span::after {
  border: 2px solid transparent;
  border-left: 0;
  border-top: 0;
  content: " ";
  top: 3px;
  left: 8px;
  position: absolute;
  width: 10px;
  height: 16px;
  -webkit-transform: rotate(45deg) scale(0);
  transform: rotate(45deg) scale(0);
  -webkit-transition: -webkit-transform 0.2s;
  transition: -webkit-transform 0.2s;
  transition: transform 0.2s;
  transition: transform 0.2s, -webkit-transform 0.2s;
}
.icon-span-select {
  background-color: var(--main-color-success);
  border-color: #fff;
}
.icon-span-select::after {
  border-color: #fff;
  -webkit-transform: rotate(45deg) scale(1);
  transform: rotate(45deg) scale(1);
}
</style>
