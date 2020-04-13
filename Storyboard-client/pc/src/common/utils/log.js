const addLog = (orgLogs, payload) => {
  try {
    // payload -> {projectId, phaseId*, groupId*, taskId*, field, value}
    // logs -> tree structure
    const { projectId, phaseId, groupId, taskId, field, value } = payload;
    let root = orgLogs[projectId];
    if (!root)
      root = Object.assign(orgLogs, createProject(projectId))[projectId];
    if (!phaseId) {
      // update project field
      root[field] = value;
      return assignProject(orgLogs, projectId, root);
    }
    if (!groupId) {
      // update phase field,
      if (!root["phases"]) root["phases"] = { phaseId: {} };
      if (!root["phases"][phaseId]) root["phases"][phaseId] = {};
      root["phases"][phaseId][field] = value;
      return assignProject(orgLogs, projectId, root);
    }
    if (!taskId) {
      // update group field,
      if (!root["phases"]) root["phases"] = createPhase(phaseId);
      if (!root["phases"][phaseId])
        root["phases"] = Object.assign(
          {},
          root["phases"],
          createPhase(phaseId)
        );
      if (!root["phases"][phaseId]["groups"])
        root["phases"][phaseId]["groups"] = createGroup(groupId);
      if (!root["phases"][phaseId]["groups"][groupId])
        root["phases"][phaseId]["groups"] = Object.assign(
          {},
          root["phases"][phaseId]["groups"],
          createGroup(groupId)
        );
      root["phases"][phaseId]["groups"][groupId][field] = value;
      return assignProject(orgLogs, projectId, root);
    }
    // update task field
    if (!root["phases"]) root["phases"] = createPhase(phaseId);
    if (!root["phases"][phaseId])
      root["phases"] = Object.assign({}, root["phases"], createPhase(phaseId));
    if (!root["phases"][phaseId]["groups"])
      root["phases"][phaseId]["groups"] = createGroup(groupId);
    if (!root["phases"][phaseId]["groups"][groupId])
      root["phases"][phaseId]["groups"] = Object.assign(
        {},
        root["phases"][phaseId]["groups"],
        createGroup(groupId)
      );
    if (!root["phases"][phaseId]["groups"][groupId]["tasks"])
      root["phases"][phaseId]["groups"][groupId]["tasks"] = createTask(taskId);
    if (!root["phases"][phaseId]["groups"][groupId]["tasks"][taskId])
      root["phases"][phaseId]["groups"][groupId]["tasks"] = Object.assign(
        {},
        root["phases"][phaseId]["groups"][groupId]["tasks"],
        createTask(taskId)
      );
    root["phases"][phaseId]["groups"][groupId]["tasks"][taskId][field] = value;
    return assignProject(orgLogs, projectId, root);
  } catch (err) {
    console.log(err.message);
  }
};

const removeLog = (orgLogs, payload) => {
  try {
    const { projectId, phaseId, groupId, taskId, field } = payload;
    let root = orgLogs[projectId];
    if (!phaseId) {
      root[field] = undefined;
      return assignProject(orgLogs, projectId, root);
    }
    if (!groupId) {
      root["phases"][phaseId][field] = undefined;
      return assignProject(orgLogs, projectId, root);
    }
    if (!taskId) {
      root["phases"][phaseId]["groups"][groupId][field] = undefined;
      return assignProject(orgLogs, projectId, root);
    }
    root["phases"][phaseId]["groups"][groupId]["tasks"][taskId][
      field
    ] = undefined;
    return assignProject(orgLogs, projectId, root);
  } catch (err) {
    console.log(err);
  }
};

const createPhase = phaseId => {
  let obj = {};
  obj[phaseId] = {
    name: undefined,
    description: undefined,
    groups: {}
  };
  return obj;
};

const createGroup = groupId => {
  let obj = {};
  obj[groupId] = {
    name: undefined,
    color: undefined,
    tasks: {}
  };
  return obj;
};

const createTask = taskId => {
  let obj = {};
  obj[taskId] = {
    name: undefined,
    status: undefined,
    priority: undefined,
    start_date: undefined,
    due_date: undefined
  };
  return obj;
};

const createProject = projectId => {
  let obj = {};
  obj[projectId] = {
    name: undefined,
    description: undefined,
    phases: {}
  };
  return obj;
};

