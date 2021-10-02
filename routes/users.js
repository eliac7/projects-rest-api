const express = require("express");

const router = express.Router();

const bcrypt = require("bcrypt");

const UsersModel = require("../models/userModel");

const {
  generateAccessToken,
  verifyJWT,
  validateRegistration,
  getUser,
  generateRefreshToken,
} = require("../helpers/helpers");

let refreshTokens = [];

//Get all users

router.get("/", verifyJWT, async (req, res) => {
  if (req.user.isAdmin) {
    try {
      const users = await UsersModel.find({}, { password: 0 });

      if (users && users.length !== 0) {
        return res.status(200).json({ data: users });
      } else {
        return res.status(404).json({ errors: "No users found" });
      }
    } catch (err) {
      res.status(500).json({ errors: err.message });
    }
  } else {
    res
      .status(401)
      .json({ errors: { authorize: "You are not authenticated." } });
  }
});

//Register one user (private route)

router.post("/register", verifyJWT, validateRegistration, async (req, res) => {
  const { errors, isValid, user } = req;

  //bailing out early

  if (!user.isAdmin) {
    return res
      .status(401)
      .json({ errors: { authorize: "You are not an admin." } });
  }

  const {
    username,
    password: plainPassword,
    email,
    fullName,
    isAdmin,
  } = req.body;
  const password = await bcrypt.hash(plainPassword, 10);

  if (!isValid) {
    return res.status(400).json({
      errors,
    });
  }

  try {
    await UsersModel.create({
      username,
      password,
      email,
      fullName,
      isAdmin,
    });
    return res.status(201).json({ msg: "ok" });
  } catch (error) {
    if (error.code === 11000) {
      if (error.keyPattern.username) {
        return res.status(409).json({
          errors: "Username has already been taken.",
        });
      } else {
        return res.status(409).json({
          errors: "Email has already been taken.",
        });
      }
    }

    throw error;
  }
});

//Login

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await UsersModel.findOne({ username });

  if (user && (await bcrypt.compare(password, user.password))) {
    //Generate an access token
    const accessToken = generateAccessToken(user);
    const RefreshToken = generateRefreshToken(user);
    refreshTokens.push(RefreshToken);
    res.json({
      data: {
        id: user._id,
        username: user.username,
        isAdmin: user.isAdmin,
        accessToken,
        RefreshToken,
      },
      msg: "ok",
    });
  } else {
    res.status(400).json({
      msg: "Username or password incorrect.",
    });
  }
});

//Logout

router.post("/logout", verifyJWT, (req, res) => {
  const refreshToken = req.body.token;
  refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
  res.status(200).json({ msg: "You logged out successfully." });
});

//Change password

router.post("/change-password", verifyJWT, async (req, res) => {
  const id = req.user.id;

  const plainPassword = req.body.password.toString();

  const hashPassword = await (await bcrypt.hash(plainPassword, 10)).toString();

  let errors = {};

  //Early bailing out
  if (!id) {
    return res
      .status(401)
      .json({ errors: { authorize: "You are not authenticated." } });
  }
  if (!plainPassword) {
    return res
      .status(401)
      .json({ errors: { password: "Password can not be blank." } });
  }
  try {
    if (
      !validator.isLength(plainPassword, {
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

    if (Object.entries(errors).length === 0) {
      await UsersModel.findByIdAndUpdate(
        { _id: id },
        { password: hashPassword },
        function (err, result) {
          if (err) {
            res.status(400).json({ errors: err });
          } else {
            res.status(200).json({ msg: "Updated successfully" });
          }
        }
      );
    } else {
      res.status(400).json({
        errors,
      });
    }
  } catch (err) {
    res.status(500).json({ errors: "An error occured." });
  }
});

//Delete a user

router.delete("/delete/:id", verifyJWT, getUser, async (req, res) => {
  //Only admins can remove accounts
  if (req.user.isAdmin) {
    try {
      await res.user.remove();
      res.json({ message: "User deleted" });
    } catch (err) {
      res.status(500).json({ errors: err.message });
    }
  } else {
    res
      .status(401)
      .json({ errors: { authorize: "You are not authenticated." } });
  }
});

//Update a user

router.patch("/update/:id", verifyJWT, getUser, async (req, res) => {
  const validator = require("validator");

  const { username, password, email, fullName, isAdmin } = req.body;
  let errors = {};

  if (username != null) {
    res.user.username = username;
  }

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

  if (password != null && !errors.password) {
    res.user.password = await bcrypt.hash(password, 10);
  }
  if (email != null && !errors.email) {
    res.user.email = email;
  }
  if (fullName != null && !errors.fullName) {
    res.user.fullName = fullName;
  }
  if (isAdmin != null && !errors.isAdmin) {
    res.user.isAdmin = isAdmin;
  }

  //Bail out if errors
  if (!Object.entries(errors).length === 0) {
    return res.status(401).json({ errors });
  }

  // Only admins can update accounts
  if (req.user.isAdmin) {
    try {
      await res.user.save();
      res.status(200).json({ msg: "User updated" });
    } catch (err) {
      res.status(500).json({ errors: err.message });
    }
  } else {
    res
      .status(401)
      .json({ errors: { authorize: "You are not authenticated." } });
  }
});

module.exports = router;
