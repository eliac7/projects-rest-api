const express = require("express");

const mongoose = require("mongoose");

const app = express();

const cors = require("cors");

require("dotenv").config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const SkillsRouter = require("./routes/skills");
const UsersRouter = require("./routes/users");

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", (err) => console.error(err));
db.once("open", () => console.log("Connected to dabatase."));

app.use("/api/skills/", SkillsRouter);
app.use("/api/users/", UsersRouter);
app.use("/api/", (req, res) => {
  res.status(301).json({ msg: "Nothing to see here." });
});
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
