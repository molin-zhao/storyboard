<template>
  <div class="phase-wrapper">
    <div class="phase-nav">
      <div
        class="nav-link display-only"
        v-for="(item, index) in projects[activeIndex]['phases']"
        :key="item._id"
        :style="navActiveStyle(index)"
        @click="selectPhase(index, $event)"
      >
        <icon
          v-show="selectedPhaseIndex === index"
          class="attention"
          :name="`${showPhase ? 'attentionfill' : 'attention'}`"
          :style="`color: ${showPhase ? 'black' : 'white'}`"
          @click.native.stop="showPhaseDetail($event)"
        />
        <span>{{ computedPhaseName(item._id, item.name) }}</span>
      </div>
      <div
        class="nav-link"
        style="padding: 0"
        data-toggle="modal"
        data-target="#modal-create-phase"
      >
        <icon name="add" style="width: 25px; height: 25px; color: grey" />
      </div>
    </div>
    <div class="phase-body">
      <task-group
        v-for="item in computedSelectedGroup"
        :key="item._id"
        :phase-index="selectedPhaseIndex"
        :group-id="item._id"
        :item="item"
      ></task-group>
    </div>

    <!-- create phase modal -->
    <create-phase-form />

    <!-- sidebar -->
    <sidebar
      ref="sidebar"
      class="shadow"
      @sidebar-show="sidebarShow"
      @sidebar-hide="sidebarHide"
    >
      <div style="width: 100%; height: 100%;">
        <div class="phase-name">
          <editable-text
            :row="1"
            :value="computedSelectedPhaseName"
            :default-value="$t('ADD_PHASE_NAME')"
            @input-change="nameChange"
            input-style="font-size: 20px"
            style="width: 100%; height: 100%; padding: 1px"
          />
        </div>
        <div class="phase-description">
          <editable-text
            style="width: 100%; height: 100%; padding: 1px"
            :default-value="$t('ADD_PHASE_DESCRIPTION')"
            :value="computedSelectedPhaseDescription"
            input-style="font-size: 20px;"
            :row="5"
            @input-change="descriptionChange"
          />
        </div>
      </div>
    </sidebar>
  </div>
</template>

<script>
import waveBtn from "@/components/waveBtn";
import taskGroup from "@/components/taskGroup";
import createPhaseForm from "@/components/form/createPhase";
import sidebar from "@/components/sidebar";
import editableText from "@/components/editableText";
import { mouseclick, stopPropagation } from "@/common/utils/mouse";
import { mapState, mapActions, mapMutations } from "vuex";
export default {
  components: {
    waveBtn,
    taskGroup,
    createPhaseForm,
    sidebar,
    editableText
  },
  data() {
    return {
      selectedPhaseIndex: 0,
      showPhase: false
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
    computedPhaseName() {
      return function(phaseId, phaseName) {
        const { logs, projects, activeIndex, selectedPhaseIndex } = this;
        let logProject = logs[projects[activeIndex]._id];
        if (
          logProject &&
          logProject["phases"] &&
          logProject["phases"][phaseId] &&
          logProject["phases"][phaseId]["name"]
        )
          return logProject["phases"][phaseId]["name"];
        else if (phaseName) return phaseName;
        else return `${this.$t("UNTITLE_PHASE")}-${selectedPhaseIndex + 1}`;
      };
    },
    computedSelectedPhaseName() {
      const { logs, selectedPhaseIndex, projects, activeIndex } = this;
      let selectedPhase = projects[activeIndex]["phases"][selectedPhaseIndex];
      let logProject = logs[projects[activeIndex]._id];
      if (
        logProject &&
        logProject["phases"] &&
        logProject["phases"][selectedPhase._id] &&
        logProject["phases"][selectedPhase._id]["name"]
      )
        return logProject["phases"][selectedPhase._id]["name"];
      return selectedPhase.description;
    },
    computedSelectedPhaseDescription() {
      const { logs, selectedPhaseIndex, projects, activeIndex } = this;
      let selectedPhase = projects[activeIndex]["phases"][selectedPhaseIndex];
      let logProject = logs[projects[activeIndex]._id];
      if (
        logProject &&
        logProject["phases"] &&
        logProject["phases"][selectedPhase._id] &&
        logProject["phases"][selectedPhase._id]["description"]
      )
        return logProject["phases"][selectedPhase._id]["description"];
      return selectedPhase.description;
    },
    computedSelectedGroup() {
      const { projects, activeIndex, selectedPhaseIndex } = this;
      return projects[activeIndex]["phases"][selectedPhaseIndex]["groups"];
    }
  },
  methods: {
    mouseclick,
    stopPropagation,
    ...mapMutations({
      add_log: "project/add_log",
      remove_log: "project/remove_log"
    }),
    selectPhase(i, e) {
      this.selectedPhaseIndex = i;
    },
    showPhaseDetail(e) {
      this.mouseclick("sidebar", e);
    },
    nameChange(val) {
      const { projects, activeIndex, selectedPhaseIndex } = this;
      let oPhase = projects[activeIndex]["phases"][selectedPhaseIndex];
      let oName = oPhase["name"];
      if (oName !== val)
        return this.add_log({
          projectId: projects[activeIndex]._id,
          phaseId: oPhase._id,
          field: "name",
          value: val
        });
      return this.remove_log({
        projectId: projects[activeIndex]._id,
        phaseId: oPhase._id,
        field: "name"
      });
    },
    descriptionChange(val) {
      const { projects, activeIndex, selectedPhaseIndex } = this;
      let oPhase = projects[activeIndex]["phases"][selectedPhaseIndex];
      let oName = oPhase["description"];
      if (oName !== val)
        return this.add_log({
          projectId: projects[activeIndex]._id,
          phaseId: oPhase._id,
          field: "description",
          value: val
        });
      return this.remove_log({
        projectId: projects[activeIndex]._id,
        phaseId: oPhase._id,
        field: "description"
      });
    },
    sidebarShow() {
      this.showPhase = true;
    },
    sidebarHide() {
      this.showPhase = false;
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
    .nav-link {
      width: 15%;
      min-width: 150px;
      max-width: 200px;
      height: 95%;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      border-top-left-radius: 5px;
      border-top-right-radius: 5px;
      border: lightgrey 1px solid;
      border-bottom: none;
      margin-right: -1px;
      padding-top: 10px;
      padding-left: 0;
      padding-right: 0;
      position: relative;
      span {
        display: inline-block;
        vertical-align: middle;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: white;
        font-size: 16px;
      }
    }
    .nav-link:active {
      -webkit-box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
      box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
    }
  }
  .phase-body {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
  }
}
.attention {
  cursor: pointer;
  position: absolute;
  left: 10px;
}
.phase-name {
  width: 100%;
  height: 60px;
  margin-top: 10px;
}
.phase-description {
  width: 100%;
  height: 300px;
  margin-top: 10px;
}
</style>