const assignProject = (org, projectId, source) => {
  let obj = {};
  obj[projectId] = source;
  return Object.assign({}, org, obj);
};

const isEdited = rootProj => {
  if (!rootProj) return false;
  let values = Object.values(rootProj);
  for (let i = 0; i < values.length; i++) {
    if (typeof values[i] === "string") return true;
    if (values[i] && values[i].constructor === Object) {
      if (isEdited(values[i])) return true;
      continue;
    }
  }
  return false;
};

const generateLog = (obj, prefix = "") => {
  let hasLog = false;
  if (!obj.constructor || obj.constructor !== Object) return;
  for (let key in obj) {
    if (typeof obj[key] === "undefined") delete obj[key];
    else if (!hasLog) hasLog = true;
    else continue;
  }
  if (!hasLog) return null;
  if (prefix !== "") {
    let objs = Object.keys(obj).reduce((newData, key) => {
      let newKey = prefix + key;
      newData[newKey] = obj[key];
      return newData;
    }, {});
    return objs;
  }
  return obj;
};

const confirmLog = log => {
  let logCopy = Object.assign({}, log);
  let projectLogs = {};
  let phaseLogs = {};
  let groupLogs = {};
  let taskLogs = {};
  for (let projectId in logCopy) {
    let project = logCopy[projectId];
    if (project["phases"]) {
      for (let phaseId in project["phases"]) {
        let phase = project["phases"][phaseId];
        if (phase["groups"]) {
          for (let groupId in phase["groups"]) {
            let group = phase["groups"][groupId];
            if (group["tasks"]) {
              for (let taskId in group["tasks"]) {
                let task = group["tasks"][taskId];
                let trimmedTaskLog = generateLog(task);
                if (trimmedTaskLog) taskLogs[taskId] = { $set: trimmedTaskLog };
              }
              delete group["tasks"];
            }
            let trimmedGroupLog = generateLog(group);
            if (trimmedGroupLog) groupLogs[groupId] = { $set: trimmedGroupLog };
          }
          delete phase["groups"];
        }
        let trimmedPhaseLog = generateLog(phase);
        if (trimmedPhaseLog) phaseLogs[phaseId] = { $set: trimmedPhaseLog };
      }
      delete project["phases"];
    }
    let trimmedProjectLog = generateLog(project);
    if (trimmedProjectLog) projectLogs[projectId] = { $set: trimmedProjectLog };
  }

  return {
    projectLogs,
    phaseLogs,
    groupLogs,
    taskLogs
  };
};

const logCount = rootProj => {
  if (!rootProj) return 0;
  let count = 0;
  let values = Object.values(rootProj);
  for (let i = 0; i < values.length; i++) {
    if (typeof values[i] === "string") count++;
    if (values[i] && values[i].constructor === Object)
      count += logCount(values[i]);
  }
  return count;
};

const getTaskLog = (projects, projId, phaseId, groupId, taskId, field) => {
  try {
    return projects[projId]["phases"][phaseId]["groups"][groupId]["tasks"][
      taskId
    ][field];
  } catch (err) {
    return undefined;
  }
};

const getGroupLog = (projects, projId, phaseId, groupId, field) => {
  try {
    return projects[projId]["phases"][phaseId]["groups"][groupId][field];
  } catch (err) {
    return undefined;
  }
};

const getPhaseLog = (projects, projId, phaseId, field) => {
  try {
    return projects[projId]["phases"][phaseId][field];
  } catch (err) {
    return undefined;
  }
};

const getProjectLog = (projects, projId, field) => {
  try {
    return projects[projId][field];
  } catch (err) {
    return undefined;
  }
};

const addTask = (state, groupId, task) => {
  // search for group by groupId, and concat tasks with new task
  let projects = state.projects;
  let groupLookup = state.groupLookup;
  let groupLookupVector = groupLookup[groupId];
  if (
    groupLookupVector &&
    groupLookupVector.constructor === Array &&
    groupLookupVector.length === 3
  ) {
    let projectIndex = groupLookup[groupId][0];
    let phaseIndex = groupLookup[groupId][1];
    let groupIndex = groupLookup[groupId][2];
    let tasks =
      projects[projectIndex]["phases"][phaseIndex]["groups"][groupIndex][
        "tasks"
      ];
    let taskIndex = tasks.length;
    updateTaskLookup(
      state,
      projectIndex,
      phaseIndex,
      groupIndex,
      taskIndex,
      task["_id"]
    );
    projects[projectIndex]["phases"][phaseIndex]["groups"][groupIndex][
      "tasks"
    ] = tasks.concat(task);
  } else {
    nativeAddTask(state, groupId, task);
  }
};

