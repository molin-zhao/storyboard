const express = require("express");
const router = express.Router();
const { verifyAuthorization, verifyUser } = require("../../authenticate");
const { handleError, handleSuccess } = require("../../response");
const Warehouse = require("../../models/Warehouse");

router.get("/:user", verifyAuthorization, verifyUser, async (req, res) => {
  try {
    let reqId = req.params.user;
    const userWarehouse = await Warehouse.fetchUserWarehouse(reqId);
    return handleSuccess(res, userWarehouse);
  } catch (err) {
    return handleError(res, err);
  }
});

router.post("/create", verifyAuthorization, verifyUser, async (req, res) => {
  try {
    let user = req.body.user;
    let name = req.body.name;
    let members = req.body.members;
    let description = req.body.description;
    let fields = req.body.fields;
    let newWarehouse = new Warehouse({
      creator: user,
      name,
      members,
      description,
      fields,
    });
    let warehouseDoc = await newWarehouse.save();
    const warehouse = await warehouseDoc
      .populate({
        path: "members",
        select: "_id username avatar gender",
        model: "User",
      })
      .populate({
        path: "creator",
        select: "_id username avatar gender",
        model: "User",
      })
      .execPopulate();
    return handleSuccess(res, warehouse);
  } catch (err) {
    return handleError(res, err);
  }
});

module.exports = router;
