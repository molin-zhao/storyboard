<template>
  <div class="cb-item_toggler">
    <input type="checkbox" id="toggler" class="cb-item_input" />
    <label for="toggler" class="cb-item_label">
      <span class="cb-item_marker"></span>
      <span class="cb-item_label-off">{{ offLabel }}</span>
      <span class="cb-item_label-on">{{ onLabel }}</span>
    </label>
  </div>
</template>

<script>
export default {
  props: {
    onLabel: {
      type: String,
      default: "On"
    },
    offLabel: {
      type: String,
      default: "Off"
    }
  }
};
</script>

<style lang="scss" scoped>
/* Checkbox On/Off Toggler */

.cb-item_toggler,
.cb-item_toggler *,
.cb-item_toggler *::before,
.cb-item_toggler *::after {
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
}

.cb-item_toggler {
  position: relative;
  display: inline-block;
  --cb_text-color: #333;
  --cb_marker-bg-color: #fff;
  --cb_marker-bg-color_checked: #05c096;
  --cb_marker-bg-color_disabled: #ccc;
}

.cb-item_input {
  position: absolute;
  opacity: 0;
  z-index: -1;
}

.cb-item_toggler .cb-item_label {
  position: relative;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-pack: justify;
  -ms-flex-pack: justify;
  justify-content: space-between;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  min-width: 50px;
  width: auto;
  cursor: pointer;
  font-size: 18px;
  line-height: 18px;
  color: #333;
  color: var(--cb_text-color);
  background-color: transparent;
  -webkit-transition: all 0.4s ease;
  transition: all 0.4s ease;
  -webkit-tap-highlight-color: rgba(255, 255, 255, 0);
}

@supports (
  (max-width: -webkit-max-content) or (max-width: -moz-max-content) or
    (max-width: max-content)
) {
  .cb-item_toggler .cb-item_label {
    width: -webkit-max-content;
    width: -moz-max-content;
    width: max-content;
  }
}

.cb-item_toggler .cb-item_marker {
  position: relative;
  display: inline-block; /* Needs for IE10 */
  width: 16px;
  height: 16px;
  background-color: #fff;
  background-color: var(--cb_marker-bg-color);
  border-radius: 50%;
  -webkit-box-shadow: 0 0 2px 1px rgba(0, 0, 0, 0.25),
    0 3px 2px rgba(0, 0, 0, 0.25);
  box-shadow: 0 0 2px 1px rgba(0, 0, 0, 0.25), 0 3px 2px rgba(0, 0, 0, 0.25);
  -webkit-transition: all 0.35s ease;
  transition: all 0.35s ease;
}

.cb-item_toggler .cb-item_marker::before {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: transparent;
  border-radius: 50%;
  -webkit-animation: toggler-unswitch 0.4s ease-out;
  animation: toggler-unswitch 0.4s ease-out;
}

.cb-item_label-off,
.cb-item_label-on {
  position: absolute;
  top: -1px;
  right: 0;
  -webkit-transform-origin: center;
  transform-origin: center;
  -webkit-transition: all 0.4s ease;
  transition: all 0.4s ease;
}

.cb-item_label-off {
  opacity: 1;
  -webkit-transform: scale(1);
  transform: scale(1);
}

.cb-item_label-on {
  opacity: 0;
  -webkit-transform: scale(0);
  transform: scale(0);
}

/* Checkbox On/Off Toggler :checked State */

.cb-item_toggler .cb-item_input:checked + .cb-item_label .cb-item_marker,
.cb-item_toggler
  .cb-item_input:disabled:checked
  + .cb-item_label
  .cb-item_marker {
  background-color: #05c096;
  background-color: var(--cb_marker-bg-color_checked);
}

.cb-item_toggler
  .cb-item_input:checked
  + .cb-item_label
  .cb-item_marker::before {
  -webkit-animation: toggler-switch 0.4s ease-out;
  animation: toggler-switch 0.4s ease-out;
}

.cb-item_toggler .cb-item_input:checked + .cb-item_label .cb-item_label-off {
  opacity: 0;
  -webkit-transform: scale(0);
  transform: scale(0);
}

