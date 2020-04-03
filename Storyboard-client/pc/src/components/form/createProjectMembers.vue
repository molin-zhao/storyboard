<template>
  <div
    id="modal-create-project-member"
    class="modal fade display-only"
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
            data-target="#modal-create-project-member"
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
                  <option v-else v-for="(item, index) in teams" :key="index">{{
                    item.name
                  }}</option>
                </select>
              </div>
              <div class="source">
                <div v-if="computedShowTeamMembers" class="source-display">
                  <vue-scroll>
                    <div
                      style="width: 100%; height: 50px"
                      v-for="(item, index) in teams[teamSelectIndex]['members']"
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
                </div>
                <div v-else>
                  <span>{{ $t("NO_USER_FOUND") }}</span>
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
                      style="width: 40px; height: 40px; border-radius: 20px"
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
          <a
            style="cursor: pointer"
            class="text-primary"
            @click="showCreateTeam"
            >{{ $t("CREATE_TEAM") }}</a
          >
          <button
            :disabled="computedBtnDisabled"
            type="submit"
            :class="computedCreateBtnClass"
            @click.stop="addProjectMember"
          >
            <span
              v-if="memberAddStatus === 'doing'"
              class="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
            <span v-else-if="memberAddStatus === 'todo'">{{
              $t("CONFIRM")
            }}</span>
            <span v-else>{{ $t("DONE") }}</span>
          </button>
          <button
            type="submit"
            class="btn btn-sm btn-danger create-btn"
            data-target="#modal-create-project-member"
            data-dismiss="modal"
          >
            <span>{{ $t("CANCEL") }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
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
    userAddDeleteCell,
    vueScroll,
    avatar
  },
  data() {
    return {
      members: [],
      memberAddStatus: "todo",
      teamSelectIndex: 0,
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
    computedShowTeamMembers() {
      const { teams, teamSelectIndex } = this;
      return (
        teams[teamSelectIndex] && teams[teamSelectIndex]["members"].length > 0
      );
    },
    computedBtnDisabled() {
      const { memberAddStatus, members } = this;
      if (memberAddStatus === "todo" && members.length > 0) return false;
      return true;
    },
    computedShowTeamResult() {
      const { teamSelectIndex, teams } = this;
      return teams.length > 0 && teams[teamSelectIndex]["members"].length > 0;
    },
    computedShowTeamResultEmpty() {
      const { teamSelectIndex, teams } = this;
      return teams.length > 0 && teams[teamSelectIndex]["members"].length === 0;
    },
    computedTooltipTitle() {
      return function(item) {
        // max length 10
        return sliceFromLeft(item.username, 10);
      };
    },
    computedCreateBtnClass() {
      const { memberAddStatus } = this;
      return `btn btn-sm btn-${
        memberAddStatus === "done" ? "success" : "primary"
      } create-btn`;
    },
    computedMembers() {
      const { members } = this;
      return parser(members, "_id");
    }
  },
  methods: {
    stopPropagation,
    ...mapMutations({
      add_project_members: "project/add_project_members"
    }),
    formData() {
      const { members, id, projects, activeIndex } = this;
      return {
        members: parser(members, "_id"),
        user: id,
        projectId: projects[activeIndex]["_id"]
      };
    },
    resetForm() {
      this.members = [];
      this.teamSelectIndex = 0;
      this.memberAddStatus = "todo";
    },
    formCheck() {
      const { members } = this;
      return members.length > 0 ? true : false;
    },
    teamSelect(e) {
      this.teamSelectIndex = e.target.selectedIndex;
    },
    onSearchError(err) {
      console.log(err);
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
    async addProjectMember() {
      try {
        if (!this.formCheck()) return;
        this.memberAddStatus = "doing";
        let formData = this.formData();
        let url = URL.POST_ADD_PROJECT_MEMBER();
        const res = await this.$http.post(url, formData, {
          emulateJSON: true
        });
        this.add_project_members(res.data.data);
        this.memberAddStatus = "done";
        setTimeout(() => {
          $("#modal-create-project-member").modal("hide");
        }, 1000);
      } catch (err) {
        this.memberAddStatus = "todo";
      }
    },
    showCreateTeam() {
      $("#modal-create-project-member").modal("hide");
      setTimeout(() => {
        $("#modal-create-team").modal("show");
      }, 350);
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
  border: 1px lightgrey solid;
  border-top: none;
  border-radius: 5px;
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
