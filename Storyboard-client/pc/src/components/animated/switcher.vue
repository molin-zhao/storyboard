<template>
  <div :class="computedClass">
    <!-- Checking and unchecking of the checkbox is toggling automatically by HTML with each click -->
    <!-- For disabling the input please add :disabled attribute to the current input -->
    <!-- All of the possible input states are listed below -->
    <input type="checkbox" id="switcher" class="cb-item_input" />
    <label for="switcher" class="cb-item_label">
      <span class="cb-item_marker"></span>
    </label>
  </div>
</template>

<script>
export default {
  props: {
    ios: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    computedClass() {
      const { ios } = this;
      return `cb-item_${ios ? "ios" : "android"}-style`;
    }
  }
};
</script>

<style lang="scss" scoped>
/* Checkbox Switcher Style #1 */

.cb-item_ios-style,
.cb-item_ios-style *,
.cb-item_ios-style *::before,
.cb-item_ios-style *::after {
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
}

.cb-item_ios-style {
  position: relative;
  display: inline-block;
  --cb_bg-color: #fff;
  --cb_bg-color_checked: #05c096;
  --cb_border-color: #ccc;
}

.cb-item_input {
  position: absolute;
  opacity: 0;
  z-index: -1;
}

.cb-item_ios-style .cb-item_label {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  width: 50px;
  height: 30px;
  cursor: pointer;
  background-color: #fff;
  background-color: var(--cb_bg-color);
  border: 1px solid;
  border-color: #ccc;
  border-color: var(--cb_border-color);
  border-radius: 25px;
  -webkit-transition: all 0.4s ease;
  transition: all 0.4s ease;
  -webkit-tap-highlight-color: rgba(255, 255, 255, 0);
}

.cb-item_ios-style .cb-item_marker {
  display: block;
  width: 26px;
  height: 26px;
  background-color: #fff;
  background-color: var(--cb_bg-color);
  border-radius: 50%;
  -webkit-box-shadow: 2px 4px 6px rgba(0, 0, 0, 0.2);
  box-shadow: 2px 4px 6px rgba(0, 0, 0, 0.2);
  -webkit-transform: translateX(1px);
  transform: translateX(1px);
  -webkit-transition: all 0.15s ease;
  transition: all 0.15s ease;
}

/* Checkbox Switcher Style #1 :checked State */

.cb-item_ios-style .cb-item_input:checked + .cb-item_label {
  background-color: #05c096;
  background-color: var(--cb_bg-color_checked);
  border-color: transparent;
}

.cb-item_ios-style .cb-item_input:checked + .cb-item_label .cb-item_marker {
  -webkit-box-shadow: -2px 4px 6px rgba(0, 0, 0, 0.15);
  box-shadow: -2px 4px 6px rgba(0, 0, 0, 0.15);
  -webkit-transform: translateX(22px);
  transform: translateX(22px);
}

/* Checkbox Switcher Style #1 :disabled State */

.cb-item_ios-style .cb-item_input:disabled + .cb-item_label {
  opacity: 0.5;
  cursor: default;
  background-color: #ccc;
  background-color: var(--cb_border-color);
}

.cb-item_ios-style .cb-item_input:disabled + .cb-item_label .cb-item_marker {
  -webkit-box-shadow: 2px 4px 6px rgba(0, 0, 0, 0.07);
  box-shadow: 2px 4px 6px rgba(0, 0, 0, 0.07);
}

/* Checkbox Switcher Style #1 :disabled:checked State */

.cb-item_ios-style .cb-item_input:disabled:checked + .cb-item_label {
  background-color: #05c096;
  background-color: var(--cb_bg-color_checked);
}

.cb-item_ios-style
  .cb-item_input:disabled:checked
  + .cb-item_label
  .cb-item_marker {
  -webkit-box-shadow: -2px 4px 6px rgba(0, 0, 0, 0.07);
  box-shadow: -2px 4px 6px rgba(0, 0, 0, 0.07);
}

/* END Checkbox Switcher Style #1 */

/* Checkbox Switcher Style #2 */

.cb-item_android-style,
.cb-item_android-style *,
.cb-item_android-style *::before,
.cb-item_android-style *::after {
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
}

.cb-item_android-style {
  position: relative;
  display: inline-block;
  --cb_bg-color: #ccc;
  --cb_bg-color_checked: #05c096;
  --cb_marker-bg-color: #fff;
}

.cb-item_input {
  position: absolute;
  opacity: 0;
  z-index: -1;
}

