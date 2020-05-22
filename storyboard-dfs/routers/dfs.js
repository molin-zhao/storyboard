const express = require("express");
const multer = require("multer");
const router = express.Router();
const upload = multer({ dest: "upload/" });
const { getDFSConnection, fdel } = require("../../utils");
const { ERROR, handleError, handleSuccess } = require("../../response");
const { verifyAuthorization } = require("../../authenticate");
const User = require("../../models/User");

// init fdfs client
const fdfs = getDFSConnection();

router.post(
  "/upload",
  verifyAuthorization,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) throw new Error(ERROR.SERVICE_ERROR.PARAM_NOT_PROVIDED);
      let fileId = await fdfs.upload(req.file.path);
      fdel(req.file.path);
      return handleSuccess(res, fileId);
    } catch (err) {
      return handleError(res, err);
    }
  }
);

router.delete("/delete", verifyAuthorization, async (req, res) => {
  try {
    let fileId = req.query.id;
    if (!fileId) throw new Error(ERROR.SERVICE_ERROR.PARAM_NOT_PROVIDED);
    await fdfs.del(fileId);
    return handleSuccess(res, "ok");
  } catch (err) {
    return handleError(res, err);
  }
});

/**
 * upload user avatar
 */
router.post(
  "/upload/avatar",
  verifyAuthorization,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) throw new Error(ERROR.SERVICE_ERROR.PARAM_NOT_PROVIDED);
      const userId = req.user._id;
      const fileId = await fdfs.upload(req.file.path);
      fdel(req.file.path);
      const user = await User.findByIdAndUpdate(
        { _id: userId },
        { $set: { avatar: fileId } }
      ).select("avatar");
      if (!user) {
        await fdfs.del(fileId);
        throw new Error(ERROR.SAVING_FILE_ERROR);
      }
      return handleSuccess(res, fileId);
    } catch (err) {
      return handleError(res, err);
    }
  }
);

/**
 * delete user avatar
 */
router.post("/delete/avatar", verifyAuthorization, async (req, res) => {
  try {
    const userId = req.user._id;
    const fileId = req.body.fileId;
    const replacement = req.body.replacement;
    await fdfs.del(fileId);
    const user = await User.findOneAndUpdate(
      { _id: userId },
      { $set: { avatar: replacement } }
    ).select("avatar");
    if (!user) throw new Error(ERROR.SERVER_ERROR);
    return handleSuccess(res, user.avatar);
  } catch (err) {
    return handleError(res, err);
  }
});
module.exports = router;
