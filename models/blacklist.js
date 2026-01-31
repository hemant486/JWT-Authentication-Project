const mongoose = require("mongoose");

const blacklistSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    blacklistedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

const Blacklist = mongoose.model("Blacklist", blacklistSchema);

module.exports = Blacklist;
