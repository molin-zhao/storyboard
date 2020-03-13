const ERROR = {
  NOT_FOUND: "Requested resource not found.",
  UNAUTHORIZED: "unauthorized request, permission denied.",
  USER_AUTHENTICATION_FAILED: "Authentication failed.",
  FORBIDDEN: "Resource forbidden, no permission for this action.",
  NO_TOKEN_PROVIDED: "No token provided.",
  NOT_FOUND: "Requested resource not found.",
  SERVER_ERROR: "Server occured errors.",
  NO_IMAGE_PROVIDED: "Post image is required.",
  USER_UNSPECIFIED: "User is unspecified.",
  DATA_PERSISTENCE_ERROR:
    "Data persistence error, cannot write data to the database.",
  FILE_SIZE_EXCEEDED: "File size exceeded.",
  SAVING_FILE_ERROR: "Saving file error.",
  FILE_TYPE_ERROR: "File type is not acceptable.",
  EMAIL_ADDRESS_OR_USERNAME_EXISTS:
    "Email address or username already registered.",
  USER_PASSWORD_INCORRECT: "Password incorrect.",
  USER_NAME_NOT_FOUND: "Username or email address not found.",
  SOCKET_CONNECTION_FAILED: "Cannot connecte to the server.",
  INFO_NOT_MATCHED: "Provided unmatched information",
  SERVICE_ERROR: {
    ARGUMENTS_INVALID: "Arguments invalid",
    PARAM_NOT_PROVIDED: "Params not provided",
    SERVICE_NOT_AVAILABLE: "Service not available",
    SERVICE_NOT_ACCEPTABLE: "Service not acceptable"
  }
};
const SUCCESS = {
  OK: "success.",
  ACCEPTED: "server accepted the request."
};

const handleError = (res, err, data = null) => {
  let code = 0;
  switch (err.message) {
    case ERROR.SERVICE_ERROR.PARAM_NOT_PROVIDED:
    case ERROR.SERVICE_ERROR.ARGUMENTS_INVALID:
      code = 400; // Bad request
      break;
    case ERROR.UNAUTHORIZED:
    case ERROR.USER_AUTHENTICATION_FAILED:
      code = 401;
      break;
    case ERROR.USER_NAME_NOT_FOUND:
    case ERROR.USER_PASSWORD_INCORRECT:
    case ERROR.EMAIL_ADDRESS_OR_USERNAME_EXISTS:
    case ERROR.INFO_NOT_MATCHED:
      code = 406; // Not acceptable
      break;
    case ERROR.USER_UNSPECIFIED:
      code = 403; // Forbidden
      break;
    case ERROR.SERVER_ERROR:
      code = 500;
      break;
    default:
      code = 500;
      break;
  }
  return res.status(code).json({
    message: err.message ? err.message : err,
    data
  });
};

const handleSuccess = (res, data = null, code = 200) => {
  return res.status(code).json({
    message: SUCCESS.OK,
    data
  });
};

module.exports = {
  ERROR,
  SUCCESS,
  handleError,
  handleSuccess
};
