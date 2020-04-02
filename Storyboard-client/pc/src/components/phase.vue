<template>
  <div class="phase-wrapper">
    <div class="phase-nav">
      <phase-nav-link
        v-for="(item, index) in projects[activeIndex]['phases']"
        :key="index"
        :index="index"
        :phase="item"
        :phase-active-index="selectedPhaseIndex"
        @on-select="selectPhase"
      />
      <div class="phase-nav-item">
        <div
          class="nav-link"
          style="padding: 0; background-color: whitesmoke"
          data-toggle="modal"
          data-target="#modal-create-phase"
        >
          <icon name="add" style="width: 25px; height: 25px; color: gray" />
        </div>
      </div>
    </div>
    <div class="phase-body">
      <vue-scroll :ops="ops">
        <task-group
          v-for="(item, index) in computedSelectedGroup"
          :key="index"
          :phase-index="selectedPhaseIndex"
          :group-id="item._id"
          :item="item"
          :group-index="index"
        />
      </vue-scroll>
    </div>

    <!-- create phase modal -->
    <create-phase-form />
  </div>
</template>

<script>
import waveBtn from "@/components/waveBtn";
import taskGroup from "@/components/taskGroup";
import createPhaseForm from "@/components/form/createPhase";
import phaseNavLink from "@/components/phaseNavLink";
import editableText from "@/components/editableText";
import vueScroll from "vuescroll";
import { mouseclick, stopPropagation } from "@/common/utils/mouse";
import { mapState, mapActions, mapMutations } from "vuex";
import * as URL from "@/common/utils/url";
export default {
  components: {
    waveBtn,
    taskGroup,
    createPhaseForm,
    editableText,
    phaseNavLink,
    vueScroll
  },
  data() {
    return {
      selectedPhaseIndex: 0,
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
  computed: {
    ...mapState("project", ["projects", "activeIndex", "logs"]),
    navActiveStyle() {
      return function(index) {
        return index === this.selectedPhaseIndex
          ? "background-color: gray"
          : "background-color: white";
      };
    },
    computedSelectedGroup() {
      const { projects, activeIndex, selectedPhaseIndex } = this;
      // return projects[activeIndex]["phases"][selectedPhaseIndex]["groups"];
      const phaseLength = projects[activeIndex]["phases"].length;
      if (phaseLength === 0) return [];
      if (selectedPhaseIndex < phaseLength) {
        return projects[activeIndex]["phases"][selectedPhaseIndex]["groups"];
      }
      return projects[activeIndex]["phases"][phaseLength - 1]["groups"];
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
    }
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
    align-items: flex-end;
    flex-wrap: nowrap;
    width: 100%;
    height: 50px;
    border-bottom: lightgrey 1px solid;
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
