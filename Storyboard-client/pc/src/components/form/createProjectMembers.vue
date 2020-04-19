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
            style="font-size: 20px; cursor: pointer;"
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
                  style="width: 100%; height: 50px;"
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
                      style="width: 100%; height: 50px;"
                      v-for="(item, index) in teams[teamSelectIndex]['members']"
                      :key="index"
                    >
                      <user-add-delete-cell
                        :item="item"
                        :creator="computedProjectCreator"
                        :exclude-list="computedMemberIds"
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
                  <user-avatar-cell
                    v-for="item in members"
                    :key="item._id"
                    :item="item"
                    @click.native.stop="removeUser(item)"
                    :can-remove="computedCanRemoveMember(item)"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <a
            style="cursor: pointer;"
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
import userAvatarCell from "@/components/userAvatarCell";
import avatar from "@/components/avatar";
import vueScroll from "vuescroll";
import { mapState, mapMutations } from "vuex";
import { parser, arrayEqual } from "@/common/utils/array";
import { stopPropagation } from "@/common/utils/mouse";
import * as URL from "@/common/utils/url";
export default {
  components: {
    userAddDeleteCell,
    userAvatarCell,
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
    $("#modal-create-project-member").on("show.bs.modal", () => {
      this.combineMembers();
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
    computedProjectCreator() {
      const { projects, activeIndex } = this;
      const project = projects[activeIndex];
      if (project) return project["creator"];
      return {};
    },
    computedBtnDisabled() {
      const {
        memberAddStatus,
        computedMemberIds,
        projects,
        activeIndex
      } = this;
      let project = projects[activeIndex];
      if (!project) {
        let disabled =
          memberAddStatus !== "todo" || arrayEqual([], computedMemberIds);
        return disabled;
      }
      let projectMemberIds = project["members"].map(val => val["_id"]);
      let disabled =
        memberAddStatus !== "todo" ||
        arrayEqual(projectMemberIds, computedMemberIds);
      return disabled;
    },
    computedShowTeamResult() {
      const { teamSelectIndex, teams } = this;
      return teams.length > 0 && teams[teamSelectIndex]["members"].length > 0;
    },
    computedShowTeamResultEmpty() {
      const { teamSelectIndex, teams } = this;
      return teams.length > 0 && teams[teamSelectIndex]["members"].length === 0;
    },
    computedCreateBtnClass() {
      const { memberAddStatus } = this;
      return `btn btn-sm btn-${
        memberAddStatus === "done" ? "success" : "primary"
      } create-btn`;
    },
    computedMemberIds() {
      const { members } = this;
      return parser(members, "_id");
    },
    computedCanRemoveMember() {
      return function(item) {
        const { computedProjectCreator } = this;
        return item._id !== computedProjectCreator._id;
      };
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
    combineMembers() {
      const { projects, activeIndex, members } = this;
      let project = projects[activeIndex];
      if (!project) return;
      this.members = project["members"];
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
      const { members, computedProjectCreator } = this;
      if (user._id === computedProjectCreator._id) return;
      this.members = members.filter(u => u._id !== user._id);
    },
    addUser(user) {
      const { members } = this;
      let containUser = members.some(u => {
        if (u._id === user._id) return true;
      });
      if (!containUser) this.members = members.concat(user);
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
