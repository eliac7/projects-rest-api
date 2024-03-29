const express = require("express");

const router = express.Router();

const SkillsModel = require("../models/skillModel");

const { getSkill } = require("../helpers/helpers");

const cache = require("memory-cache");

//Get all skills
router.get("/", async (req, res) => {
  if (cache.get("skills")) {
    res.status(200).json(cache.get("skills"));
  } else {
    try {
      const skills = await SkillsModel.find();
      cache.put("skills", skills, 10000);
      res.status(200).json(skills);
    } catch (err) {
      res.status(500).json({ errors: err.message });
    }
  }
});
//Get one skill
router.get("/:id", getSkill, async (req, res) => {
  if (cache.get("skill")) {
    res.status(200).json(cache.get("skill" + req.params.id));
  } else {
    try {
      cache.put("skill" + req.params.id, res.skill, 10000);
      res.status(200).json(res.skill);
    } catch (err) {
      res.status(500).json({ errors: err.message });
    }
  }
});

//Post one skill

router.post("/", async (req, res) => {
  const skill = new SkillsModel({
    title: req.body.title,
    technologies: req.body.technologies,
    type: req.body.type,
    className: req.body.className,
    image: req.body.image,
    imageDeleteUrl: req.body.imageDeleteUrl,
    description: req.body.description,
    fixed: req.body.fixed,
    URL: {
      live: req.body.URL.live,
      github: req.body.URL.github,
    },
  });
  try {
    const newSkill = await skill.save();
    res.status(201).json(newSkill);
  } catch (err) {
    res.status(400).json({ errors: err.message });
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
  if (req.body.type != null) {
    res.skill.type = req.body.type;
  }
  if (req.body.className != null) {
    res.skill.className = req.body.className;
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
  if (req.body.image != null) {
    res.skill.image = req.body.image;
  }
  if (req.body.fixed != null) {
    res.skill.fixed = req.body.fixed;
  }
  try {
    const updatedSkill = await res.skill.save();
    res.json(updatedSkill);
  } catch (err) {
    res.status(400).json({ errors: err.message });
  }
});

//Delete one skill

router.delete("/:id", getSkill, async (req, res) => {
  try {
    await res.skill.remove();
    res.json({ message: "Deleted skill" });
  } catch (err) {
    res.status(500).json({ errors: err.message });
  }
});

module.exports = router;
