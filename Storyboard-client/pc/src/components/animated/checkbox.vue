<template>
  <div :class="computedClass">
    <input
      type="checkbox"
      :id="uniqueId"
      class="cb-item_input"
      :checked="checked"
      :disabled="disabled"
    />
    <label :for="uniqueId" class="cb-item_label">
      <span class="cb-item_marker" style="transform: translateY(18%)"></span>
      <span class="cb-item_label-content" style="transform: translateY(18%)">{{
        label
      }}</span>
    </label>
  </div>
</template>

<script>
export default {
  props: {
    rounded: {
      type: Boolean,
      default: true
    },
    label: {
      type: String,
      default: "Active"
    },
    uniqueId: {
      type: String,
      required: true
    },
    checked: {
      type: Boolean
    },
    disabled: {
      type: Boolean
    }
  },
  computed: {
    computedClass() {
      const { rounded } = this;
      return `cb-item_classic${rounded ? "-rnd" : null}`;
    }
  }
};
</script>

<style lang="scss" scoped>
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
