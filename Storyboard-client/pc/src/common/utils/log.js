const addLog = (state, payload) => {
  try {
    // payload -> {projectId, phaseId*, groupId*, taskId*, field, value}
    // logs -> tree structure
    let logs = state.logs;
    const { projectId, phaseId, groupId, taskId, field, value } = payload;
    // 1. projectId is required
    if (!projectId) return;

    // 2. first log of projectId, create a empty obj with key projectId
    if (!logs[projectId]) logs[projectId] = createProject();

    // 3. position logs by checking provided ids
    // 1) phaseId not provided, only change project field
    if (!phaseId) {
      logs[projectId][field] = value;
      // state.logs = assignProject(logs, projectId, logs[projectId]);
      return Object.assign({}, logs);
    }
    // 2) groupId not provided, only change phase field
    if (!groupId) {
      let phases = logs[projectId]["phases"];
      if (!phases) phases = createPhase(phaseId);
      if (!phases[phaseId]) phases[phaseId] = createPhase();
      phases[phaseId][field] = value;
      logs[projectId]["phases"] = phases;
      // state.logs = assignProject(orgLogs, projectId, logs[projectId]);
      return Object.assign({}, logs);
    }
    // 3) taskId not provided, only change group field
    if (!taskId) {
      let phases = logs[projectId]["phases"];
      if (!phases) phases = createPhase(phaseId);
      if (!phases[phaseId]) phases[phaseId] = createPhase();
      let groups = phases[phaseId]["groups"];
      if (!groups) groups = createGroup(groupId);
      if (!groups[groupId]) groups[groupId] = createGroup();
      groups[groupId][field] = value;
      phases[phaseId]["groups"] = groups;
      logs[projectId]["phases"] = phases;
      return Object.assign({}, logs);
    }
    // 4) taskId provided, only change task field
    let phases = logs[projectId]["phases"];
    if (!phases) phases = createPhase(phaseId);
    if (!phases[phaseId]) phases[phaseId] = createPhase();
    let groups = phases[phaseId]["groups"];
    if (!groups) groups = createGroup(groupId);
    if (!groups[groupId]) groups[groupId] = createGroup();
    let tasks = groups[groupId]["tasks"];
    if (!tasks) tasks = createTask(taskId);
    if (!tasks[taskId]) tasks[taskId] = createTask();
    tasks[taskId][field] = value;
    groups[groupId]["tasks"] = tasks;
    phases[phaseId]["groups"] = groups;
    logs[projectId]["phases"] = phases;
    return Object.assign({}, logs);
  } catch (err) {
    console.log(err);
  }
};

const removeLog = (state, payload) => {
  try {
    let logs = state.logs;
    console.log(logs);
    console.log(payload);
    const { projectId, phaseId, groupId, taskId, field } = payload;
    if (!phaseId) {
      // remove project field
      logs[projectId][field] = undefined;
      return Object.assign({}, logs);
    }
    if (!groupId) {
      // remove phase field
      logs[projectId]["phases"][phaseId][field] = undefined;
      return Object.assign({}, logs);
    }
    if (!taskId) {
      logs[projectId]["phases"][phaseId]["groups"][groupId][field] = undefined;
      return Object.assign({}, logs);
    }
    logs[projectId]["phases"][phaseId]["groups"][groupId]["tasks"][taskId][
      field
    ] = undefined;
    return Object.assign({}, logs);
  } catch (err) {
    console.log(err);
  }
};

const createPhase = phaseId => {
  let obj = {};
  if (phaseId) {
    obj[phaseId] = {
      name: undefined,
      description: undefined,
      groups: {}
    };
  } else {
    obj["name"] = undefined;
    obj["description"] = undefined;
    obj["groups"] = {};
  }
  return obj;
};

const createGroup = groupId => {
  let obj = {};
  if (groupId) {
    obj[groupId] = {
      name: undefined,
      color: undefined,
      tasks: {}
    };
  } else {
    obj["name"] = undefined;
    obj["color"] = undefined;
    obj["tasks"] = {};
  }
  return obj;
};

const createTask = taskId => {
  let obj = {};
  if (taskId) {
    obj[taskId] = {
      name: undefined,
      status: undefined,
      priority: undefined,
      start_date: undefined,
      due_date: undefined
    };
  } else {
    obj["name"] = undefined;
    obj["status"] = undefined;
    obj["priority"] = undefined;
    obj["start_date"] = undefined;
    obj["due_date"] = undefined;
  }
  return obj;
};

