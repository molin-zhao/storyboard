const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PhaseSchema = new Schema(
  {
    project_id: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true
    },
    name: {
      type: String,
      default: ""
    },
    description: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Phase", PhaseSchema);
