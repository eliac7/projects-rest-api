const mongoose = require("mongoose");
require("mongoose-type-url");

const Schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  technologies: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  className: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: mongoose.SchemaTypes.Url,
  },
  imageDeleteUrl: {
    type: String,
  },
  fixed: {
    type: Boolean,
    default: false,
  },
  URL: {
    live: { type: mongoose.SchemaTypes.Url },
    github: { type: mongoose.SchemaTypes.Url },
  },
});

module.exports = mongoose.model("Skill", Schema);
