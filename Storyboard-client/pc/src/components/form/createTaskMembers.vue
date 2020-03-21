<template>
  <div id="modal-create-task-member" class="modal fade" role="dialog">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title display-only">
            {{ $t("ASSIGN_TASK") }}
          </h5>
          <a
            style="font-size: 20px; cursor: pointer"
            class="display-only"
            aria-hidden="true"
            aria-label="Close"
            data-target="#modal-create-task-member"
            data-dismiss="modal"
            >&times;</a
          >
        </div>
        <div class="modal-body">
          <form style="wrapper">
            <div class="form-group form-left-centered">
              <label>{{ $t("TASK_MEMBERS") }}</label>
              <div
                v-if="projects[activeIndex].members.length > 0"
                class="member-source"
              >
                <search-input
                  style="height: 30px; width: 90%; border-radius: 10px"
                  :search-strategy="searchMember"
                  @input-change="searchInputChange"
                />
                <vue-scroll :ops="ops">
                  <div
                    style="width: 90%; height: 50px"
                    v-for="item in computedMemberResult"
                    :key="item._id"
                  >
                    <user-add-delete-cell
                      :item="item"
                      :exclude-list="computedTaskMembers"
                      @remove-user="removeUser"
                      @add-user="addUser"
                    />
                  </div>
                </vue-scroll>
              </div>
              <div v-else class="member-source">
                <span style="font-size: 20px">{{
                  $t("NO_PROJECT_MEMBER")
                }}</span>
                <a
                  class="text-primary"
                  style="
                  display: flex; 
                  flex-direction: row; 
                  justifycontent: center; 
                  align-items: center"
                  @click="createProjectMember"
                  ><icon name="add" />{{ $t("ADD_PROJECT_MEMBER") }}</a
                >
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button
            :disabled="computedProcessBtnDisabled"
            type="submit"
            :class="computedProcessBtnClass"
            @click.stop="confirmAddMember"
          >
            <span
              v-if="processStatus === 'doing'"
              class="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
            <span v-else-if="processStatus === 'todo'">{{
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
export default {
  components: {
    searchInput,
    userAddDeleteCell,
    vueScroll,
    avatar
  },
  props: {
    taskMembers: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      selectedTaskMembers: [],
      processStatus: "todo",
      searchResult: {},
      searchValue: "",
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
    $("#modal-create-task-member").on("hidden.bs.modal", () => {
      this.resetForm();
    });
  },
  computed: {
    ...mapState("team", ["teams"]),
    ...mapState("user", ["id", "token"]),
    ...mapState("project", ["projects", "activeIndex"]),
    computedProcessBtnDisabled() {
      const { selectedTaskMembers } = this;
      if (selectedTaskMembers.length === 0) return true;
      return false;
    },
    computedProcessBtnClass() {
      const { processStatus } = this;
      return `btn btn-sm btn-${
        processStatus === "done" ? "success" : "primary"
      } create-btn`;
    },
    computedTaskMembers() {},
    computedMemberResult() {}
  },
  methods: {
    ...mapMutations({
      add_projects: "project/add_projects"
    }),
    resetForm() {
      this.selectedTaskMembers = [];
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
    onSearchResult(data) {},
    confirmAddMember() {},
    searchInputChange(val) {
      this.searchValue = val.trim(" ");
    },
    searchMember(val) {
      console.log(val);
    },
    createProjectMember() {
      $("#modal-create-task-member").modal("hide");
      setTimeout(() => {
        $("#modal-create-project-member").modal("show");
      }, 1000);
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
.member-source {
  width: 100%;
  height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
