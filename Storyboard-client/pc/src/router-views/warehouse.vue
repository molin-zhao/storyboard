<template>
  <div class="mainboard">
    <div class="mainboard-title">
      <div class="mainboard-title-name">
        <span style="font-size: 40px;">{{ $t("WAREHOUSE") }}</span>
      </div>
      <div class="mainboard-title-right">
        <badge-icon
          :wrapper-style="more.wrapperStyle"
          :icon-style="more.iconStyle"
          :icon-name="more.iconName"
          @mouseover.native="mouseover('more')"
          @mouseleave.native="mouseleave('more')"
        >
          <popover ref="more" style="right: 2.5vw; top: -20px;">
            <tooltip
              content-style="
                width: 200px;
                height: 100px;
                border-radius: 10px;
                box-shadow: -5px 2px 5px lightgrey; 
                -webkit-box-shadow: -5px 2px 5px lightgrey;
                border: 1px solid whitesmoke;
                "
              arrow-placement="right"
              arrow-position="top: calc(1.5vw)"
              background-color="white"
              border-color="whitesmoke"
            >
              <div class="settings-top-align">
                <a
                  @click.stop="importBOM"
                  style="
                    border-top: none;
                    border-top-left-radius: 10px;
                    border-top-right-radius: 10px;
                  "
                >
                  <icon
                    class="setting-icon"
                    name="import"
                    style="color: grey;"
                  />
                  <span style="color: grey;">{{ $t("IMPORT_PROJECT") }}</span>
                </a>
                <a
                  @click.stop="exportBOM"
                  style="
                    border-bottom: none;
                    border-bottom-left-radius: 10px;
                    border-bottom-right-radius: 10px;
                  "
                >
                  <icon
                    class="setting-icon"
                    name="export"
                    style="color: grey;"
                  />
                  <span style="color: grey;">{{ $t("EXPORT_PROJECT") }}</span>
                </a>
              </div>
            </tooltip>
          </popover>
        </badge-icon>
      </div>
    </div>
    <div class="mainboard-info"></div>
    <div class="mainboard-body">
      <div class="loading" v-if="loading">
        <div
          class="spinner-border text-primary spinner-border-bg"
          role="status"
          style="margin-top: -30%;"
        >
          <span class="sr-only">Loading...</span>
        </div>
      </div>
      <div class="loading" v-else>
        <div class="warehouse-wrapper" v-if="warehouse.length > 0">
          <div class="warehouse-nav">
            <div
              class="nav-item"
              v-for="(item, index) in warehouse"
              :key="index"
            >
              <div class="nav-link display-only" :style="navActiveStyle(index)">
                <div
                  class="nav-link-content"
                  @click.stop="selectWarehouseIndex(index)"
                >
                  <span>{{ computedWarehouseName(index) }} </span>
                </div>
              </div>
            </div>
            <div class="nav-item">
              <div
                class="nav-link"
                style="padding: 0; background-color: whitesmoke;"
                @click.stop="createWarehouse"
              >
                <icon
                  name="add"
                  style="width: 25px; height: 25px; color: gray;"
                />
              </div>
            </div>
          </div>
          <warehouse-DB :selectIndex="selectIndex" :uploaded="uploadedBOM" />
          <transition name="show">
            <div v-show="showUploadedFeedback" class="uploaded-feedback">
              <a class="a-btn">
                <icon
                  name="closecircle"
                  style="
                    color: var(--main-color-danger);
                    width: 40px;
                    height: 40px;
                  "
                />
              </a>
              <a class="a-btn" @click.stop="hideFeedback">
                <icon
                  name="checkcircle"
                  style="
                    color: var(--main-color-success);
                    width: 40px;
                    height: 40px;
                  "
                />
              </a>
            </div>
          </transition>
        </div>
        <div class="loading" v-else>
          <a
            style="cursor: pointer;"
            class="text-primary"
            @click.stop="createWarehouse"
            >{{ $t("CREATE_WAREHOUSE") }}</a
          >
        </div>
      </div>
    </div>
    <modal ref="import-modal" @on-modal-hide="resetModal">
      <h5 slot="modal-header" class="modal-title">
        {{ $t("IMPORT_FILE") }}
      </h5>
      <div slot="modal-body">
        <form style="width: 300px; height: 200px;">
          <div class="form-group form-left-centered">
            <label
              >{{ $t("CHOOSE_FILE")
              }}<span style="font-size: 12px; color: red;">*</span></label
            >
            <div class="form-row" style="width: 100%; margin: 0; padding: 0;">
              <div class="my-file-input">
                <input type="file" ref="file-input" @change="getFile" />
                <div v-show="file">
                  <span>{{ computedUploadFileName }}</span>
                </div>
                <a @click.stop="browseFile" class="a-btn display-only">{{
                  $t("BROWSE")
                }}</a>
              </div>
            </div>
          </div>
        </form>
      </div>
      <div class="modal-footer" slot="modal-footer">
        <button
          :disabled="computedBtnDisabled"
          type="submit"
          :class="computedCreateBtnClass"
          @click.stop="submitFile"
        >
          <span
            v-if="uploading === 'doing'"
            class="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          ></span>
          <span v-else-if="uploading === 'todo'">{{ $t("CONFIRM") }}</span>
          <span v-else>{{ $t("DONE") }}</span>
        </button>
        <button
          type="submit"
          class="btn btn-sm btn-danger create-btn"
          @click.stop="hideModal"
        >
          <span>{{ $t("CANCEL") }}</span>
        </button>
      </div>
    </modal>
  </div>