.cb-item_toggler .cb-item_input:checked + .cb-item_label .cb-item_label-on {
  opacity: 1;
  -webkit-transform: scale(1);
  transform: scale(1);
}

/* Checkbox On/Off Toggler :disabled State */

.cb-item_toggler .cb-item_input:disabled + .cb-item_label {
  opacity: 0.5;
  cursor: default;
}

.cb-item_toggler .cb-item_input:disabled + .cb-item_label .cb-item_marker {
  background-color: #ccc;
  background-color: var(--cb_marker-bg-color_disabled);
  -webkit-box-shadow: none;
  box-shadow: none;
}

/* Checkbox On/Off Toggler Animation */

@-webkit-keyframes toggler-switch {
  0% {
    opacity: 0; /* Removes flash bug in Safari */
    -webkit-box-shadow: none;
    box-shadow: none;
  }

  1% {
    opacity: 0.1;
    -webkit-box-shadow: 0 0 0 0 #05c096;
    box-shadow: 0 0 0 0 #05c096;
    -webkit-box-shadow: 0 0 0 0 var(--cb_marker-bg-color_checked);
    box-shadow: 0 0 0 0 var(--cb_marker-bg-color_checked);
  }

  99% {
    opacity: 0.1;
    -webkit-box-shadow: 0 0 5px 15px #05c096;
    box-shadow: 0 0 5px 15px #05c096;
    -webkit-box-shadow: 0 0 5px 15px var(--cb_marker-bg-color_checked);
    box-shadow: 0 0 5px 15px var(--cb_marker-bg-color_checked);
  }

  100% {
    opacity: 0;
    -webkit-box-shadow: none;
    box-shadow: none;
  }
}

@keyframes toggler-switch {
  0% {
    opacity: 0; /* Removes flash bug in Safari */
    -webkit-box-shadow: none;
    box-shadow: none;
  }

  1% {
    opacity: 0.1;
    -webkit-box-shadow: 0 0 0 0 #05c096;
    box-shadow: 0 0 0 0 #05c096;
    -webkit-box-shadow: 0 0 0 0 var(--cb_marker-bg-color_checked);
    box-shadow: 0 0 0 0 var(--cb_marker-bg-color_checked);
  }

  99% {
    opacity: 0.1;
    -webkit-box-shadow: 0 0 5px 15px #05c096;
    box-shadow: 0 0 5px 15px #05c096;
    -webkit-box-shadow: 0 0 5px 15px var(--cb_marker-bg-color_checked);
    box-shadow: 0 0 5px 15px var(--cb_marker-bg-color_checked);
  }

  100% {
    opacity: 0;
    -webkit-box-shadow: none;
    box-shadow: none;
  }
}

@-webkit-keyframes toggler-unswitch {
  0% {
    opacity: 0;
    -webkit-box-shadow: none;
    box-shadow: none;
  }

  1% {
    opacity: 0.15;
    -webkit-box-shadow: 0 0 0 0 #ccc;
    box-shadow: 0 0 0 0 #ccc;
    -webkit-box-shadow: 0 0 0 0 var(--cb_marker-bg-color_disabled);
    box-shadow: 0 0 0 0 var(--cb_marker-bg-color_disabled);
  }

  99% {
    opacity: 0.15;
    -webkit-box-shadow: 0 0 5px 15px #ccc;
    box-shadow: 0 0 5px 15px #ccc;
    -webkit-box-shadow: 0 0 5px 15px var(--cb_marker-bg-color_disabled);
    box-shadow: 0 0 5px 15px var(--cb_marker-bg-color_disabled);
  }

  100% {
    opacity: 0;
    -webkit-box-shadow: none;
    box-shadow: none;
  }
}

@keyframes toggler-unswitch {
  0% {
    opacity: 0;
    -webkit-box-shadow: none;
    box-shadow: none;
  }

  1% {
    opacity: 0.15;
    -webkit-box-shadow: 0 0 0 0 #ccc;
    box-shadow: 0 0 0 0 #ccc;
    -webkit-box-shadow: 0 0 0 0 var(--cb_marker-bg-color_disabled);
    box-shadow: 0 0 0 0 var(--cb_marker-bg-color_disabled);
  }

  99% {
    opacity: 0.15;
    -webkit-box-shadow: 0 0 5px 15px #ccc;
    box-shadow: 0 0 5px 15px #ccc;
    -webkit-box-shadow: 0 0 5px 15px var(--cb_marker-bg-color_disabled);
    box-shadow: 0 0 5px 15px var(--cb_marker-bg-color_disabled);
  }

  100% {
    opacity: 0;
    -webkit-box-shadow: none;
    box-shadow: none;
  }
}

