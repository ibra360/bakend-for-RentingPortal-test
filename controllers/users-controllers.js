// const uuid = require('uuid/v4');
const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const User = require("../models/user");


const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (err) {
    return next(new HttpError("Fetching users failed", 422));
  }
  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError("Error in input validation", 422));
  }
  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    return next(new HttpError("Signing up failed in finding", 422));
  }

  if (existingUser) {
    return next(new HttpError("User exist already,please login instead", 422));
  }

  const createdUser = new User({
    name,
    email,
    password,
    image: "https://wallpapercave.com/wp/wp2969595.jpg",
    places: [],
  });
  try {
    await createdUser.save();
  } catch (err) {
    return next(new HttpError("Creating User Failed in saving,", 500));
  }
  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    return next(new HttpError("Signing In failed in finding", 422));
  }

  if (!existingUser || existingUser.password !== password) {
    return next(
      new HttpError("Invalid credentials ,please enter correct values", 422)
    );
  }
  res.json({
    message: "logged In",
  });
};

exports.getUsers = getUsers;
exports.login = login;
exports.signup = signup;
