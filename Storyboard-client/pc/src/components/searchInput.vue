<template>
  <div class="wrapper">
    <div class="icon-wrapper">
      <icon name="search" style="color: grey; width: 20px; height: 20px" />
    </div>
    <div class="input-wrapper">
      <input
        class="search-input"
        style="width: 95%; height: 100%; border: none"
        @input="onInput($event)"
      />
    </div>
    <div class="loading-wrapper">
      <span
        v-if="searching"
        class="spinner-border spinner-border-sm"
        style="color: lightgrey"
        role="status"
        aria-hidden="true"
      ></span>
    </div>
  </div>
</template>

<script>
import { parser } from "@/common/utils/array";
export default {
  props: {
    url: {
      type: String
    },
    dataSource: {
      type: Object
    },
    limit: {
      type: Number,
      default: 10
    },
    searchStrategy: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
      timer: null,
      value: "",
      searching: false
    };
  },
  methods: {
    onInput(e) {
      clearTimeout(this.timer);
      let value = e.target.value;
      if (value.length > 0) {
        this.searching = true;
        this.timer = setTimeout(() => {
          clearTimeout(this.timer);
          this.$emit("input-change", value);
          this.timer = null;
          let trimmedVal = value.trim(" ");
          if (this.searchStrategy) return this.searchStrategy(trimmedVal);
          if (
            this.dataSource[trimmedVal] != null &&
            this.dataSource[trimmedVal].data &&
            this.dataSource[trimmedVal].data.length > 0
          ) {
            this.searching = false;
            return this.$emit("on-result", { value: trimmedVal, data: [] });
          }
          return this.startSearch(trimmedVal);
        }, 1000);
      } else {
        this.$emit("input-change", "");
        this.searching = false;
        this.timer = null;
      }
    },
    async startSearch(value) {
      try {
        const { url, dataSource, limit } = this;
        let exclude = dataSource[value]
          ? parser(dataSource[value].data, "_id")
          : [];
        const resp = await this.$http.post(
          url,
          { value, exclude, limit },
          { emulateJSON: true }
        );
        this.$emit("on-result", resp.data.data);
      } catch (err) {
        this.$emit("on-error", err);
      } finally {
        this.searching = false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 5px;
  border: lightgrey 1px solid;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: nowrap;
  cursor: pointer;
  .icon-wrapper {
    width: 10%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .input-wrapper {
    width: 80%;
    height: 100%;
  }
  .loading-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 10%;
    height: 100%;
  }
}
.search-input {
  cursor: pointer;
}
.search-input:focus {
  outline: none;
}
</style>
