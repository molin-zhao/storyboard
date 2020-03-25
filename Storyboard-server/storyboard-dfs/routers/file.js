const express = require("express");
const multer = require("multer");
const router = express.Router();
const upload = multer({ dest: "upload/" });
const { ERROR, handleError, handleSuccess } = require("../../response");
const { verifyAuthorization } = require("../../authenticate");
router.post("/xlsx/read", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) throw new Error(ERROR.SERVICE_ERROR.PARAM_NOT_PROVIDED);
    return handleSuccess(res);
  } catch (err) {
    return handleError(res, err);
  }
});

router.get("/xlsx/write", async (req, res) => {});

module.exports = router;
