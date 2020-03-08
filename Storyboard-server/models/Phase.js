const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PhaseSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    group: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "Group"
        }
      ]
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Phase", PhaseSchema);
