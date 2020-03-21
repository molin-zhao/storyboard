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
  console.log(obj);
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
    console.log(err.message);
    return undefined;
  }
};

const getProjectLog = (projects, projId, field) => {
  try {
    return projects[projId][field];
  } catch (err) {
    console.log(err.message);
    return undefined;
  }
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
  trimLog
};