/* END Checkbox On/Off Toggler */

/* Checkbox Classic */

.cb-item_classic,
.cb-item_classic *,
.cb-item_classic *::before,
.cb-item_classic *::after {
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
}

.cb-item_classic {
  position: relative;
  display: block;
  --cb_text-color: #333;
  --cb_bg-color: #fff;
  --cb_bg-color_checked: #05c096;
  --cb_bg-color_disabled: #eee;
  --cb_border-color: #aaa;
}

.cb-item_input {
  position: absolute;
  opacity: 0;
  z-index: -1;
}

.cb-item_classic .cb-item_label {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(255, 255, 255, 0);
}

.cb-item_classic .cb-item_label-content {
  padding-left: 15px;
  color: #333;
  color: var(--cb_text-color);
}

.cb-item_classic .cb-item_marker {
  position: relative;
  display: inline-block; /* Needs for IE10 */
  width: 18px;
  height: 18px;
  background-color: #fff;
  background-color: var(--cb_bg-color);
  border: 1px solid;
  border-color: #aaa;
  border-color: var(--cb_border-color);
  -webkit-box-shadow: 0 2px 3px rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.1);
  -webkit-transition: all 0.25s ease;
  transition: all 0.25s ease;
}

.cb-item_classic .cb-item_marker::before {
  content: "";
  position: absolute;
  top: 7px;
  left: 3px;
  opacity: 0;
  display: block;
  width: 11px;
  height: 7px;
  background-color: transparent;
  border-bottom: 2px solid;
  border-left: 2px solid;
  border-color: #fff;
  border-color: var(--cb_bg-color);
  -webkit-transform-origin: center;
  transform-origin: center;
  -webkit-transform: translateY(-65%) rotate(-45deg);
  transform: translateY(-65%) rotate(-45deg);
  -webkit-transition: all 0.25s ease;
  transition: all 0.25s ease;
}

/* Checkbox Classic :hover State */

.cb-item_classic .cb-item_input:hover + .cb-item_label .cb-item_marker {
  border-color: #333;
  border-color: var(--cb_text-color);
  -webkit-box-shadow: none;
  box-shadow: none;
}

.cb-item_classic .cb-item_input:hover + .cb-item_label .cb-item_marker::before {
  opacity: 0.25;
  border-color: #333;
  border-color: var(--cb_text-color);
}

/* Checkbox Classic :checked State */

.cb-item_classic .cb-item_input:checked + .cb-item_label .cb-item_marker {
  background-color: #05c096;
  background-color: var(--cb_bg-color_checked);
  border-color: transparent;
  -webkit-box-shadow: none;
  box-shadow: none;
}

.cb-item_classic
  .cb-item_input:checked
  + .cb-item_label
  .cb-item_marker::before {
  opacity: 1;
}

.cb-item_classic
  .cb-item_input:checked:hover
  + .cb-item_label
  .cb-item_marker::before {
  border-color: #fff;
  border-color: var(--cb_bg-color);
}

/* Checkbox Classic :disabled State */

.cb-item_classic .cb-item_input:disabled + .cb-item_label {
  cursor: default;
}

.cb-item_classic .cb-item_input:disabled + .cb-item_label .cb-item_marker {
  background-color: #eee;
  background-color: var(--cb_bg-color_disabled);
  border-color: #aaa;
  border-color: var(--cb_border-color);
  -webkit-box-shadow: none;
  box-shadow: none;
}

.cb-item_classic
  .cb-item_input:disabled:hover
  + .cb-item_label
  .cb-item_marker::before {
  opacity: 0;
}

/* Checkbox Classic :disabled:checked State */

.cb-item_classic
  .cb-item_input:disabled:checked
  + .cb-item_label
  .cb-item_marker::before {
  opacity: 1;
  border-color: #333;
  border-color: var(--cb_text-color);
}

