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
    due_date: undefined,
    members: []
  };
  return obj;
};

const createProject = projectId => {
  let obj = {};
  obj[projectId] = {
    name: undefined,
    description: undefined,
    phases: {},
    members: []
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

const trimLog = (rootProj, root = true) => {
  if (!rootProj) return null;
  let rootRef = root ? Object.assign({}, rootProj) : rootProj;
  let keys = Object.keys(rootRef);
  for (key in keys) {
    if (typeof rootRef[key] === "undefined") {
      delete rootRef[key];
      continue;
    }
    if (rootRef[key] && rootRef[key].constructor === Object) {
      trimLog(rootRef[key], false);
    }
  }
  return rootRef;
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
    projects[projectIndex]["phases"][phaseIndex]["groups"][groupIndex][
      "tasks"
    ] = tasks.concat(task);
  } else {
    for (let i = 0; i < projects.length; i++) {
      let phases = projects[i]["phases"];
      for (let j = 0; j < phases.length; j++) {
        let groups = phases[j]["groups"];
        for (let k = 0; k < groups.length; k++) {
          if (groups[k]["_id"] === groupId) {
            groups[k]["tasks"] = groups[k]["tasks"].concat(task);
            return;
          }
        }
      }
    }
  }
};

const addGroup = (state, phaseId, group) => {
  let projects = state.projects;
  let phaseLookup = state.phaseLookup;
  let groupLookup = state.groupLookup;
  if (
    phaseLookup[phaseId].constructor === Array &&
    phaseLookup[phaseId].length === 2
  ) {
    console.log("lookup phase");
    let projectIndex = phaseLookup[phaseId][0];
    let phaseIndex = phaseLookup[phaseId][1];
    let groups = projects[projectIndex]["phases"][phaseIndex]["groups"];
    // update groupLookup
    let phaseLookupVector = phaseLookup[phaseId]; //[i, j]
    let groupIndex = groups.length;
    let groupLookupVector = [groupIndex]; // [k]
    groupLookup[group._id] = phaseLookupVector.concat(groupLookupVector);
    projects[projectIndex]["phases"][phaseIndex]["groups"] = groups.concat(
      group
    );
  } else {
    for (let i = 0; i < projects.length; i++) {
      let phases = projects[i]["phases"];
      for (let j = 0; j < phases.length; j++) {
        if (phases[j]["_id"] === phaseId) {
          phases[j]["groups"] = phases[j]["groups"].concat(group);
          return;
        }
      }
    }
  }
};

const addPhase = (state, projectId, phase) => {
  let projects = state.projects;
  let projectLookup = state.projectLookup;
  let phaseLookup = state.phaseLookup;
  if (
    projectLookup[projectId].constructor === Array &&
    projectLookup[projectId].length === 1
  ) {
    console.log("lookup project");
    let projectIndex = projectLookup[projectId][0];
    let phases = projects[projectIndex]["phases"];
    // update groupLookup
    let projectLookupVector = projectLookup[projectId]; // [i]
    let phaseIndex = phases.length;
    let phaseLookupVector = [phaseIndex]; // [j]
    phaseLookup[phase._id] = projectLookupVector.concat(phaseLookupVector);
    projects[projectIndex]["phases"] = phases.concat(phase);
  } else {
    for (let i = 0; i < projects.length; i++) {
      if (projects[i]["_id"] === projectId) {
        projects[i]["phases"] = projects[i]["phases"].concat(phase);
        return projects;
      }
    }
  }
};

const deleteTask = (state, groupId, taskId) => {
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
    projects[projectIndex]["phases"][phaseIndex]["groups"][groupIndex][
      "tasks"
    ] = tasks.filter(task => task._id !== taskId);
  } else {
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
  }
};

const deleteGroup = (state, phaseId, groupId) => {
  let projects = state.projects;
  let phaseLookup = state.phaseLookup;
  if (
    phaseLookup[phaseId].constructor === Array &&
    phaseLookup[phaseId].length === 2
  ) {
    console.log("lookup phase");
    let projectIndex = phaseLookup[phaseId][0];
    let phaseIndex = phaseLookup[phaseId][1];
    let groups = projects[projectIndex]["phases"][phaseIndex]["groups"];
    // update groupLookup
    // TODO
    projects[projectIndex]["phases"][phaseIndex]["groups"] = groups.filter(
      group => group._id !== groupId
    );
  } else {
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
  }
};

const deletePhase = (state, projectId, phaseId) => {
  let projects = state.projects;
  let projectLookup = state.projectLookup;
  if (
    projectLookup[projectId].constructor === Array &&
    projectLookup[projectId].length === 1
  ) {
    console.log("lookup project");
    let projectIndex = projectLookup[projectId][0];
    let phases = projects[projectIndex]["phases"];
    // update phaseLookup and groupLookup
    // TODO
    projects[projectIndex]["phases"] = phases.filter(
      phase => phase._id !== phaseId
    );
  } else {
    for (let i = 0; i < projects.length; i++) {
      if (projects[i]["_id"] === projectId) {
        projects[i]["phases"] = projects[i]["phases"].filter(
          phase => phase._id !== phaseId
        );
        return;
      }
    }
  }
};

const deleteProject = (state, projectId) => {
  let projects = state.projects;
  projects = projects.filter(project => project._id !== projectId);
  return;
};

const generateLookup = projects => {
  let projectLookup = {};
  let phaseLookup = {};
  let groupLookup = {};
  for (let i = 0; i < projects.length; i++) {
    projectLookup[projects[i]["_id"]] = [i];
    let phases = projects[i]["phases"];
    for (let j = 0; j < phases.length; j++) {
      phaseLookup[phases[j]["_id"]] = [i, j];
      let groups = phases[j]["groups"];
      for (let k = 0; k < groups.length; k++) {
        groupLookup[groups[k]["_id"]] = [i, j, k];
      }
    }
  }
  return { projectLookup, phaseLookup, groupLookup };
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
  trimLog,
  addTask,
  addGroup,
  addPhase,
  deleteTask,
  deleteGroup,
  deletePhase,
  deleteProject,
  generateLookup
};