.cb-item_android-style .cb-item_label {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  width: 55px;
  height: 30px;
  cursor: pointer;
  background-color: #ccc;
  background-color: var(--cb_bg-color);
  border-radius: 25px;
  -webkit-transition: all 0.4s ease;
  transition: all 0.4s ease;
  -webkit-tap-highlight-color: rgba(255, 255, 255, 0);
}

.cb-item_android-style .cb-item_marker {
  display: block;
  width: 22px;
  height: 22px;
  background-color: #fff;
  background-color: var(--cb_marker-bg-color);
  border-radius: 50%;
  -webkit-box-shadow: 0 0 1px 0 rgba(0, 0, 0, 0.25),
    0 3px 2px rgba(0, 0, 0, 0.25);
  box-shadow: 0 0 1px 0 rgba(0, 0, 0, 0.25), 0 3px 2px rgba(0, 0, 0, 0.25);
  -webkit-animation: android-style-unswitch 0.25s linear forwards;
  animation: android-style-unswitch 0.25s linear forwards;
}

/* Checkbox Switcher Style #2 :checked State */

.cb-item_android-style .cb-item_input:checked + .cb-item_label {
  background-color: #05c096;
  background-color: var(--cb_bg-color_checked);
}

.cb-item_android-style .cb-item_input:checked + .cb-item_label .cb-item_marker {
  -webkit-animation: android-style-switch 0.25s linear forwards;
  animation: android-style-switch 0.25s linear forwards;
}

/* Checkbox Switcher Style #2 :disabled State */

.cb-item_android-style .cb-item_input:disabled + .cb-item_label {
  opacity: 0.5;
  cursor: default;
}

.cb-item_android-style
  .cb-item_input:disabled
  + .cb-item_label
  .cb-item_marker {
  -webkit-box-shadow: 0 0 1px 0 rgba(0, 0, 0, 0.1), 0 3px 2px rgba(0, 0, 0, 0.1);
  box-shadow: 0 0 1px 0 rgba(0, 0, 0, 0.1), 0 3px 2px rgba(0, 0, 0, 0.1);
}

/* Checkbox Switcher Style #2 Animation */

@-webkit-keyframes android-style-switch {
  0% {
    -webkit-transform: scaleX(1) translateX(4px);
    transform: scaleX(1) translateX(4px);
  }

  25% {
    -webkit-transform: scaleX(1.5) translateX(7px);
    transform: scaleX(1.5) translateX(7px);
  }

  50% {
    -webkit-transform: scaleX(1.5) translateX(14px);
    transform: scaleX(1.5) translateX(14px);
  }

  100% {
    -webkit-transform: scaleX(1) translateX(28px);
    transform: scaleX(1) translateX(28px);
  }
}

@keyframes android-style-switch {
  0% {
    -webkit-transform: scaleX(1) translateX(4px);
    transform: scaleX(1) translateX(4px);
  }

  25% {
    -webkit-transform: scaleX(1.5) translateX(7px);
    transform: scaleX(1.5) translateX(7px);
  }

  50% {
    -webkit-transform: scaleX(1.5) translateX(14px);
    transform: scaleX(1.5) translateX(14px);
  }

  100% {
    -webkit-transform: scaleX(1) translateX(28px);
    transform: scaleX(1) translateX(28px);
  }
}

@-webkit-keyframes android-style-unswitch {
  0% {
    -webkit-transform: scaleX(1) translateX(28px);
    transform: scaleX(1) translateX(28px);
  }

  25% {
    -webkit-transform: scaleX(1.5) translateX(14px);
    transform: scaleX(1.5) translateX(14px);
  }

  50% {
    -webkit-transform: scaleX(1.5) translateX(7px);
    transform: scaleX(1.5) translateX(7px);
  }

  100% {
    -webkit-transform: scaleX(1) translateX(4px);
    transform: scaleX(1) translateX(4px);
  }
}

@keyframes android-style-unswitch {
  0% {
    -webkit-transform: scaleX(1) translateX(28px);
    transform: scaleX(1) translateX(28px);
  }

  25% {
    -webkit-transform: scaleX(1.5) translateX(14px);
    transform: scaleX(1.5) translateX(14px);
  }

  50% {
    -webkit-transform: scaleX(1.5) translateX(7px);
    transform: scaleX(1.5) translateX(7px);
  }

  100% {
    -webkit-transform: scaleX(1) translateX(4px);
    transform: scaleX(1) translateX(4px);
  }
}

/* END Checkbox Switcher Style #2 */
</style>
