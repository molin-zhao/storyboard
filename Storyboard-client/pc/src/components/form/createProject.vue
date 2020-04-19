<template>
  <div id="modal-create-project" class="modal fade" role="dialog">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title display-only">
            {{ $t("CREATE_PROJECT") }}
          </h5>
          <a
            style="font-size: 20px; cursor: pointer"
            class="display-only"
            aria-hidden="true"
            aria-label="Close"
            data-target="#modal-create-project"
            data-dismiss="modal"
            >&times;</a
          >
        </div>
        <div class="modal-body">
          <form style="wrapper">
            <div class="form-group form-left-centered">
              <label
                >{{ $t("PROJECT_NAME")
                }}<span style="font-size: 12px;color: red">*</span></label
              >
              <div class="form-row" style="width: 100%; margin: 0; padding: 0">
                <input
                  :class="
                    `form-control ${projectNameError ? 'is-invalid' : null}`
                  "
                  :style="computedProjectNameStyle(projectNameError)"
                  v-model="projectName"
                  :placeholder="$t('REQUIRED')"
                  @input="nameOnInput($event)"
                />
              </div>
              <span class="form-text text-danger error-text">{{
                projectNameError
              }}</span>
            </div>
            <div class="form-group form-left-centered">
              <label>{{ $t("PROJECT_DESCRIPTION") }}</label>
              <textarea
                class="form-control"
                rows="3"
                :placeholder="$t('OPTIONAL')"
                v-model="projectDescription"
              ></textarea>
            </div>
            <div class="form-group form-left-centered">
              <label
                >{{ $t("PROJECT_MEMBERS")
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
                      style="margin-left: 10%; height: 90%; width: 90%; border-radius: 10px"
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
                      @change.stop="teamSelect($event)"
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
                            :exclude-list="computedProjectMembers"
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
                      <vue-scroll>
                        <div
                          style="width: 100%; height: 50px"
                          v-for="item in teams[teamSelectIndex].members"
                          :key="item._id"
                        >
                          <user-add-delete-cell
                            :item="item"
                            :exclude-list="projectMembers"
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
              <div class="selected" v-if="projectMembers.length > 0">
                <user-avatar-cell
                  v-for="item in projectMembers"
                  :key="item._id"
                  :item="item"
                  @click.native.stop="removeUser(item)"
                />
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button
            :disabled="computedCreateBtnDisabled"
            type="submit"
            :class="computedCreateBtnClass"
            @click.stop="createNewProject"
          >
            <span
              v-if="projectCreateStatus === 'doing'"
              class="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
            <span v-else-if="projectCreateStatus === 'todo'">{{
              $t("CREATE")
            }}</span>
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
import userAvatarCell from "@/components/userAvatarCell";
import avatar from "@/components/avatar";
import vueScroll from "vuescroll";
import { mapState, mapMutations } from "vuex";
import { parser } from "@/common/utils/array";
import * as URL from "@/common/utils/url";
export default {
  components: {
    searchInput,
    userAddDeleteCell,
    userAvatarCell,
    vueScroll,
    avatar
  },
  data() {
    return {
      projectName: "",
      projectNameError: "",
      projectDescription: "",
      projectMembers: [],
      projectPublic: true,
      projectCreateStatus: "todo",
      addMemberMethod: 0,
      teamSelectIndex: 0,
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
    $("#modal-create-project").on("hidden.bs.modal", () => {
      this.resetForm();
    });
  },
  computed: {
    ...mapState("team", ["teams"]),
    ...mapState("user", ["id", "token"]),
    computedSearchUrl() {
      return URL.POST_SEARCH_USER();
    },
    computedProjectNameStyle() {
      return function(error) {
        return `width: 100%; ${error ? "border-color: lightcoral" : null}`;
      };
    },
    computedCreateBtnDisabled() {
      const { projectCreateStatus } = this;
      if (projectCreateStatus === "todo") return false;
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
      const { teamSelectIndex, teams } = this;
      return teams.length > 0 && teams[teamSelectIndex].members.length > 0;
    },
    computedShowTeamResultEmpty() {
      const { teamSelectIndex, teams } = this;
      return teams.length > 0 && teams[teamSelectIndex].members.length === 0;
    },
    computedProjectMembers() {
      const { projectMembers } = this;
      return parser(projectMembers, "_id");
    },
    computedCreateBtnClass() {
      const { projectCreateStatus } = this;
      return `btn btn-sm btn-${
        projectCreateStatus === "done" ? "success" : "primary"
      } create-btn`;
    }
  },
  methods: {
    ...mapMutations({
      add_project: "project/add_project"
    }),
    formCheck() {
      if (!this.projectName) {
        this.projectNameError = this.$t("REQUIRED_FIELD");
        return false;
      }
      return true;
    },
    formData() {
      const { projectName, projectDescription, projectMembers, id } = this;
      return {
        name: projectName.trim(),
        description: projectDescription.trim(),
        members: parser(projectMembers, "_id"),
        user: id
      };
    },
    resetForm() {
      this.projectName = "";
      this.projectDescription = "";
      this.projectNameError = "";
      this.projectMembers = [];
      this.projectCreateStatus = "todo";
    },
    addMemberMethodSelect(e) {
      this.addMemberMethod = e.target.selectedIndex;
    },
    teamSelect(e) {},
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
      this.projectMembers = this.projectMembers.filter(u => u._id !== user._id);
    },
    addUser(user) {
      let containUser = this.projectMembers.some(u => {
        if (u._id === user._id) return true;
      });
      if (!containUser) this.projectMembers = this.projectMembers.concat(user);
    },
    async createNewProject() {
      try {
        if (!this.formCheck()) return;
        this.projectCreateStatus = "doing";
        let formData = this.formData();
        let url = URL.POST_CREATE_PROJECT();
        const createRes = await this.$http.post(url, formData, {
          emulateJSON: true
        });
        this.add_project(createRes.data.data);
        this.projectCreateStatus = "done";
        setTimeout(() => {
          $("#modal-create-project").modal("hide");
        }, 1000);
      } catch (err) {
        this.projectCreateStatus = "todo";
      }
    },
    nameOnInput(e) {
      this.projectNameError = "";
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
  border: 1px lightgrey solid;
  border-top: none;
  border-radius: 5px;
}
.selected {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  margin-top: 20px;
}
</style>
