const express = require("express");
const multer = require("multer");
const router = express.Router();
const upload = multer({ dest: "upload/" });
const { getDFSConnection, fdel } = require("../../utils");
const { SUCCESS, ERROR, handleError } = require("../../response");
const { verifyAuthorization } = require("../../authenticate");
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
      return res.status(200).json({
        message: SUCCESS.OK,
        data: fileId // starts with group{1,2,3...}
      });
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
    return res.status(200).json({
      message: SUCCESS.OK
    });
  } catch (err) {
    return handleError(res, err);
  }
});

module.exports = router;
