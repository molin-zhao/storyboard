const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProjectSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    phase: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "Phase"
        }
      ]
    },
    owner: {
      type: Schema.Types.ObjectId,
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Project", ProjectSchema);
