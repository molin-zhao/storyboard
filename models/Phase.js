const mongoose = require("../common/mongodb");
const Schema = mongoose.Schema;
const PhaseSchema = new Schema(
  {
    name: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    groups: {
      type: [{ type: Schema.Types.ObjectId, ref: "Group" }],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Phase", PhaseSchema);
