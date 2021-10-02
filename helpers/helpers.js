//////////////////////////////////////////////
////////////////////SKILLS////////////////////
/////////////////////////////////////////////

const SkillsModel = require("../models/skillModel");
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

//////////////////////////////////////////////
////////////////////USERS/////////////////////
/////////////////////////////////////////////

const validator = require("validator");

const jwt = require("jsonwebtoken");

const UsersModel = require("../models/userModel");

require("dotenv").config();

const JWT_TOKEN = process.env.JWT_SECRET_KEY;
const JWT_REFRESH_TOKEN = process.env.JWT_REFRESH_SECRET_KEY;

const isEmpty = (value) => {
  return (
    value === undefined ||
    value === null ||
    (typeof value === "object" && Object.keys(value).length === 0) ||
    (typeof value === "string" && value.trim().length === 0)
  );
};

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username, isAdmin: user.isAdmin },
    JWT_TOKEN,
    {
      expiresIn: "15m",
    }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      username: user.username,
      isAdmin: user.isAdmin,
    },
    JWT_REFRESH_TOKEN
  );
};

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, JWT_TOKEN, (err, user) => {
      if (err) {
        return res
          .status(403)
          .json({ errors: { authorize: "Token is not valid." } });
      }
      req.user = user;
      next();
    });
  } else {
    res
      .status(401)
      .json({ errors: { authorize: "You are not authenticated." } });
  }
};

const validateRegistration = (req, res, next) => {
  let { username, password, email, fullName, isAdmin } = req.body;
  let errors = {};

  username = !validator.isEmpty(username) ? username : "";
  password = !validator.isEmpty(password) ? password : "";

  if (
    !validator.isLength(username, {
      min: 2,
      max: 30,
    })
  ) {
    errors.username = "Username should be between 2 and 30 characters";
  }
  if (validator.isEmpty(username)) {
    errors.username = "Username is required";
  }

  if (validator.isEmpty(fullName)) {
    errors.password = "Full Name is required";
  }

  if (!validator.isEmail(email)) {
    errors.email = "Please enter a valid email address";
  }
  if (validator.isEmpty(password)) {
    errors.password = "Password can not be empty";
  }
  if (
    !validator.isLength(password, {
      min: 6,
      max: 30,
    })
  ) {
    if (errors.password) {
      errors.password += " and should be at least 6 characters";
    } else {
      errors.password = "Password should be at least 6 characters";
    }
  }
  if (!validator.isBoolean(isAdmin)) {
    errors.isAdmin = "isAdmin should be boolean.";
  }

  (req.errors = errors), (req.isValid = isEmpty(errors)), next();
};

const getUser = async (req, res, next) => {
  let user;
  try {
    user = await UsersModel.findById(req.params.id);
    if (user == null) {
      return res.status(404).json({ errors: "Cannot find user" });
    }
  } catch (err) {
    return res.status(500).json({ errors: err.message });
  }

  res.user = user;
  next();
};

module.exports = {
  isEmpty,
  generateAccessToken,
  generateRefreshToken,
  verifyJWT,
  validateRegistration,
  getUser,
  getSkill,
};
