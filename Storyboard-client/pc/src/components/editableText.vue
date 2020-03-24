<template>
  <div ref="editableText" class="wrapper" :style="computedWrapperStyle">
    <span
      class="display-only"
      v-show="!editing"
      :style="computedTextLabelStyle"
    >
      {{ computedValue }}</span
    >
    <div v-show="editing && editable" class="input-wrapper">
      <input
        ref="input"
        v-if="row === 1"
        :placeholder="computedValue"
        v-model="inputValue"
        class="input"
        :style="inputStyle"
        @keyup.enter="endEditing"
        @input="onInput($event)"
      />
      <textarea
        ref="input"
        v-else
        :placeholder="computedValue"
        v-model="inputValue"
        class="input"
        :style="inputStyle"
        :rows="row"
        @keyup.enter="endEditing"
        @input="onInput($event)"
      />
    </div>
  </div>
</template>

<script>
import en from "@/i18n/lang/en.js";
export default {
  props: {
    value: {
      type: String
    },
    defaultValue: {
      type: String,
      required: true
    },
    row: {
      type: Number,
      default: 1
    },
    inputStyle: {
      type: String,
      default: ""
    },
    editable: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      editing: false,
      inputValue: this.value
    };
  },
  computed: {
    computedValue() {
      if (this.inputValue) return this.inputValue;
      else if (en[this.defaultValue]) return this.$t(`${this.defaultValue}`);
      return this.defaultValue;
    },
    computedWrapperStyle() {
      if (this.row === 1) {
        return `
        justify-content: center;
        align-items: flex-start;
        flex-wrap: nowrap;
        `;
      } else {
        return `
        justify-content: flex-start;
        align-items: flex-start;
        flex-wrap: wrap;
        `;
      }
    },
    computedTextLabelStyle() {
      if (this.row === 1) {
        // single line input
        return `
        width: 100%;
        overflow: hidden; 
        text-align: left; 
        text-overflow: ellipsis; 
        white-space: nowrap; 
        ${this.inputStyle}`;
      } else {
        // multiple lines textarea
        return `
        width: 100%; 
        overflow: hidden; 
        text-align: left; 
        display: -webkit-box; 
        -webkit-box-orient: vertical; 
        -webkit-line-clamp: ${this.row}; 
        text-overflow: ellipsis; 
        word-wrap: normal; 
        word-break: normal;
        ${this.inputStyle}`;
      }
    }
  },
  created() {
    document.addEventListener("click", this.checkMouseClick);
  },
  beforeDestroy() {
    document.removeEventListener("click", this.checkMouseClick);
  },
  methods: {
    checkMouseClick(event) {
      const e = event || window.event;
      let { type, target } = e;
      if (
        this.$refs["editableText"] &&
        this.$refs["editableText"].contains(target)
      ) {
        return this.beginEditing();
      } else {
        return this.endEditing();
      }
    },
    endEditing() {
      const { editing, inputValue, value, computedValue } = this;
      if (!editing) return;
      this.editing = false;
      this.$emit("lost-focus");
      let trimmedValue = inputValue ? inputValue.trim() : "";
      if (trimmedValue !== value) {
        // props value does not match input value, emit change event
        this.$emit("input-change", trimmedValue);
      }
    },
    beginEditing() {
      if (this.editing) return;
      // first time click, autofocus textinput
      this.editing = true;
      this.$nextTick(() => {
        if (this.$refs["input"] && this.$refs["input"].focus) {
          // autofocus
          this.$refs["input"].focus();
          this.$emit("on-focus");
        }
      });
    },
    onInput(e) {
      let value = e.target.value;
      this.$emit("on-typing", value);
    },
    clear() {
      this.inputValue = "";
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../common/theme/container.css";
.input-wrapper {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

.input-value {
  display: block;
  word-wrap: break-word;
  text-overflow: ellipsis;
  overflow: hidden;
}
.wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}
.wrapper:hover {
  cursor: pointer;
}
.input {
  width: 100%;
  height: 100%;
  background-color: none;
  display: block；;
  border-radius: 4px;
  -moz-border-radius: 4px;
  -webkit-border-radius: 4px;
  border: 1px solid #ccc;
}
.input:focus {
  border: 1px dashed gainsboro;
  outline: none;
}
</style>
