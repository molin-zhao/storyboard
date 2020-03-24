import {
  addLog,
  removeLog,
  addTask,
  addGroup,
  addPhase,
  deleteTask,
  deleteGroup,
  deletePhase,
  deleteProject
} from "@/common/utils/log";
const state = {
  projects: [],
  activeIndex: 0,
  logs: {}, // tree
  groupLookup: {}, // reverse index for group
  phaseLookup: {}, // reverse index for phase
  projectLookup: {} // reverse index for project
};

const getters = {};
const actions = {};
const mutations = {
  add_projects(state, payload) {
    state.projects = state.projects.concat(payload);
  },
  reload_projects(state, payload) {
    state.projects = payload;
  },
  selete_index(state, payload) {
    state.activeIndex = payload;
  },
  add_log(state, payload) {
    state.logs = addLog(state.logs, payload);
  },
  remove_log(state, payload) {
    state.logs = removeLog(state.logs, payload);
  },
  add_task(state, payload) {
    addTask(state, payload.groupId, payload.task);
  },
  add_group(state, payload) {
    addGroup(state, payload.phaseId, payload.group);
  },
  add_phase(state, payload) {
    addPhase(state, payload.projectId, payload.phase);
  },
  delete_task(state, payload) {
    deleteTask(state, payload.groupId, payload.taskId);
  },
  delete_group(state, payload) {
    deleteGroup(state, payload.phaseId, payload.groupId);
  },
  delete_phase(state, payload) {
    deletePhase(state, payload.projectId, payload.phaseId);
  },
  delete_project(state, payload) {
    deleteProject(state, payload.projectId);
  },
  add_lookup(state, payload) {
    state.groupLookup = payload.groupLookup;
    state.phaseLookup = payload.phaseLookup;
    state.projectLookup = payload.projectLookup;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
