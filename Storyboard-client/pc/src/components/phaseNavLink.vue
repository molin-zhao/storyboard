<template>
  <div class="phase-nav-item">
    <div class="nav-link display-only" :style="navActiveStyle">
      <div class="nav-link-content" @click.stop="selectPhase($event)">
        <icon
          class="attention"
          v-show="phaseActiveIndex === index"
          :name="`${showDetail ? 'attentionfill' : 'attention'}`"
          :style="`color: ${showDetail ? 'black' : 'gray'}`"
        />
        <span>{{ computedPhaseName }} </span>
      </div>
    </div>
    <!-- sidebar -->
    <sidebar
      ref="sidebar"
      class="shadow"
      @sidebar-show="sidebarShow"
      @sidebar-hide="sidebarHide"
    >
      <div style="width: 100%; height: 100%">
        <div class="phase-name">
          <editable-text
            :row="1"
            :value="computedPhaseName"
            :default-value="$t('ADD_PHASE_NAME')"
            @input-change="nameChange"
            input-style="font-size: 18px"
            style="width: 100%; height: 100%; padding: 1px"
          />
        </div>
        <div class="phase-description">
          <editable-text
            style="width: 100%; height: 100%; padding: 1px"
            :default-value="$t('ADD_PHASE_DESCRIPTION')"
            :value="computedPhaseDescription"
            input-style="font-size: 18px;"
            :row="5"
            @input-change="descriptionChange"
          />
        </div>
        <div class="delete-phase-btn">
          <a @click="deletePhase" class="btn btn-danger display-only">
            <span
              v-if="phaseDeleting"
              class="spinner-border spinner-border-sm text-light"
              role="status"
              aria-hidden="true"
            ></span
            ><span v-else>{{ $t("DELETE_PHASE_TITLE") }}</span>
          </a>
        </div>
      </div>
    </sidebar>
  </div>
</template>

<script>
import editableText from "@/components/editableText";
import sidebar from "@/components/sidebar";
import { mouseclick } from "@/common/utils/mouse";
import { getPhaseLog } from "@/common/utils/log";
import * as URL from "@/common/utils/url";
import { mapState, mapMutations } from "vuex";
export default {
  components: {
    editableText,
    sidebar
  },
  props: {
    phase: {
      type: Object,
      default: () => ({})
    },
    index: {
      type: Number,
      default: 0
    },
    phaseActiveIndex: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      showDetail: false,
      phaseDeleting: false
    };
  },
  computed: {
    ...mapState("user", ["id", "token"]),
    ...mapState("project", ["projects", "activeIndex", "logs"]),
    navActiveStyle() {
      const { index, phaseActiveIndex } = this;
      return index === phaseActiveIndex
        ? "background-color: white; color: black"
        : "background-color: whitesmoke; color: gray";
    },
    computedPhaseName() {
      const { logs, projects, activeIndex, index, phase } = this;
      let projectId = projects[activeIndex]._id;
      let phaseId = phase._id;
      let logPhaseName = getPhaseLog(logs, projectId, phaseId, "name");
      let phaseName = logPhaseName ? logPhaseName : phase.name;
      return phaseName ? phaseName : `${this.$t("UNTITLE_PHASE")}-${index + 1}`;
    },
    computedPhaseDescription() {
      const { logs, projects, activeIndex, phase } = this;
      let projectId = projects[activeIndex]._id;
      let phaseId = phase._id;
      let logPhaseDescription = getPhaseLog(
        logs,
        projectId,
        phaseId,
        "description"
      );
      return logPhaseDescription ? logPhaseDescription : phase.description;
    }
  },
  methods: {
    mouseclick,
    ...mapMutations({
      add_log: "project/add_log",
      remove_log: "project/remove_log",
      delete_phase: "project/delete_phase"
    }),
    selectPhase(e) {
      const { phaseActiveIndex, index } = this;
      if (phaseActiveIndex !== index)
        return this.$emit("on-select", this.index);
      return this.mouseclick("sidebar", e);
    },
    nameChange(val) {
      const { projects, activeIndex, phase } = this;
      let projectId = projects[activeIndex]._id;
      let phaseId = phase._id;
      if (phase.name !== val)
        return this.add_log({
          projectId,
          phaseId,
          field: "name",
          value: val
        });
      return this.remove_log({
        projectId,
        phaseId,
        field: "name"
      });
    },
    descriptionChange(val) {
      const { projects, activeIndex, phase } = this;
      let projectId = projects[activeIndex]._id;
      let phaseId = phase._id;
      if (phase.description !== val)
        return this.add_log({
          projectId,
          phaseId,
          field: "description",
          value: val
        });
      return this.remove_log({
        projectId,
        phaseId,
        field: "description"
      });
    },
    deletePhase() {
      this.$confirm.show({
        title: this.$t("DELETE_PHASE_TITLE"),
        message: this.$t("DELETE_PHASE_MESSAGE"),
        success: async () => {
          try {
            const { activeIndex, projects, phase, index } = this;
            let projectId = projects[activeIndex]._id;
            let phaseId = phase._id;
            let url = URL.DELETE_PHASE(phaseId);
            this.phaseDeleting = true;
            const resp = await this.$http.delete(url);
            if (resp.data.data === "ok") {
              this.mouseclick("sidebar");
              this.delete_phase({ projectId, phaseId });
            } else {
              this.$alert.show({
                type: "warning",
                message: this.$t("DELETE_PHASE_ERROR"),
                interval: 5000
              });
            }
          } catch (err) {
            console.log(err);
            this.$alert.show({
              type: "warning",
              message: this.$t("DELETE_PHASE_ERROR"),
              interval: 5000
            });
          } finally {
            this.phaseDeleting = false;
          }
        },
        confirmLabel: this.$t("CONFIRM"),
        cancelLabel: this.$t("CANCEL")
      });
    },
    sidebarShow() {
      this.showDetail = true;
    },
    sidebarHide() {
      this.showDetail = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.delete-phase-btn {
  margin-top: 10px;
  width: 100%;
  height: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  a {
    width: 80%;
    height: 100%;
    border-radius: 10px;
    color: white;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    // background-color: var(--main-color-danger);
    cursor: pointer;
  }
  a:active {
    -webkit-box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
    box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
  }
}
.attention {
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
