const express = require("express");
const multer = require("multer");
const router = express.Router();
const upload = multer({ dest: "upload/" });
const { getDFSConnection, fdel } = require("../../common/utils");
const { ERROR, handleError, handleSuccess } = require("../../common/response");
const User = require("../../models/User");

// init fdfs client
const fdfs = getDFSConnection();

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) throw new Error(ERROR.SERVICE_ERROR.PARAM_NOT_PROVIDED);
    let fileId = await fdfs.upload(req.file.path);
    fdel(req.file.path);
    return handleSuccess(res, fileId);
  } catch (err) {
    return handleError(res, err);
  }
});

router.delete("/", async (req, res) => {
  try {
    let fileId = req.query.id.trim();
    if (!fileId) throw new Error(ERROR.SERVICE_ERROR.PARAM_NOT_PROVIDED);
    console.log(fileId);
    await fdfs.del(fileId);
    return handleSuccess(res, "ok");
  } catch (err) {
    return handleError(res, err);
  }
});

/**
 * upload user avatar
 */
router.post("/avatar", upload.single("file"), async (req, res) => {
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
});

module.exports = router;
