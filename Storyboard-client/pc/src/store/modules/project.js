import {
  addLog,
  removeLog,
  addTask,
  addGroup,
  addPhase,
  addProject,
  deleteTask,
  deleteGroup,
  deletePhase,
  deleteProject,
  addProjectMembers,
  editTaskMembers,
  mergeLogs
} from "@/common/utils/log";
const state = {
  projects: [],
  activeIndex: 0,
  logs: {}, // tree
  taskLookup: {}, // reverse index for task
  groupLookup: {}, // reverse index for group
  phaseLookup: {}, // reverse index for phase
  projectLookup: {} // reverse index for project
};

const getters = {};
const actions = {};
const mutations = {
  add_project(state, payload) {
    addProject(state, payload);
    state.projects = state.projects.concat(payload);
  },
  sync_project(state, payload) {
    state.projects = state.projects.map(
      project => project["_id" === payload["_id"] ? payload : project]
    );
  },
  reload_projects(state, payload) {
    state.projects = payload;
  },
  select_index(state, payload) {
    state.activeIndex = payload;
  },
  add_log(state, payload) {
    state.logs = addLog(state, payload);
  },
  remove_log(state, payload) {
    state.logs = removeLog(state, payload);
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
    state.taskLookup = payload.taskLookup;
  },
  add_project_members(state, payload) {
    const { _id, members } = payload;
    addProjectMembers(state, _id, members);
  },
  edit_task_members(state, payload) {
    editTaskMembers(state, payload.groupId, payload.taskId, payload.members);
  },
  merge_logs(state, payload) {
    const { ids, logs } = payload;
    mergeLogs(state, ids, logs);
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