const addGroup = (state, phaseId, group) => {
  let projects = state.projects;
  let phaseLookup = state.phaseLookup;
  let phaseLookupVector = phaseLookup[phaseId];
  if (
    phaseLookupVector &&
    phaseLookupVector.constructor === Array &&
    phaseLookupVector.length === 2
  ) {
    let projectIndex = phaseLookup[phaseId][0];
    let phaseIndex = phaseLookup[phaseId][1];
    let groups = projects[projectIndex]["phases"][phaseIndex]["groups"];
    let groupIndex = groups.length;
    let task = group["tasks"][0];
    let taskIndex = 0;
    updateGroupLookup(
      state,
      projectIndex,
      phaseIndex,
      groupIndex,
      group["_id"]
    );
    updateTaskLookup(
      state,
      projectIndex,
      phaseIndex,
      groupIndex,
      taskIndex,
      task["_id"]
    );
    projects[projectIndex]["phases"][phaseIndex]["groups"] = groups.concat(
      group
    );
  } else {
    nativeAddGroup(state, phaseId, group);
  }
};

const addPhase = (state, projectId, phase) => {
  let projects = state.projects;
  let projectLookup = state.projectLookup;
  let projectLookupVector = projectLookup[projectId];
  if (
    projectLookupVector &&
    projectLookupVector.constructor === Array &&
    projectLookupVector.length === 1
  ) {
    let projectIndex = projectLookupVector[0];
    let phases = projects[projectIndex]["phases"];
    let phaseIndex = phases.length;
    let group = phase["groups"][0];
    let task = phase["groups"][0]["tasks"][0];
    let groupIndex = 0;
    let taskIndex = 0;
    updatePhaseLookup(state, projectIndex, phaseIndex, phase["_id"]);
    updateGroupLookup(
      state,
      projectIndex,
      phaseIndex,
      groupIndex,
      group["_id"]
    );
    updateTaskLookup(
      state,
      projectIndex,
      phaseIndex,
      groupIndex,
      taskIndex,
      task["_id"]
    );
    projects[projectIndex]["phases"] = phases.concat(phase);
  } else {
    nativeAddPhase(state, projectId, phase);
  }
};

const addProject = (state, project) => {
  let projects = state.projects;
  let projectIndex = projects.length;
  let phase = project["phases"][0];
  let phaseIndex = 0;
  let group = phase["groups"][0];
  let groupIndex = 0;
  let task = group["tasks"][0];
  let taskIndex = 0;
  updateProjectLookup(state, projectIndex, project["_id"]);
  updatePhaseLookup(state, projectIndex, phaseIndex, phase["_id"]);
  updateGroupLookup(state, projectIndex, phaseIndex, groupIndex, group["_id"]);
  updateTaskLookup(
    state,
    projectIndex,
    phaseIndex,
    groupIndex,
    taskIndex,
    task["_id"]
  );
};

const nativeAddPhase = (state, projectId, phase) => {
  let projects = state.projects;
  for (let i = 0; i < projects.length; i++) {
    if (projects[i]["_id"] === projectId) {
      let phaseIndex = projects[i]["phases"].length;
      updatePhaseLookup(state, i, phaseIndex, phase["_id"]);
      updateGroupLookup(state, i, phaseIndex, 0, phase["groups"][0]["_id"]);
      updateTaskLookup(
        state,
        i,
        phaseIndex,
        0,
        0,
        phase["groups"][0]["tasks"][0]["_id"]
      );
      projects[i]["phases"] = projects[i]["phases"].concat(phase);
      return projects;
    }
  }
};

const nativeAddGroup = (state, phaseId, group) => {
  let projects = state.projects;
  for (let i = 0; i < projects.length; i++) {
    let phases = projects[i]["phases"];
    for (let j = 0; j < phases.length; j++) {
      if (phases[j]["_id"] === phaseId) {
        let groupIndex = phases[j]["groups"].length;
        updateGroupLookup(state, i, j, groupIndex, group["_id"]);
        updateTaskLookup(state, i, j, groupIndex, 0, group["tasks"][0]["_id"]);
        phases[j]["groups"] = phases[j]["groups"].concat(group);
        return;
      }
    }
  }
};

