const express = require("express");

const router = express.Router();

const SkillsModel = require("../models/skillModel");

//Get all skills
router.get("/", async (req, res) => {
  try {
    const skills = await SkillsModel.find();
    res.json(skills);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

//Post one skill

router.post("/", async (req, res) => {
  const skill = new SkillsModel({
    title: req.body.title,
    technologies: req.body.technologies,
    description: req.body.description,
    URL: {
      live: req.body.URL.live,
      github: req.body.URL.github,
    },
  });
  try {
    const newSkill = await skill.save();
    res.status(201).json(newSkill);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
});

//Update one skill

router.patch("/:id", getSkill, async (req, res) => {
  if (req.body.title != null) {
    res.skill.title = req.body.title;
  }
  if (req.body.technologies != null) {
    res.skill.technologies = req.body.technologies;
  }
  if (req.body.description != null) {
    res.skill.description = req.body.description;
  }

  if (req.body.URL.live != null) {
    res.skill.URL.live = req.body.URL.live;
  }
  if (req.body.URL.github != null) {
    res.skill.URL.github = req.body.URL.github;
  }
  try {
    const updatedSkill = await res.skill.save();
    res.json(updatedSkill);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//Delete one skill

router.delete("/:id", getSkill, async (req, res) => {
  try {
    await res.skill.remove();
    res.json({ message: "Deleted skill" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

//Middleware to find the required skill 

async function getSkill(req, res, next) {
  let skill;
  try {
    skill = await SkillsModel.findById(req.params.id);
    if (skill == null) {
      return res.status(404).json({ message: "Cannot find skill" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.skill = skill;
  next();
}

module.exports = router;
