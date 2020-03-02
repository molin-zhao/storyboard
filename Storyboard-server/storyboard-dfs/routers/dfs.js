const express = require("express");
const multer = require("multer");
const router = express.Router();
const upload = multer({ dest: "upload/" });
const { getDFSConnection } = require("../../utils");
const { SUCCESS } = require("../../response");

router.post("/upload", upload.single("file"), async (req, res) => {
  let fdfs = getDFSConnection();
  try {
    let fileId = await fdfs.upload(req.file.path);
    return res.status(200).json({
      message: SUCCESS.OK,
      data: fileId
    });
  } catch (err) {
    throw new Error(err);
  } finally {
    fdfs = null;
  }
});

router.delete("/delete", async (req, res) => {
  let fdfs = getDFSConnection();
  let fileId = req.query.id;
  try {
    await fdfs.del(fileId);
    return res.status(200).json({
      message: SUCCESS.OK
    });
  } catch (err) {
    throw new Error(err);
  } finally {
    fdfs = null;
  }
});

module.exports = router;
