const mongoose = require("../common/mongodb");
const Schema = mongoose.Schema;
const { objectId } = require("../common/utils");

const MessageSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["chat", "notification", "request"],
      default: "chat",
    },
    meta: {
      type: String,
      default: "",
    },
    content: {
      type: String,
      default: "",
    },
    from: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    to: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

MessageSchema.statics.createMessage = function (message) {
  const { type, meta, content, from, to } = message;
  return this.create({
    type,
    meta,
    content,
    from: objectId(from._id),
    to: objectId(to._id),
  });
};

MessageSchema.statics.fetchMessages = function (userId) {
  return new Promise(async (resolve, reject) => {
    try {
      let id = objectId(userId);
      const resp = await this.find({ to: id })
        .populate({
          path: "from",
          select: "_id username avatar gender",
          model: "User",
        })
        .populate({
          path: "to",
          select: "_id username avatar gender",
          model: "User",
        });
      if (!resp || resp.constructor !== Array) return resolve([]);
      return resolve(resp);
    } catch (err) {
      return reject(err);
    }
  });
};

module.exports = mongoose.model("Message", MessageSchema);