</template>

<script>
import warehouseDB from "@/components/warehouseDB";
import badgeIcon from "@/components/badgeIcon";
import popover from "@/components/popover";
import tooltip from "@/components/tooltip";
import modal from "@/components/modal";
import { more } from "@/common/theme/style";
import { mouseclick, mouseover, mouseleave } from "@/common/utils/mouse";
import * as URL from "@/common/utils/url";
import { mapState, mapMutations } from "vuex";
export default {
  components: {
    warehouseDB,
    badgeIcon,
    popover,
    tooltip,
    modal
  },
  mounted() {
    this.fetchWarehouse();
  },
  data() {
    return {
      more,
      loading: false,
      uploading: "todo",
      selectIndex: 0,
      file: null,
      uploadedBOM: [],
      showUploadedFeedback: false
    };
  },

  computed: {
    ...mapState("user", ["id", "token"]),
    ...mapState("warehouse", ["warehouse"]),
    computedWarehouseName() {
      return function(index) {
        return this.warehouse[index]["name"];
      };
    },
    navActiveStyle() {
      return function(index) {
        const { selectIndex } = this;
        return index === selectIndex
          ? "background-color: white; color: black"
          : "background-color: whitesmoke; color: gray";
      };
    },
    computedBtnDisabled() {
      return this.file ? false : true;
    },
    computedCreateBtnClass() {
      const { uploading } = this;
      return `btn btn-sm btn-${
        uploading === "done" ? "success" : "primary"
      } create-btn`;
    },
    computedUploadFileName() {
      const { file } = this;
      if (file) return file.name;
      return "";
    }
  },
  methods: {
    ...mapMutations({
      reload_warehouse: "warehouse/reload_warehouse"
    }),
    mouseclick,
    mouseover,
    mouseleave,
    createWarehouse() {
      $("#modal-create-warehouse").modal("show");
    },
    selectWarehouseIndex(index) {
      if (index !== this.selectIndex) this.selectIndex = index;
    },
    async fetchWarehouse() {
      try {
        const { id } = this;
        let url = URL.GET_USER_WAREHOUSE(id);
        this.loading = true;
        const resp = await this.$http.get(url);
        this.reload_warehouse(resp.data.data);
      } catch (e) {
      } finally {
        this.loading = false;
      }
    },
    importBOM() {
      this.$refs["import-modal"].show();
    },
    hideModal() {
      this.$refs["import-modal"].hide();
    },
    exportBOM() {},
    browseFile() {
      this.$refs["file-input"].dispatchEvent(new MouseEvent("click"));
    },
    getFile() {
      let fileDOM = this.$refs["file-input"];
      let file = fileDOM.files[0];
      const fileExt = file.name.split(".")[1];
      const ext_xlx = "xls";
      const ext_xlsx = "xlsx";
      if (fileExt !== ext_xlx && fileExt !== ext_xlsx) {
        return this.$alert.show({
          type: "warning",
          message: this.$t("FILE_EXTENSION_NOT_SUPPORT"),
          interval: 5000
        });
      }
      if (file.size > 1024 * 1024 * 5) {
        return this.$alert.show({
          type: "warning",
          message: this.$t("FILE_EXCEED_MAX_SIZE", { limit: "5M" }),
          interval: 5000
        });
      }
      this.file = file;
      fileDOM.value = null;
    },
    async submitFile() {
      try {
        const { file, warehouse, selectIndex } = this;
        if (!file) return;
        let fields = warehouse[selectIndex]["fields"];
        let fieldNames = fields.map(f => f.name);
        let formData = new FormData();
        formData.append("file", file);
        formData.append("fields", JSON.stringify(fieldNames));
        let url = URL.POST_FILE_UPLOAD();
        this.uploading = "doing";
        console.log(url);
        const resp = await this.$http.post(url, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        this.uploadedBOM = resp.data.data; // 2 dimensional array
        this.uploading = "done";
        setTimeout(() => {
          this.hideModal();
        }, 1000);
      } catch (err) {
        this.uploading = "todo";
      }
    },
    resetModal() {
      this.file = null;
      this.uploading = "todo";
    },
    hideFeedback() {
      this.showUploadedFeedback = false;
    }
  },
  watch: {
    uploadedBOM(newVal, oldVal) {
      if (newVal.length > 0) this.showUploadedFeedback = true;
      else this.showUploadedFeedback = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.loading {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.warehouse-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  position: relative;
}
.warehouse-nav {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-end;
  flex-wrap: nowrap;
  width: 100%;
  height: 50px;
  border-bottom: lightgrey 1px solid;
}
.my-file-input {
  width: 100%;
  height: 50px;
  border: 1px gainsboro solid;
  border-radius: 10px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  position: relative;
  input {
    width: 80%;
    height: 100%;
    opacity: 0;
  }
  div {
    position: absolute;
    width: 80%;
    height: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  a {
    width: 20%;
    height: 100%;
    background-color: whitesmoke;
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

.show-enter,
.show-leave-to {
  bottom: -100px;
}
.show-leave,
.show-enter-to {
  bottom: 30px;
}
.show-enter-active,
.show-leave-active {
  transition: all 0.2s;
}
</style>
