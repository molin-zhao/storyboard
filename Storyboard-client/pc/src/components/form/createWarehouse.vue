<template>
  <div id="modal-create-warehouse" class="modal fade" role="dialog">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title display-only">
            {{ $t("CREATE_WAREHOUSE") }}
          </h5>
          <a
            style="font-size: 20px; cursor: pointer"
            class="display-only"
            aria-hidden="true"
            aria-label="Close"
            data-target="#modal-create-warehouse"
            data-dismiss="modal"
            >&times;</a
          >
        </div>
        <div class="modal-body">
          <form style="wrapper">
            <div class="form-group form-left-centered">
              <label
                >{{ $t("WAREHOUSE_NAME")
                }}<span style="font-size: 12px;color: red">*</span></label
              >
              <div class="form-row" style="width: 100%; margin: 0; padding: 0">
                <input
                  :class="`form-control ${nameError ? 'is-invalid' : null}`"
                  :style="computedNameStyle(nameError)"
                  v-model="name"
                  :placeholder="$t('REQUIRED')"
                  @input="nameOnInput($event)"
                />
              </div>
              <span class="form-text text-danger error-text">{{
                nameError
              }}</span>
            </div>
            <div class="form-group form-left-centered">
              <label>{{ $t("WAREHOUSE_DESCRIPTION") }}</label>
              <textarea
                class="form-control"
                rows="3"
                :placeholder="$t('OPTIONAL')"
                v-model="description"
              ></textarea>
            </div>
            <div class="form-group form-left-centered">
              <label
                >{{ $t("WAREHOUSE_FIELDS")
                }}<span style="font-size: 12px;color: red">*</span></label
              >
              <div class="form-row" style="width: 100%; margin: 0; padding: 0">
                <div class="field">
                  <div class="field-row">
                    <div class="field-col">
                      <span>{{ $t("FIELD_NAME") }}</span>
                    </div>
                    <div class="field-col">
                      <span>{{ $t("FIELD_TYPE") }}</span>
                    </div>
                  </div>
                  <div class="field-row">
                    <div class="field-col">
                      <span>{{ $t("FIELD_NAME_NAME") }}</span>
                    </div>
                    <div class="field-col">
                      <span>{{ $t("FIELD_TYPE_STRING") }}</span>
                    </div>
                  </div>
                  <div class="field-row">
                    <div class="field-col">
                      <span>{{ $t("FIELD_STOCK_NAME") }}</span>
                    </div>
                    <div class="field-col">
                      <span>{{ $t("FIELD_TYPE_NUMBER") }}</span>
                    </div>
                  </div>
                  <div
                    class="field-row"
                    v-for="(item, index) in fields"
                    :key="index"
                  >
                    <div class="field-col">
                      <div
                        class="field-item-option"
                        @click.stop="removeField(index)"
                      >
                        <icon
                          name="minus"
                          style="color: var(--main-color-danger)"
                        />
                      </div>
                      <span> {{ item.name }} </span>
                    </div>
                    <div class="field-col">
                      <span>{{ computedFieldTypeName(item.type) }}</span>
                    </div>
                  </div>
                  <div class="field-row">
                    <div class="field-col">
                      <div class="field-item-option" @click.stop="addField">
                        <icon
                          name="plus"
                          style="color: var(--main-color-blue)"
                        />
                      </div>
                      <input v-model="fieldName" />
                    </div>
                    <div class="field-col">
                      <select
                        style="width: 50%; height: 90%"
                        @change.stop="fieldTypeSelect($event)"
                      >
                        <option selected>{{ $t("FIELD_TYPE_STRING") }}</option>
                        <option>{{ $t("FIELD_TYPE_NUMBER") }}</option>
                        <option>{{ $t("FIELD_TYPE_BOOLEAN") }}</option>
                        <option>{{ $t("FIELD_TYPE_DATE") }}</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="form-group form-left-centered">
              <label
                >{{ $t("WAREHOUSE_MEMBERS")
                }}<span style="color: grey">{{ $t("OPTIONAL") }}</span></label
              >
              <div class="select">
                <div class="method">
                  <select
                    class="custom-select"
                    style="width: 100%; height: 90%"
                    @change.stop="addMemberMethodSelect($event)"
                  >
                    <option selected>{{ $t("SEARCH_ADD") }}</option>
                    <option>{{ $t("TEAM_ADD") }}</option>
                  </select>
                </div>
                <div class="source">
                  <div
                    v-if="addMemberMethod === 0"
                    style="width: 100%; height: 50px"
                  >
                    <search-input
                      style="margin-left: 10%;height: 90%; width: 90%; border-radius: 10px"
                      :url="computedSearchUrl"
                      :data-source="searchResult"
                      :limit="5"
                      @on-error="onSearchError"
                      @on-result="onSearchResult"
                      @input-change="searchInputChange"
                    />
                  </div>
                  <div v-else style="width: 100%; height: 50px">
                    <select
                      class="custom-select"
                      style="margin-left: 10%; width: 90%; height: 90%"
                      @change.stop="teamIndexSelect($event)"
                    >
                      <option v-if="teams.length === 0" selected>{{
                        $t("NO_TEAM_FOUND")
                      }}</option>
                      <option v-else v-for="item in teams" :key="item._id">{{
                        item.name
                      }}</option>
                    </select>
                  </div>
                  <div style="width: 100%" v-if="addMemberMethod === 0">
                    <div class="source-display" v-if="computedShowSearchResult">
                      <vue-scroll :ops="ops">
                        <div
                          style="width: 100%; height: 50px"
                          v-for="item in searchResult[searchValue].data"
                          :key="item._id"
                        >
                          <user-add-delete-cell
                            :item="item"
                            :exclude-list="computedMembers"
                            @remove-user="removeUser"
                            @add-user="addUser"
                          />
                        </div>
                      </vue-scroll>
                    </div>
                    <div
                      class="source-display-empty"
                      v-else-if="computedShowSearchResultEmpty"
                    >
                      <span>{{ $t("NO_USER_FOUND") }}</span>
                    </div>
                    <div v-else></div>
                  </div>
                  <div style="width: 100%" v-else>
                    <div class="source-display" v-if="computedShowTeamResult">
                      <vue-scroll :ops="ops">
                        <div
                          style="width: 100%; height: 50px"
                          v-for="item in teams[teamSelect].members"
                          :key="item._id"
                        >
                          <user-add-delete-cell
                            :item="item"
                            :exclude-list="members"
                            @remove-user="removeUser"
                            @add-user="addUser"
                          />
                        </div>
                      </vue-scroll>
                    </div>
                    <div v-else-if="computedShowTeamResultEmpty">
                      <span>{{ $t("NO_USER_FOUND") }}</span>
                    </div>
                    <div v-else></div>
                  </div>
                </div>
              </div>
              <div class="selected-display" v-show="members.length > 0">
                <label>{{ $t("ADDED_MEMBER") }}</label>
                <div class="selected">
                  <div
                    class="selected-user"
                    v-for="item in members"
                    :key="item._id"
                    @click.stop="removeUser(item)"
                    data-toggle="tooltip"
                    data-placement="right"
                    :title="computedTooltipTitle(item)"
                  >
                    <avatar
                      style="width: 50px; height: 50px; border-radius: 5px; object-fit: cover"
                      :src="item.avatar"
                      default-img="/static/image/user_empty.png"
                    />
                    <icon name="close" class="selected-user-remove" />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button
            :disabled="computedCreateBtnDisabled"
            type="submit"
            :class="computedCreateBtnClass"
            @click.stop="createNewWarehouse"
          >
            <span
              v-if="createStatus === 'doing'"
              class="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
            <span v-else-if="createStatus === 'todo'">{{ $t("CREATE") }}</span>
            <span v-else>{{ $t("DONE") }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import searchInput from "@/components/searchInput";
import userAddDeleteCell from "@/components/userAddDeleteCell";
import avatar from "@/components/avatar";
import vueScroll from "vuescroll";
import { mapState, mapMutations } from "vuex";
import { parser } from "@/common/utils/array";
import { sliceFromLeft } from "@/common/utils/string";
import * as URL from "@/common/utils/url";
export default {
  components: {
    searchInput,
    userAddDeleteCell,
    vueScroll,
    avatar
  },
  data() {
    return {
      name: "",
      fieldName: "",
      nameError: "",
      description: "",
      fields: [],
      members: [],
      createStatus: "todo",
      addMemberMethod: 0,
      teamSelect: 0,
      fieldType: 0,
      searchResult: {},
      searchValue: "",
      searchLimit: 5,
      ops: {
        vuescroll: {
          mode: "native"
        },
        scrollPanel: {
          scrollingX: false
        },
        bar: {
          background: "lightgrey"
        }
      }
    };
  },
  mounted() {
    $("#modal-create-warehouse").on("hidden.bs.modal", () => {
      this.resetForm();
    });
  },
  computed: {
    ...mapState("team", ["teams"]),
    ...mapState("user", ["id", "token"]),
    computedSearchUrl() {
      return URL.POST_SEARCH_USER();
    },
    computedNameStyle() {
      return function(error) {
        return `width: 100%; ${error ? "border-color: lightcoral" : null}`;
      };
    },
    computedCreateBtnDisabled() {
      const { createStatus, name, nameError } = this;
      if (createStatus === "todo" && name && !nameError) return false;
      return true;
    },
    computedShowSearchResult() {
      const { searchResult, searchValue } = this;
      let trimmedValue = searchValue.trim(" ");
      let resultObject = searchResult[trimmedValue];
      return (
        trimmedValue && resultObject != null && resultObject.data.length > 0
      );
    },
    computedShowSearchResultEmpty() {
      const { searchResult, searchValue } = this;
      let trimmedValue = searchValue.trim(" ");
      let resultObject = searchResult[trimmedValue];
      return (
        trimmedValue && resultObject != null && resultObject.data.length === 0
      );
    },
    computedShowTeamResult() {
      const { teamSelect, teams } = this;
      return teams.length > 0 && teams[teamSelect].members.length > 0;
    },
    computedShowTeamResultEmpty() {
      const { teamSelect, teams } = this;
      return teams.length > 0 && teams[teamSelect].members.length === 0;
    },
    computedMembers() {
      const { members } = this;
      return parser(members, "_id");
    },
    computedTooltipTitle() {
      return function(item) {
        // max length 10
        return sliceFromLeft(item.username, 10);
      };
    },
    computedCreateBtnClass() {
      const { createStatus } = this;
      return `btn btn-sm btn-${
        createStatus === "done" ? "success" : "primary"
      } create-btn`;
    },
    computedFieldTypeName() {
      return function(index) {
        switch (index) {
          case 0:
            // string
            return this.$t("FIELD_TYPE_STRING");
          case 1:
            // number
            return this.$t("FIELD_TYPE_NUMBER");
          case 2:
            // bool
            return this.$t("FIELD_TYPE_BOOLEAN");
          case 3:
            // date
            return this.$t("FIELD_TYPE_DATE");
          default:
            return "";
        }
      };
    }
  },
  methods: {
    ...mapMutations({
      add_warehouse: "warehouse/add_warehouse"
    }),
    formCheck() {
      if (!this.name) {
        this.nameError = this.$t("REQUIRED_FIELD");
        return false;
      }
      return true;
    },
    transformFieldType(fieldIndex) {
      switch (fieldIndex) {
        case 0:
          // string
          return "string";
        case 1:
          // number
          return "number";
        case 2:
          // bool
          return "boolean";
        case 3:
          // date
          return "date";
        default:
          return "string";
      }
    },
    formData() {
      const { name, description, members, id, fields } = this;
      const convertedFields = fields.map(field => {
        return {
          name: field.name,
          type: this.transformFieldType(field.type)
        };
      });
      const _fields = [
        { name: this.$t("FIELD_NAME_NAME"), type: "string" },
        { name: this.$t("FIELD_STOCK_NAME"), type: "number" }
      ].concat(convertedFields);
      return {
        name: name.trim(),
        description: description.trim(),
        members: parser(members, "_id"),
        user: id,
        fields: _fields
      };
    },
    resetForm() {
      this.name = "";
      this.description = "";
      this.nameError = "";
      this.members = [];
      this.fields = [];
      this.addMemberMethod = 0;
      this.teamSelect = 0;
      this.fieldType = 0;
      this.searchResult = {};
      this.searchValue = "";
      this.createStatus = "todo";
    },
    addMemberMethodSelect(e) {
      this.addMemberMethod = e.target.selectedIndex;
    },
    fieldTypeSelect(e) {
      this.fieldType = e.target.selectedIndex;
    },
    teamIndexSelect(e) {
      this.teamSelect = e.target.selectedIndex;
    },
    addField() {
      const { fieldName, fieldType } = this;
      if (!fieldName.trim()) return;
      this.fields = this.fields.concat({
        name: fieldName.trim(),
        type: fieldType
      });
      this.fieldName = "";
      this.fieldType = 0;
    },
    removeField(index) {
      try {
        this.fields.splice(index, 1);
      } catch (e) {}
    },
    onSearchError(err) {
      console.log(err);
    },
    onSearchResult(res) {
      let searchValue = res.value;
      let data = res.data;
      let hasMore = res.data.length < this.searchLimit ? false : true;
      let newData = this.searchResult[searchValue]
        ? this.searchResult[searchValue].data.concat(data)
        : data;
      let newProperty = { data: newData, hasMore };
      this.$set(this.searchResult, searchValue, newProperty);
    },
    searchInputChange(val) {
      this.searchValue = val.trim(" ");
    },
    removeUser(user) {
      this.members = this.members.filter(u => u._id !== user._id);
    },
    addUser(user) {
      let containUser = this.members.some(u => {
        if (u._id === user._id) return true;
      });
      if (!containUser) this.members = this.members.concat(user);
    },
    async createNewWarehouse() {
      try {
        if (!this.formCheck()) return;
        this.createStatus = "doing";
        let formData = this.formData();
        let url = URL.POST_CREATE_WAREHOUSE();
        const createRes = await this.$http.post(url, formData, {
          emulateJSON: true
        });
        console.log(createRes.data);
        this.add_warehouse(createRes.data.data);
        this.createStatus = "done";
        setTimeout(() => {
          $("#modal-create-warehouse").modal("hide");
        }, 1000);
      } catch (err) {
        this.createStatus = "todo";
      }
    },
    nameOnInput(e) {
      this.nameError = "";
    }
  }
};
</script>

<style lang="scss" scoped>
.select {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-start;
  .method {
    width: 30%;
    height: 50px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: column;
  }
  .source {
    width: 70%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: column;
  }
}
.source-display {
  margin-left: 10%;
  width: 90%;
  height: 150px;
  border: none;
}
.selected-display {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  margin-top: 10px;
}
.selected {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  margin-top: 10px;
  .selected-user {
    cursor: pointer;
    width: 20%;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    .selected-user-remove {
      position: absolute;
      top: 0px;
      right: 10px;
      width: 20px;
      height: 20px;
      font-weight: bold;
    }
  }
}

.custom-select {
  border-radius: 10px;
  height: 50px;
  padding: 5px;
}

.field {
  width: 80%;
  margin-left: 10%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  .field-row-top {
    width: 100%;
    height: 30px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    border-top: 1px gainsboro solid;
  }
  .field-row {
    width: 100%;
    height: 30px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    border-bottom: 1px gainsboro solid;
  }
  .field-col {
    flex: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
    span {
      max-width: 50%;
      height: 100%;
      text-overflow: ellipsis;
    }
    input {
      width: 50%;
      height: 90%;
      border: none;
    }
    input:focus {
      border: 1px dashed gainsboro;
      outline: none;
    }
  }
}

.field-item-option {
  position: absolute;
  left: 10%;
  height: 100%;
  width: 10%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
