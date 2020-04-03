<template>
  <div class="warehouse-wrapper">
    <div class="warehouse-data">
      <vue-scroll :ops="ops">
        <div class="warehouse-data-row">
          <div
            class="warehouse-data-col display-only"
            v-for="(field, index) in warehouse[selectIndex]['fields']"
            :key="index"
          >
            <span>{{ field.name }}</span>
          </div>
        </div>
        <div class="warehouse-data-list" v-if="uploaded.length > 0">
          <div class="warehouse-data-row" v-for="(row, i) in uploaded" :key="i">
            <div class="warehouse-data-col" v-for="(item, j) in row" :key="j">
              <span>{{ item }}</span>
            </div>
          </div>
          <select @change="selectField($event)">
            <option
              v-for="(field, index) in warehouse[selectIndex]['fields']"
              :key="index"
              >{{ field.name }}</option
            >
          </select>
        </div>
        <div class="warehouse-data-list" v-else>
          <div
            class="warehouse-data-row"
            v-for="(field, index) in warehouse[selectIndex]['items']"
            :key="index"
          >
            <div
              class="warehouse-data-col"
              v-for="item in warehouse[selectIndex]['items']"
              :key="item._id"
            >
              <span>{{ computedItemValue(field, item) }}</span>
            </div>
          </div>
        </div>
      </vue-scroll>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import vueScroll from "vuescroll";
export default {
  components: {
    vueScroll,
  },
  data() {
    return {
      ops: {
        vuescroll: {
          mode: "native",
        },
        scrollPanel: {
          scrollingY: false,
        },
        bar: {
          background: "lightgrey",
        },
      },
    };
  },
  props: {
    selectIndex: {
      type: Number,
      default: 0,
    },
    uploaded: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    ...mapState("warehouse", ["warehouse"]),
    computedItemValue() {
      return function (field, item) {
        let itemFields = item["fields"];
        for (let fieldRef in itemFields) {
          if (fieldRef["field_ref"]["name"] === field["name"]) {
            return fieldRef["value"];
          }
        }
      };
    },
  },
  method: {
    async searchItemsByField() {
      const { uploadedBOM, selectedField } = this;
      if (!uploadedBOM) return;
      let selectedFieldValues = uploadedBOM.map((row) => row[selectedField]);
      console.log(selectedFieldValues);
    },
    selectField(e) {
      this.selectedField = e.target.selectIndex;
    },
  },
};
</script>

<style lang="scss" scoped>
.warehouse-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  position: relative;
}

.warehouse-data {
  width: 100%;
  height: 95%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}
.warehouse-data-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}
.warehouse-data-row {
  display: flex;
  width: 100%;
  height: 50px;
  justify-content: center;
  align-items: center;
  border-bottom: 1px gainsboro solid;
}

.warehouse-data-col {
  flex: 1;
  min-width: 50px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  flex-wrap: nowrap;
  span {
    font-size: 14px;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: center;
    white-space: nowrap;
    width: 95%;
  }
}

.uploaded-feedback {
  position: absolute;
  width: 80%;
  height: 70px;
  transform: translateX(-50%);
  left: 50%;
  bottom: 30px;
  background-color: white;
  border: 1px whitesmoke solid;
  border-radius: 10px;
  box-shadow: -5px 2px 5px gainsboro;
  -webkit-box-shadow: -5px 2px 5px gainsboro;
  z-index: 1;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  a {
    width: 50px;
    height: 50px;
    border-radius: 25px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.fade-enter,
.fade-leave-to {
  bottom: -100px;
}
.fade-leave,
.fade-enter-to {
  bottom: 30px;
}
.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s;
}
</style>