/* END Checkbox Classic */

/* Checkbox Classic Rounded */

.cb-item_classic-rnd,
.cb-item_classic-rnd *,
.cb-item_classic-rnd *::before,
.cb-item_classic-rnd *::after {
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
}

.cb-item_classic-rnd {
  position: relative;
  display: block;
  --cb_text-color: #333;
  --cb_bg-color: #fff;
  --cb_bg-color_checked: #05c096;
  --cb_bg-color_disabled: #eee;
  --cb_border-color: #aaa;
}

.cb-item_input {
  position: absolute;
  opacity: 0;
  z-index: -1;
}

.cb-item_classic-rnd .cb-item_label {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(255, 255, 255, 0);
}

.cb-item_classic-rnd .cb-item_label-content {
  padding-left: 15px;
  color: #333;
  color: var(--cb_text-color);
}

.cb-item_classic-rnd .cb-item_marker {
  position: relative;
  display: inline-block; /* Needs for IE10 */
  width: 22px;
  height: 22px;
  background-color: #fff;
  background-color: var(--cb_bg-color);
  border: 1px solid;
  border-color: #aaa;
  border-color: var(--cb_border-color);
  border-radius: 50%;
  -webkit-box-shadow: 0 2px 3px rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.1);
  -webkit-transition: all 0.25s ease;
  transition: all 0.25s ease;
}

.cb-item_classic-rnd .cb-item_marker::before {
  content: "";
  position: absolute;
  top: 9px;
  left: 4px;
  opacity: 0;
  display: block;
  width: 12px;
  height: 8px;
  background-color: transparent;
  border-bottom: 2px solid;
  border-left: 2px solid;
  border-color: #fff;
  border-color: var(--cb_bg-color);
  -webkit-transform-origin: center;
  transform-origin: center;
  -webkit-transform: translateY(-65%) rotate(-45deg);
  transform: translateY(-65%) rotate(-45deg);
  -webkit-transition: all 0.25s ease;
  transition: all 0.25s ease;
}

/* Checkbox Classic Rounded :hover State */

.cb-item_classic-rnd .cb-item_input:hover + .cb-item_label .cb-item_marker {
  border-color: #333;
  border-color: var(--cb_text-color);
  -webkit-box-shadow: none;
  box-shadow: none;
}

.cb-item_classic-rnd
  .cb-item_input:hover
  + .cb-item_label
  .cb-item_marker::before {
  opacity: 0.25;
  border-color: #333;
  border-color: var(--cb_text-color);
}

/* Checkbox Classic Rounded :checked State */

.cb-item_classic-rnd .cb-item_input:checked + .cb-item_label .cb-item_marker {
  background-color: #05c096;
  background-color: var(--cb_bg-color_checked);
  border-color: transparent;
  -webkit-box-shadow: none;
  box-shadow: none;
}

.cb-item_classic-rnd
  .cb-item_input:checked
  + .cb-item_label
  .cb-item_marker::before {
  opacity: 1;
}

.cb-item_classic-rnd
  .cb-item_input:checked:hover
  + .cb-item_label
  .cb-item_marker::before {
  border-color: #fff;
  border-color: var(--cb_bg-color);
}

/* Checkbox Classic Rounded :disabled State */

.cb-item_classic-rnd .cb-item_input:disabled + .cb-item_label {
  cursor: default;
}

.cb-item_classic-rnd .cb-item_input:disabled + .cb-item_label .cb-item_marker {
  background-color: #eee;
  background-color: var(--cb_bg-color_disabled);
  border-color: #aaa;
  border-color: var(--cb_border-color);
  -webkit-box-shadow: none;
  box-shadow: none;
}

.cb-item_classic-rnd
  .cb-item_input:disabled:hover
  + .cb-item_label
  .cb-item_marker::before {
  opacity: 0;
}

/* Checkbox Classic Rounded :disabled:checked State */

.cb-item_classic-rnd
  .cb-item_input:disabled:checked
  + .cb-item_label
  .cb-item_marker::before {
  opacity: 1;
  border-color: #333;
  border-color: var(--cb_text-color);
}

/* END Checkbox Classic Rounded */
</style>