const nativeAddTask = (state, groupId, task) => {
  let projects = state.projects;
  for (let i = 0; i < projects.length; i++) {
    let phases = projects[i]["phases"];
    for (let j = 0; j < phases.length; j++) {
      let groups = phases[j]["groups"];
      for (let k = 0; k < groups.length; k++) {
        if (groups[k]["_id"] === groupId) {
          let taskIndex = groups[k]["tasks"].length;
          updateTaskLookup(state, i, j, k, taskIndex, task["_id"]);
          groups[k]["tasks"] = groups[k]["tasks"].concat(task);
          return;
        }
      }
    }
  }
};

const updateProjectLookup = (state, projectIndex, lookupId) => {
  let projectLookup = state.projectLookup;
  projectLookup[lookupId] = [projectIndex];
};

const updatePhaseLookup = (state, projectIndex, phaseIndex, lookupId) => {
  let phaseLookup = state.phaseLookup;
  phaseLookup[lookupId] = [projectIndex, phaseIndex];
};

const updateGroupLookup = (
  state,
  projectIndex,
  phaseIndex,
  groupIndex,
  lookupId
) => {
  let groupLookup = state.groupLookup;
  groupLookup[lookupId] = [projectIndex, phaseIndex, groupIndex];
};

const updateTaskLookup = (
  state,
  projectIndex,
  phaseIndex,
  groupIndex,
  taskIndex,
  lookupId
) => {
  let taskLookup = state.taskLookup;
  taskLookup[lookupId] = [projectIndex, phaseIndex, groupIndex, taskIndex];
};

const addProjectMembers = (state, projectId, members) => {
  let projects = state.projects;
  for (let i = 0; i < projects.length; i++) {
    if (projects[i]["_id"] === projectId) {
      if (projects["members"]) {
        projects["members"] = projects["members"].concat(members);
      } else {
        projects["members"] = members;
      }
      break;
    }
  }
};

const editTaskMembers = (state, groupId, taskId, members) => {
  let projects = state.projects;
  let groupLookup = state.groupLookup;
  if (
    groupLookup[groupId].constructor === Array &&
    groupLookup[groupId].length === 3
  ) {
    console.log("lookup group");
    let projectIndex = groupLookup[groupId][0];
    let phaseIndex = groupLookup[groupId][1];
    let groupIndex = groupLookup[groupId][2];
    let tasks =
      projects[projectIndex]["phases"][phaseIndex]["groups"][groupIndex][
        "tasks"
      ];
    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i]["_id"] === taskId) {
        tasks[i]["members"] = members;
      }
    }
  } else {
    for (let i = 0; i < projects.length; i++) {
      let phases = projects[i]["phases"];
      for (let j = 0; j < phases.length; j++) {
        let groups = phases[j]["groups"];
        for (let k = 0; k < groups.length; k++) {
          if (groups[k]["_id"] === groupId) {
            let tasks = group[k]["tasks"];
            for (let l = 0; l < tasks.length; k++) {
              if (tasks[l]["_id"] === taskId) {
                tasks[l]["members"] = members;
              }
            }
            return;
          }
        }
      }
    }
  }
};

const deleteTask = (state, groupId, taskId) => {
  let projects = state.projects;
  let groupLookup = state.groupLookup;
  let groupLookupVector = groupLookup[groupId];
  if (state.taskLookup[taskId]) delete state.taskLookup[taskId];
  if (
    groupLookupVector &&
    groupLookupVector.constructor === Array &&
    groupLookupVector.length === 3
  ) {
    let projectIndex = groupLookup[groupId][0];
    let phaseIndex = groupLookup[groupId][1];
    let groupIndex = groupLookup[groupId][2];
    let tasks =
      projects[projectIndex]["phases"][phaseIndex]["groups"][groupIndex][
        "tasks"
      ];
    projects[projectIndex]["phases"][phaseIndex]["groups"][groupIndex][
      "tasks"
    ] = tasks.filter(task => task._id !== taskId);
  } else {
    nativeDeleteTask(state, groupId, taskId);
  }
};

