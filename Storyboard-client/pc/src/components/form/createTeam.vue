<template>
  <div id="modal-create-team" class="modal fade" role="dialog">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title display-only">
            {{ $t("CREATE_TEAM") }}
          </h5>
          <a
            style="font-size: 20px; cursor: pointer"
            class="display-only"
            aria-hidden="true"
            aria-label="Close"
            data-target="#modal-create-team"
            data-dismiss="modal"
            >&times;</a
          >
        </div>
        <div class="modal-body">
          <form style="wrapper">
            <div class="form-group form-left-centered">
              <label
                >{{ $t("TEAM_NAME")
                }}<span style="font-size: 12px;color: var(--main-color-danger)"
                  >*</span
                ></label
              >
              <div class="form-row" style="width: 100%; margin: 0; padding: 0">
                <input
                  :class="`form-control ${nameError ? 'is-invalid' : null}`"
                  style="width: 100%"
                  v-model="teamName"
                  :placeholder="$t('REQUIRED')"
                  @input="nameOnInput($event)"
                />
              </div>
              <span class="form-text text-danger error-text">{{
                nameError
              }}</span>
            </div>
            <div class="form-group form-left-centered">
              <label
                >{{ $t("ADD_TEAM_MEMBER")
                }}<span style="font-size: 12px;color: var(--main-color-danger)"
                  >*</span
                ></label
              >
              <div style="width: 100%; height: 50px">
                <search-input
                  style="height: 100%; width: 100%; border-radius: 10px"
                  :url="computedSearchUrl"
                  :data-source="searchResult"
                  :limit="5"
                  @on-error="onSearchError"
                  @on-result="onSearchResult"
                  @input-change="searchInputChange"
                />
              </div>
              <div style="width: 100%">
                <div class="source-display">
                  <vue-scroll v-if="computedShowSearchResult" :ops="ops">
                    <div
                      class="user-cell-wrapper"
                      v-for="(item, index) in searchResult[searchValue]['data']"
                      :key="index"
                    >
                      <user-add-delete-cell
                        :item="item"
                        :exclude-list="computedMembers"
                        @remove-user="removeUser"
                        @add-user="addUser"
                      />
                    </div>
                  </vue-scroll>
                  <span v-else style="margin-top: 10px">{{
                    $t("NO_USER_FOUND")
                  }}</span>
                </div>
              </div>
              <div class="selected-display" v-show="members.length > 0">
                <label>{{ $t("ADDED_MEMBER") }}</label>
                <div class="selected">
                  <user-avatar-cell
                    v-for="item in members"
                    :key="item._id"
                    :item="item"
                    @click.native.stop="removeUser(item)"
                  />
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
            @click.stop="createNewTeam"
          >
            <span
              v-if="teamCreateStatus === 'doing'"
              class="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
            <span v-else-if="teamCreateStatus === 'todo'">{{
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
import { stopPropagation } from "@/common/utils/mouse";
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
      teamName: "",
      members: [],
      teamCreateStatus: "todo",
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
      },
      nameError: ""
    };
  },
  mounted() {
    $("#modal-create-team").on("hidden.bs.modal", () => {
      this.resetForm();
    });
  },
  computed: {
    ...mapState("team", ["teams"]),
    ...mapState("user", ["id", "token"]),
    computedSearchUrl() {
      return URL.POST_SEARCH_USER();
    },
    computedCreateBtnDisabled() {
      const { teamCreateStatus, teamName, nameError } = this;
      if (teamCreateStatus === "todo" && teamName && !nameError) return false;
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
    computedMembers() {
      const { members } = this;
      return parser(members, "_id");
    },
    computedCreateBtnClass() {
      const { teamCreateStatus } = this;
      return `btn btn-sm btn-${
        teamCreateStatus === "done" ? "success" : "primary"
      } create-btn`;
    }
  },
  methods: {
    stopPropagation,
    ...mapMutations({
      add_teams: "team/add_teams"
    }),
    formCheck() {
      const { teamName } = this;
      if (!teamName) {
        this.nameError = this.$t("REQUIRED_FIELD");
        return false;
      }
      return true;
    },
    formData() {
      const { members, id, teamName } = this;
      let memberIds = parser(members, "_id");
      let combinedMemberIds = memberIds.concat(id);
      return {
        members: combinedMemberIds,
        user: id,
        name: teamName.trim()
      };
    },
    resetForm() {
      this.teamName = "";
      this.members = [];
      this.teamCreateStatus = "todo";
      this.searchResult = {};
      this.searchValue = "";
    },
    onSearchError(err) {
      console.log(err);
    },
    onSearchResult(res) {
      const { searchLimit, searchResult } = this;
      const { data, value } = res;
      let hasMore = data.length < searchLimit ? false : true;
      let newData = searchResult[value]
        ? searchResult[value].data.concat(data)
        : data;
      let newProperty = { data: newData, hasMore };
      this.$set(this.searchResult, value, newProperty);
    },
    searchInputChange(val) {
      this.searchValue = val.trim();
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
    async createNewTeam() {
      try {
        if (!this.formCheck()) return;
        this.teamCreateStatus = "doing";
        let formData = this.formData();
        let url = URL.POST_CREATE_TEAM();
        const createRes = await this.$http.post(url, formData, {
          emulateJSON: true
        });
        this.add_teams(createRes.data.data);
        this.teamCreateStatus = "done";
        setTimeout(() => {
          $("#modal-create-team").modal("hide");
        }, 1000);
      } catch (err) {
        this.teamCreateStatus = "todo";
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
  width: 100%;
  height: 150px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  .user-cell-wrapper {
    width: 100%;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
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
</style>
