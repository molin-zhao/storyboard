let API_HOST = process.env.API_HOST;
let PASSPORT_HOST = process.env.PASSPORT_HOST;
let DFS_HOST = process.env.DFS_HOST;
let SOCKET_HOST = process.env.SOCKET_HOST;
let COMPUTE_HOST = process.env.COMPUTE_HOST;
export const GET_SMS_PASSWORD = id =>
  PASSPORT_HOST + `/user/sms/password?id=${id}`;
export const POST_SMS_SEND_CODE = isPhone => {
  if (isPhone) return PASSPORT_HOST + "/user/sms/phone";
  return PASSPORT_HOST + "/user/sms/email";
};

export const POST_USER_LOGIN = byPassword => {
  if (byPassword) return PASSPORT_HOST + "/user/login/password";
  return PASSPORT_HOST + "/user/login/sms";
};

export const POST_REGISTER_LOCAL = () => {
  return PASSPORT_HOST + "/user/register/local";
};

export const POST_DFS_UPLOAD = () => {
  return DFS_HOST + "/dfs/upload";
};

export const POST_FILE_UPLOAD = () => {
  return COMPUTE_HOST + "/file/upload";
};

export const DELETE_DFS_DELETE = id => {
  return DFS_HOST + `/dfs/delete?id=${id}`;
};

export const POST_UPLOAD_USER_PROFILE = () => {
  return API_HOST + "/user/profile";
};

export const POST_UPDATE_USER_PROFILE = () => {
  return API_HOST + "/user/profile/update";
};

export const POST_CREATE_PROJECT = () => {
  return API_HOST + "/project/create";
};

export const POST_CREATE_PHASE = () => {
  return API_HOST + "/project/phase/create";
};

export const POST_CREATE_GROUP = () => {
  return API_HOST + "/project/group/create";
};

export const POST_CREATE_TASK = () => {
  return API_HOST + "/project/task/create";
};

export const POST_CREATE_TEAM = () => {
  return API_HOST + "/team/create";
};

export const POST_CREATE_WAREHOUSE = () => {
  return API_HOST + "/warehouse/create";
};

export const POST_ADD_PROJECT_MEMBER = () => {
  return API_HOST + "/project/member/add";
};

export const POST_EDIT_TASK_MEMBER = () => {
  return API_HOST + "/project/task/member/edit";
};

export const POST_SAVE_PROJECT_LOG = () => {
  return API_HOST + "/project/save";
};

export const GET_USER_STORYBOARD = id => {
  return API_HOST + `/user/storyboard?user=${id}`;
};

export const GET_USER_WAREHOUSE = id => {
  return API_HOST + `/warehouse?user=${id}`;
};

export const GET_VERIFY_TOKEN = token => {
  return PASSPORT_HOST + `/user/token/verify?token=${token}`;
};

export const GET_LOGOUT = id => {
  return PASSPORT_HOST + `/user/logout?user=${id}`;
};

export const CONNECT_SOCKET = () => {
  return SOCKET_HOST;
};

export const POST_SEARCH_USER = () => {
  return API_HOST + "/user/search";
};

export const GET_ONLINE_USER = projectId => {
  return API_HOST + `/user/online?project=${projectId}`;
};

export const GET_SYNC_PROJECT = projectId => {
  return API_HOST + `/project/sync?project=${projectId}`;
};

export const DELETE_TASK = (groupId, taskId) => {
  return API_HOST + `/project/task/delete?id=${taskId}&&group=${groupId}`;
};

export const DELETE_GROUP = (phaseId, groupId) => {
  return API_HOST + `/project/group/delete?id=${groupId}&&phase=${phaseId}`;
};

export const DELETE_PHASE = (projectId, phaseId) => {
  return API_HOST + `/project/phase/delete?id=${phaseId}&&project=${projectId}`;
};

export const DELETE_PROJECT = projectId => {
  return API_HOST + `/project/delete?id=${projectId}`;
};

export const GET_USER_AVATAR = userId => {
  return API_HOST + `/user/avatar?id=${userId}`;
};

export const GET_USER_ONLINE = userId => {
  return API_HOST + `/user/online?id=${userId}`;
};

export const GET_PROJECT_ONLINE_MEMBERS = projectId => {
  return API_HOST + `/project/member/online?id=${projectId}`;
};

export const POST_SEARCH_WAREHOUSE_ITEM_BY_FIELD = () => {
  return API_HOST + "/warehouse/item/search/field";
};
