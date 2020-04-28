<template>
  <div class="phase-wrapper">
    <div class="phase-nav">
      <div class="phase-nav-items">
        <phase-nav-link
          v-for="(item, index) in projects[activeIndex]['phases']"
          :key="index"
          :index="index"
          :phase="item"
          :phase-active-index="computedSelectedPhaseIndex"
          @on-select="selectPhase"
        />
        <div class="nav-item">
          <div
            v-show="computedShowCreateNewPhase"
            class="nav-link"
            style="padding: 0; background-color: whitesmoke"
            @click="createNewPhase"
          >
            <icon name="add" style="width: 25px; height: 25px; color: gray" />
          </div>
        </div>
      </div>
      <div class="phase-nav-options">
        <select
          v-model="showStrategy"
          class="custom-select"
          style="height: 30px; width: 49%;border-radius: 10px; font-size: 12px"
        >
          <option
            :value="index"
            v-for="(showStrategyOption, index) in showStrategyList"
            :key="index"
            >{{ showStrategyOption }}</option
          >
        </select>
        <search-input
          :search-strategy="searchTask"
          style="height: 30px; width: 49%; border-radius: 10px"
        />
      </div>
    </div>
    <div v-show="showStrategy === 0" class="phase-body">
      <vue-scroll :ops="ops">
        <task-group
          v-for="(item, index) in computedSelectedGroup"
          :key="index"
          :phase-index="computedSelectedPhaseIndex"
          :group-id="item._id"
          :item="item"
          :group-index="index"
        />
      </vue-scroll>
    </div>
    <div v-show="showStrategy === 1" class="phase-body">
      <h5 style="margin-top: -25%" v-if="computedMyGroup.length === 0">
        {{ $t("NO_TASK_OF_MINE") }}
      </h5>
      <vue-scroll v-else :ops="ops">
        <task-group
          v-for="(item, index) in computedMyGroup"
          :key="index"
          :phase-index="computedSelectedPhaseIndex"
          :group-id="item._id"
          :item="item"
          :group-index="index"
        />
      </vue-scroll>
    </div>
  </div>
</template>

<script>
import waveBtn from "@/components/waveBtn";
import taskGroup from "@/components/taskGroup";
import phaseNavLink from "@/components/phaseNavLink";
import editableText from "@/components/editableText";
import vueScroll from "vuescroll";
import { ops } from "@/common/theme/style";
import searchInput from "@/components/searchInput";
import { mouseclick, stopPropagation } from "@/common/utils/mouse";
import { mapState, mapActions, mapMutations } from "vuex";
import { parser } from "@/common/utils/array";
import * as URL from "@/common/utils/url";
export default {
  components: {
    waveBtn,
    taskGroup,
    editableText,
    phaseNavLink,
    vueScroll,
    searchInput
  },
  data() {
    return {
      selectedPhaseIndex: 0,
      showStrategy: 0,
      showStrategyList: [this.$t("SHOW_ALL_TASK"), this.$t("SHOW_MY_TASK")],
      ops
    };
  },
  computed: {
    ...mapState("project", ["projects", "activeIndex", "logs"]),
    ...mapState("user", ["id"]),
    navActiveStyle() {
      return function(index) {
        return index === this.selectedPhaseIndex
          ? "background-color: gray"
          : "background-color: white";
      };
    },
    computedSelectedGroup() {
      const { projects, activeIndex, selectedPhaseIndex } = this;
      const phaseLength = projects[activeIndex]["phases"].length;
      if (phaseLength === 0) return [];
      if (selectedPhaseIndex < phaseLength) {
        return projects[activeIndex]["phases"][selectedPhaseIndex]["groups"];
      }
      this.selectedPhaseIndex = phaseLength - 1;
      return projects[activeIndex]["phases"][this.selectedPhaseIndex]["groups"];
    },
    computedSelectedPhaseIndex() {
      const { selectedPhaseIndex, projects, activeIndex } = this;
      let phaseLen = projects[activeIndex]["phases"].length;
      if (selectedPhaseIndex < phaseLen) return selectedPhaseIndex;
      this.selectedPhaseIndex = phaseLen - 1;
      return this.selectedPhaseIndex;
    },
    computedShowCreateNewPhase() {
      const { projects, activeIndex } = this;
      let phases = projects[activeIndex]["phases"];
      let phaseLen = phases.length;
      return phaseLen < 5;
    },
    computedMyGroup() {
      const { projects, activeIndex, selectedPhaseIndex, id } = this;
      const groups =
        projects[activeIndex]["phases"][selectedPhaseIndex]["groups"];
      let myGroups = [];
      for (let group of groups) {
        let tasks = group["tasks"];
        let myTasks = [];
        for (let task of tasks) {
          let members = task["members"];
          let memberIds = parser(members, "_id");
          if (memberIds.includes(id)) myTasks.push(task);
        }
        if (myTasks.length > 0) myGroups.push({ ...group, tasks: myTasks });
      }
      return myGroups;
    }
  },
  created() {
    try {
      const { projects, activeIndex, id } = this;
      let creator = projects[activeIndex]["creator"];
      if (creator["_id"] === id) {
        this.showStrategy = 0;
      } else {
        this.showStrategy = 1;
      }
    } catch (err) {
      this.showStrategy = 1;
    }
  },
  methods: {
    mouseclick,
    stopPropagation,
    ...mapMutations({
      add_log: "project/add_log",
      remove_log: "project/remove_log"
    }),
    selectPhase(val) {
      this.selectedPhaseIndex = val;
    },
    createNewPhase() {
      $("#modal-create-phase").modal("show");
    },
    searchTask(taskName) {}
  },
  watch: {
    projects: {
      deep: true,
      handler: function(newValue, oldValue) {
        // phase removed
        const { activeIndex, selectedPhaseIndex } = this;
        const phaseLength = newValue[activeIndex]["phases"].length;
        if (selectedPhaseIndex >= phaseLength) {
          this.selectedPhaseIndex = phaseLength - 1;
        }
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.phase-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  .phase-nav {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: nowrap;
    width: 100%;
    height: 50px;
    border-bottom: lightgrey 1px solid;
    position: relative;
    .phase-nav-items {
      width: 70%;
      height: 100%;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: flex-end;
    }
    .phase-nav-options {
      max-width: 30%;
      min-width: 260px;
      height: 100%;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      position: absolute;
      right: 0;
    }
  }
  .phase-body {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
  }
}
</style>