const createProject = projectId => {
  let obj = {};
  if (projectId) {
    obj[projectId] = {
      name: undefined,
      description: undefined,
      phases: {}
    };
  } else {
    obj["name"] = undefined;
    obj["description"] = undefined;
    obj["phases"] = {};
  }
  return obj;
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

const confirmLogs = logs => {
  let projectLogs = {};
  let phaseLogs = {};
  let groupLogs = {};
  let taskLogs = {};
  if (!logs || logs.constructor !== Object)
    return {
      projectLogs,
      phaseLogs,
      groupLogs,
      taskLogs
    };
  let logsCopy = Object.assign({}, logs);
  for (let projectId in logsCopy) {
    let project = logsCopy[projectId];
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

const confirmLog = log => {
  let projectLogs = {};
  let phaseLogs = {};
  let groupLogs = {};
  let taskLogs = {};
  if (!log || log.constructor !== Object)
    return {
      projectLogs,
      phaseLogs,
      groupLogs,
      taskLogs
    };
  let projectCopy = Object.assign({}, log);
  if (projectCopy["phases"]) {
    for (let phaseId in projectCopy["phases"]) {
      let phaseCopy = Object.assign({}, projectCopy["phases"][phaseId]);
      if (phaseCopy["groups"]) {
        for (let groupId in phaseCopy["groups"]) {
          let groupCopy = Object.assign({}, phaseCopy["groups"][groupId]);
          if (groupCopy["tasks"]) {
            for (let taskId in groupCopy["tasks"]) {
              let taskCopy = Object.assign({}, groupCopy["tasks"][taskId]);
              let trimmedTaskLog = generateLog(taskCopy);
              if (trimmedTaskLog) taskLogs[taskId] = { $set: trimmedTaskLog };
            }
            delete groupCopy["tasks"];
          }
          let trimmedGroupLog = generateLog(groupCopy);
          if (trimmedGroupLog) groupLogs[groupId] = { $set: trimmedGroupLog };
        }
        delete phaseCopy["groups"];
      }
      let trimmedPhaseLog = generateLog(phaseCopy);
      if (trimmedPhaseLog) phaseLogs[phaseId] = { $set: trimmedPhaseLog };
    }
    delete projectCopy["phases"];
  }
  let trimmedProjectLog = generateLog(projectCopy);
  if (trimmedProjectLog) projectLogs[projectId] = { $set: trimmedProjectLog };
  return {
    projectLogs,
    phaseLogs,
    groupLogs,
    taskLogs
  };
};

const mergeLogs = (state, ids, logs) => {
  const { projectIds, phaseIds, groupIds, taskIds } = ids;
  const { projectLogs, phaseLogs, groupLogs, taskLogs } = logs;
  for (let taskId in taskLogs) {
    if (taskIds.includes(taskId)) {
      updateTask(state, taskId, taskLogs[taskId]["$set"]);
    }
  }
  for (let groupId in groupLogs) {
    if (groupIds.includes(groupId)) {
      updateGroup(state, groupId, groupLogs[groupId]["$set"]);
    }
  }
  for (let phaseId in phaseLogs) {
    if (phaseIds.includes(phaseId)) {
      updatePhase(state, phaseId, phaseLogs[phaseId]["$set"]);
    }
  }
  for (let projectId in projectLogs) {
    if (projectIds.includes(projectId)) {
      updateProject(state, projectId, projectLogs[projectId]["$set"]);
    }
  }
};

const updateProject = (state, projectId, update) => {
  if (!update || update.constructor !== Object) return;
  let projects = state.projects;
  let projectLookup = state.projectLookup;
  let projectLookupVector = projectLookup[projectId];
  if (
    projectLookupVector &&
    projectLookupVector.constructor === Array &&
    projectLookupVector.length === 1
  ) {
    let projectIndex = projectLookupVector[0];
    for (let key in update) {
      projects[projectIndex][key] = update[key];
    }
  } else {
    nativeUpdateProject(state, projectId, update);
  }
};

const updatePhase = (state, phaseId, update) => {
  if (!update || update.constructor !== Object) return;
  let projects = state.projects;
  let phaseLookup = state.phaseLookup;
  let phaseLookupVector = phaseLookup[phaseId];
  if (
    phaseLookupVector &&
    phaseLookupVector.constructor === Array &&
    phaseLookupVector.length === 2
  ) {
    let projectIndex = phaseLookupVector[0];
    let phaseIndex = phaseLookupVector[1];
    let projectId = projects[projectIndex]["_id"];
    for (let key in update) {
      projects[projectIndex]["phases"][phaseIndex][key] = update[key];
      removeLog(state, { projectId, phaseId, field: key });
    }
  } else {
    nativeUpdatePhase(state, phaseId, update);
  }
};

const updateGroup = (state, groupId, update) => {
  if (!update || update.constructor !== Object) return;
  let projects = state.projects;
  let groupLookup = state.groupLookup;
  let groupLookupVector = groupLookup[groupId];
  if (
    groupLookupVector &&
    groupLookupVector.constructor === Array &&
    groupLookupVector.length === 3
  ) {
    let projectIndex = groupLookupVector[0];
    let phaseIndex = groupLookupVector[1];
    let groupIndex = groupLookupVector[2];
    let projectId = projects[projectIndex]["_id"];
    let phaseId = projects[projectIndex]["phases"][phaseIndex]["_id"];
    for (let key in update) {
      projects[projectIndex]["phases"][phaseIndex]["groups"][groupIndex][key] =
        update[key];
      removeLog(state, { projectId, phaseId, groupId, field: key });
    }
  } else {
    nativeUpdateGroup(state, groupId, update);
  }
};

const updateTask = (state, taskId, update) => {
  if (!update || update.constructor !== Object) return;
  let projects = state.projects;
  let taskLookup = state.taskLookup;
  let taskLookupVector = taskLookup[taskId];
  if (
    taskLookupVector &&
    taskLookupVector.constructor === Array &&
    taskLookupVector.length === 4
  ) {
    let projectIndex = taskLookupVector[0];
    let phaseIndex = taskLookupVector[1];
    let groupIndex = taskLookupVector[2];
    let taskIndex = taskLookupVector[3];
    let projectId = projects[projectIndex]["_id"];
    let phaseId = projects[projectIndex]["phases"][phaseIndex]["_id"];
    let groupId =
      projects[projectIndex]["phases"][phaseIndex]["groups"][groupIndex]["_id"];
    for (let key in update) {
      projects[projectIndex]["phases"][phaseIndex]["groups"][groupIndex][
        "tasks"
      ][taskIndex][key] = update[key];
      removeLog(state, { projectId, phaseId, groupId, taskId, field: key });
    }
  } else {
    nativeUpdateTask(state, taskId, update);
  }
};

const nativeUpdateProject = (state, projectId, update) => {
  let projects = state.projects;
  for (let i = 0; i < projects.length; i++) {
    if (projects[i]["_id"] === projectId) {
      for (let key in update) {
        projects[i][key] = update[key];
        removeLog(state, { projectId, field: key });
      }
      return;
    }
  }
};

const nativeUpdatePhase = (state, phaseId, update) => {
  let projects = state.projects;
  for (let i = 0; i < projects.length; i++) {
    for (let j = 0; j < projects[i]["phases"].length; j++) {
      if (projects[i]["phases"][j]["_id"] === phaseId) {
        let projectId = projects[i]["_id"];
        for (let key in update) {
          projects[i]["phases"][j][key] = update[key];
          removeLog(state, { projectId, phaseId, field: key });
        }
        return;
      }
    }
  }
};

const nativeUpdateGroup = (state, groupId, update) => {
  let projects = state.projects;
  for (let i = 0; i < projects.length; i++) {
    let phases = projects[i]["phases"];
    for (let j = 0; j < phases.length; k++) {
      let groups = phases[j]["groups"];
      for (let k = 0; k < groups.length; k++) {
        if (groups[k]["_id"] === groupId) {
          let projectId = projects[i]["_id"];
          let phaseId = phases[j]["_id"];
          for (let key in udpate) {
            projects[i]["phases"][j]["groups"][k][key] = update[key];
            removeLog(state, { projectId, phaseId, groupId, field: key });
          }
          return;
        }
      }
    }
  }
};

const nativeUpdateTask = (state, taskId, update) => {
  let projects = state.projects;
  for (let i = 0; i < projects.length; i++) {
    let phases = projects[i]["phases"];
    for (let j = 0; j < phases.length; k++) {
      let groups = phases[j]["groups"];
      for (let k = 0; k < groups.length; k++) {
        let tasks = groups[k]["tasks"];
        for (let l = 0; l < tasks.length; l++) {
          if (tasks[l]["_id"] === taskId) {
            let projectId = projects[i]["_id"];
            let phaseId = phases[j]["_id"];
            let groupId = groups[k]["_id"];
            for (let key in update) {
              projects[i]["phases"][j]["groups"][k]["tasks"][l][key] =
                update[key];
              removeLog(state, {
                projectId,
                phaseId,
                groupId,
                taskId,
                field: key
              });
            }
            return;
          }
        }
      }
    }
  }
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

const getTaskLog = (logs, projectId, phaseId, groupId, taskId, field) => {
  try {
    return logs[projectId]["phases"][phaseId]["groups"][groupId]["tasks"][
      taskId
    ][field];
  } catch (err) {
    return undefined;
  }
};

const getGroupLog = (logs, projectId, phaseId, groupId, field) => {
  try {
    return logs[projectId]["phases"][phaseId]["groups"][groupId][field];
  } catch (err) {
    return undefined;
  }
};

const getPhaseLog = (logs, projectId, phaseId, field) => {
  try {
    return logs[projectId]["phases"][phaseId][field];
  } catch (err) {
    return undefined;
  }
};

const getProjectLog = (logs, projectId, field) => {
  try {
    return projectId[projectId][field];
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
  state.projectLookup = Object.assign({}, projectLookup);
};

const updatePhaseLookup = (state, projectIndex, phaseIndex, lookupId) => {
  let phaseLookup = state.phaseLookup;
  phaseLookup[lookupId] = [projectIndex, phaseIndex];
  state.phaseLookup = Object.assign({}, phaseLookup);
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
  state.groupLookup = Object.assign({}, groupLookup);
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
  state.taskLookup = Object.assign({}, taskLookup);
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
  confirmLogs,
  mergeLogs,
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
