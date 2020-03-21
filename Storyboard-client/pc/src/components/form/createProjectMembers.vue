<template>
  <div
    id="modal-create-project-member"
    class="modal fade"
    role="dialog"
    @click.stop="stopPropagation"
  >
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title display-only">
            {{ $t("PROJECT_MEMBERS") }}
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
              <div class="select">
                <select
                  class="custom-select"
                  style="width: 100%; height: 50px"
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
              <div class="source">
                <div v-if="!teams[teamSelectIndex]"></div>
                <vue-scroll
                  class="source-display"
                  v-else-if="teams[teamSelectIndex].members.length > 0"
                >
                  <div
                    style="width: 90%; height: 50px"
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
                <div v-else>
                  <span>{{ $t("NO_USER_FOUND") }}</span>
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
            @click.stop="createNewProject"
          >
            <span
              v-if="projectCreateStatus === 'doing'"
              class="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
            <span v-else-if="projectCreateStatus === 'todo'">{{
              $t("CONFIRM")
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
import avatar from "@/components/avatar";
import vueScroll from "vuescroll";
import { mapState, mapMutations } from "vuex";
import { parser } from "@/common/utils/array";
import { sliceFromLeft } from "@/common/utils/string";
import { stopPropagation } from "@/common/utils/mouse";
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
      projectMembers: [],
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
    $("#modal-create-project-member").on("hidden.bs.modal", () => {
      this.resetForm();
    });
  },
  computed: {
    ...mapState("team", ["teams"]),
    ...mapState("user", ["id", "token"]),
    ...mapState("project", ["projects", "activeIndex"]),
    computedSearchUrl() {
      return URL.POST_SEARCH_USER();
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
    computedTooltipTitle() {
      return function(item) {
        // max length 10
        return sliceFromLeft(item.username, 10);
      };
    },
    computedCreateBtnClass() {
      const { projectCreateStatus } = this;
      return `btn btn-sm btn-${
        projectCreateStatus === "done" ? "success" : "primary"
      } create-btn`;
    }
  },
  methods: {
    stopPropagation,
    ...mapMutations({
      add_projects: "project/add_projects"
    }),
    formCheck() {
      const {} = this;
      if (!this.projectName) {
        this.projectNameError = this.$t("REQUIRED_FIELD");
        return false;
      }
      return true;
    },
    formData() {
      const { projectMembers, id } = this;
      return {
        members: parser(projectMembers, "_id"),
        user: id
      };
    },
    resetForm() {
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
        console.log(createRes.data);
        this.add_projects(createRes.data.data);
        this.projectCreateStatus = "done";
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
.wrapper {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
}
.select {
  width: 100%;
  height: 50px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}
.source {
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: column;
  position: relative;
}
.source-display {
  margin-left: 10%;
  width: 90%;
  height: 150px;
  border: 1px lightgrey solid;
  border-top: none;
  border-radius: 5px;
}
</style>
