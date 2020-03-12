const express = require("express");
const multer = require("multer");
const router = express.Router();
const upload = multer({ dest: "upload/" });
const { getDFSConnection, fdel } = require("../../utils");
const { SUCCESS, ERROR, handleError } = require("../../response");
const { verifyAuthorization } = require("../../authenticate");

router.post(
  "/upload",
  verifyAuthorization,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) throw new Error(ERROR.SERVICE_ERROR.PARAM_NOT_PROVIDED);
      let fdfs = getDFSConnection();
      let fileId = await fdfs.upload(req.file.path);
      fdel(req.file.path);
      return res.status(200).json({
        message: SUCCESS.OK,
        data: fileId // starts with group{1,2,3...}
      });
    } catch (err) {
      return handleError(res, err);
    } finally {
      fdfs = null;
    }
  }
);

router.delete("/delete", verifyAuthorization, async (req, res) => {
  try {
    let fileId = req.query.id;
    if (!fileId) throw new Error(ERROR.SERVICE_ERROR.PARAM_NOT_PROVIDED);
    let fdfs = getDFSConnection();
    await fdfs.del(fileId);
    return res.status(200).json({
      message: SUCCESS.OK
    });
  } catch (err) {
    return handleError(res, err);
  } finally {
    fdfs = null;
  }
});

module.exports = router;
