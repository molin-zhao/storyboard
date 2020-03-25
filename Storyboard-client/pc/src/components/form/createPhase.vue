<template>
  <div id="modal-create-phase" class="modal fade" role="dialog">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title display-only">
            {{ $t("CREATE_PHASE") }}
          </h5>
          <a
            style="font-size: 20px; cursor: pointer"
            class="display-only"
            aria-hidden="true"
            aria-label="Close"
            data-target="#modal-create-phase"
            data-dismiss="modal"
            >&times;</a
          >
        </div>
        <div class="modal-body">
          <form style="wrapper">
            <div class="form-group form-left-centered">
              <label
                >{{ $t("PHASE_NAME")
                }}<span style="font-size: 12px;color: red">*</span></label
              >
              <div class="form-row" style="width: 100%; margin: 0; padding: 0">
                <input
                  :class="`form-control ${nameError ? 'is-invalid' : null}`"
                  :style="computedNameStyle(nameError)"
                  v-model="name"
                  :placeholder="$t('REQUIRED')"
                  @input="nameOnInput($event)"
                />
              </div>
              <span class="form-text text-danger error-text">{{
                nameError
              }}</span>
            </div>
            <div class="form-group form-left-centered">
              <label>{{ $t("PHASE_DESCRIPTION") }}</label>
              <textarea
                class="form-control"
                rows="3"
                :placeholder="$t('OPTIONAL')"
                v-model="description"
              ></textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button
            :disabled="computedCreateBtnDisabled"
            type="submit"
            :class="computedCreateBtnClass"
            @click.stop="create"
          >
            <span
              v-if="createStatus === 'doing'"
              class="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
            <span v-else-if="createStatus === 'todo'">{{ $t("CREATE") }}</span>
            <span v-else>{{ $t("DONE") }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import * as URL from "@/common/utils/url";
export default {
  data() {
    return {
      name: "",
      nameError: "",
      description: "",
      members: [],
      public: true,
      createStatus: "todo",
      addMemberMethod: 0,
      teamSelectIndex: 0,
      searchResult: {},
      searchValue: "",
      searchLimit: 5
    };
  },
  mounted() {
    $("#modal-create-phase").on("hidden.bs.modal", () => {
      this.resetForm();
    });
  },
  computed: {
    ...mapState("team", ["teams"]),
    ...mapState("user", ["id", "token"]),
    ...mapState("project", ["projects", "activeIndex"]),
    computedNameStyle() {
      return function(error) {
        return `width: 100%; ${error ? "border-color: lightcoral" : null}`;
      };
    },
    computedCreateBtnDisabled() {
      const { createStatus } = this;
      if (createStatus === "todo") return false;
      return true;
    },
    computedCreateBtnClass() {
      const { createStatus } = this;
      return `btn btn-sm btn-${
        createStatus === "done" ? "success" : "primary"
      } create-btn`;
    }
  },
  methods: {
    ...mapMutations({
      add_phase: "project/add_phase"
    }),
    formCheck() {
      if (!this.name) {
        this.nameError = this.$t("REQUIRED_FIELD");
        return false;
      }
      return true;
    },
    resetForm() {
      this.name = "";
      this.description = "";
      this.createStatus = "todo";
      this.nameError = "";
    },
    async create() {
      try {
        const { name, description, id, projects, activeIndex } = this;
        let trimmedName = name.trim();
        let trimmedDescription = description.trim();
        let projectId = projects[activeIndex]._id;
        if (!this.formCheck()) return;
        this.createStatus = "doing";
        let url = URL.POST_CREATE_PHASE();
        const resp = await this.$http.post(
          url,
          {
            name: trimmedName,
            description: trimmedDescription,
            user: id,
            projectId
          },
          {
            emulateJSON: true
          }
        );
        let phase = resp.data.data;
        console.log(phase);
        this.add_phase({ projectId, phase });
        this.createStatus = "done";
      } catch (err) {
        this.createStatus = "todo";
      } finally {
        $("#modal-create-phase").modal("hide");
      }
    },
    nameOnInput(e) {
      this.nameError = "";
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
  .selected-user {
    cursor: pointer;
    width: 20%;
    height: 60px;
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