const deleteGroup = (state, phaseId, groupId) => {
  let projects = state.projects;
  let phaseLookup = state.phaseLookup;
  let phaseLookupVector = phaseLookup[phaseId];
  if (state.groupLookup[groupId]) delete state.groupLookup[groupId];
  if (
    phaseLookupVector &&
    phaseLookupVector.constructor === Array &&
    phaseLookupVector.length === 2
  ) {
    let projectIndex = phaseLookup[phaseId][0];
    let phaseIndex = phaseLookup[phaseId][1];
    let groups = projects[projectIndex]["phases"][phaseIndex]["groups"];
    // update groupLookup
    projects[projectIndex]["phases"][phaseIndex]["groups"] = groups.filter(
      group => group._id !== groupId
    );
  } else {
    nativeDeleteGroup(state, phaseId, groupId);
  }
};

const deletePhase = (state, projectId, phaseId) => {
  let projects = state.projects;
  let projectLookup = state.projectLookup;
  let projectLookupVector = projectLookup[projectId];
  if (state.phaseLookup[phaseId]) delete state.phaseLookup[phaseId];
  if (
    projectLookupVector &&
    projectLookupVector.constructor === Array &&
    projectLookupVector.length === 1
  ) {
    let projectIndex = projectLookup[projectId][0];
    let phases = projects[projectIndex]["phases"];
    // update phaseLookup and groupLookup
    // TODO
    projects[projectIndex]["phases"] = phases.filter(
      phase => phase._id !== phaseId
    );
  } else {
    nativeDeletePhase(state, projectId, phaseId);
  }
};

const deleteProject = (state, projectId) => {
  let projects = state.projects;
  if (state.projectLookup[projectId]) delete state.projectLookup[projectId];
  projects = projects.filter(project => project._id !== projectId);
  return;
};

const nativeDeleteTask = (state, groupId, taskId) => {
  let projects = state.projects;
  for (let i = 0; i < projects.length; i++) {
    let phases = projects[i]["phases"];
    for (let j = 0; j < phases.length; j++) {
      let groups = phases[j]["groups"];
      for (let k = 0; k < groups.length; k++) {
        if (groups[k]["_id"] === groupId) {
          groups[k]["tasks"] = groups[k]["tasks"].filter(
            task => task._id !== taskId
          );
          return;
        }
      }
    }
  }
};

const nativeDeleteGroup = (state, phaseId, groupId) => {
  let projects = state.projects;
  for (let i = 0; i < projects.length; i++) {
    let phases = projects[i]["phases"];
    for (let j = 0; j < phases.length; j++) {
      if (phases[j]["_id"] === phaseId) {
        phases[j]["groups"] = phases[j]["groups"].filter(
          group => group._id !== groupId
        );
        return;
      }
    }
  }
};

const nativeDeletePhase = (state, projectId, phaseId) => {
  let projects = state.projects;
  for (let i = 0; i < projects.length; i++) {
    if (projects[i]["_id"] === projectId) {
      projects[i]["phases"] = projects[i]["phases"].filter(
        phase => phase._id !== phaseId
      );
      return;
    }
  }
};

const generateLookup = projects => {
  let projectLookup = {};
  let phaseLookup = {};
  let groupLookup = {};
  let taskLookup = {};
  for (let i = 0; i < projects.length; i++) {
    projectLookup[projects[i]["_id"]] = [i];
    let phases = projects[i]["phases"];
    for (let j = 0; j < phases.length; j++) {
      phaseLookup[phases[j]["_id"]] = [i, j];
      let groups = phases[j]["groups"];
      for (let k = 0; k < groups.length; k++) {
        groupLookup[groups[k]["_id"]] = [i, j, k];
        let tasks = groups[k]["tasks"];
        for (let l = 0; l < tasks.length; l++) {
          taskLookup[tasks[l]["_id"]] = [i, j, k, l];
        }
      }
    }
  }
  return { projectLookup, phaseLookup, groupLookup, taskLookup };
};

export {
  addLog,
  removeLog,
  isEdited,
  getTaskLog,
  getGroupLog,
  getPhaseLog,
  getProjectLog,
  logCount,
  confirmLog,
  addTask,
  addGroup,
  addPhase,
  addProject,
  deleteTask,
  deleteGroup,
  deletePhase,
  deleteProject,
  generateLookup,
  addProjectMembers,
  editTaskMembers
};
