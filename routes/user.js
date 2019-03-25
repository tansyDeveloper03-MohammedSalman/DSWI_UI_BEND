const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const config = require("config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const express = require("express");
const router = express.Router();
const {
  User,
  validateUser,
  validate,
  validateLogin,
  validatechangePassword,
  validateforgotPassword,
  validateresetpassword
} = require("../models/user");
const { auditLogin, auditLoginvalidate } = require("../models/audit_login");
const { Email } = require("../routes/email/email");
const ip = require("ip");
const device = require("express-device");
router.use(device.capture());

router.post("/signup", async (req, res) => {
  // const errors = validate(req.body);
  const { errors, isValid } = validate(req.body);
  if (!isValid) {
    return res.status(400).send(errors);
  }
  console.log(errors);
  let users = await User.findOne({ email: req.body.email });
  if (users) return res.status(400).send({ msg: "This email was used" });

  let user = new User(
    _.pick(req.body, [
      "first_name",
      "last_name",
      "email",
      "password",
      "country",
      "city"
    ])
  );

  // save the post data
  user = await user.save();
  const payload = {
    _id: user._id,
    first_name: user.first_name,
    last_name: user.last_name
  };
  // jwt

  const token = user.generateAuthToken();
  res.header("x-auth-token", token).send({ token, payload });
});

router.post("/login", async (req, res) => {
  const { errors, isValid } = validateLogin(req.body);

  if (!isValid) {
    return res.status(400).send(errors);
  }

  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Invalid email");
  // console.log(user);
  const validPassword = req.body.password === user.password;

  if (!validPassword) return res.status(400).send("Invalid email and password");

  const payload = {
    _id: user._id,
    first_name: user.first_name,
    last_name: user.last_name
  };
  // audit_login insert
  auditLogin
    .create({
      user_id: user._id,
      login_datetime: Date(),
      device_type: req.device.type,
      ip_address: ip.address()
    })
    .then(profile => {
      profile
        .save()
        .then(() => console.log("insert"))
        .catch(err => console.error("insert error"));
    })
    .catch(err => console.log(err));
  const token = user.generateAuthToken();

  res.send({ token, payload });
});

router.post("/changepassword", auth, async (req, res) => {
  const { errors, isValid } = validatechangePassword(req.body);
  if (!isValid) {
    return res.status(400).send(errors);
  }

  let users = await User.findOne({ _id: req.user._id });

  if (!users)
    return res.status(400).send("The user with the given ID was not found.");

  // const validPassword = req.body.password === users.password;
  // if (validPassword) return res.status(400).send("Using same password");

  let user = await User.findByIdAndUpdate(req.user._id, {
    password: req.body.password
  })
    .then(() => console.log("updated"))
    .catch(err => console.error("update error"));
  let updatedUser = await User.findOne({ _id: req.user._id });

  res.status(200).send(updatedUser);
});

router.post("/forgotpassword", async (req, res) => {
  const { errors, isValid } = validateforgotPassword(req.body);
  // if (error) return res.status(400).send(error.details[0].message);

  if (!isValid) {
    return res.status(400).send(errors);
  }

  let users = await User.findOne({ email: req.body.email });
  if (!users)
    return res.status(400).send({ msg: "The given email was not found." });

  if (users) {
    Email(users);
    res.status(400).send({ msg: "The mail was send" });
  }
});

router.post("/resetPassword", async (req, res) => {
  const { errors, isValid } = validateresetpassword(req.body);
  // if (error) return res.status(400).send(error.details[0].message);

  if (!isValid) {
    return res.status(400).send(errors);
  }
  let users = await User.findOne({ _id: req.body.id });

  if (!users)
    return res.status(400).send({ msg: "The given email was not found." });
  const validPassword = req.body.password === users.password;
  if (validPassword)
    return res.status(400).send({ msg: "Using same password" });

  // //   console.log(req.user.email);
  let user = await User.findByIdAndUpdate(users._id, {
    password: req.body.password
  })
    .then(() => console.log("updated"))
    .catch(err => console.error("update error"));
  let updatedUser = await User.findOne({ email: req.body.email });
  return res.status(400).send({ msg: "The change password was done" });
});

/* GET LOGOUT */
router.get("/logout", function(req, res) {
  // req.session.destroy();
  console.log(req.session);
  res.send("logout success!");
});

router.get("/get", async (req, res) => {
  const customers = await User.find();
  res.send(customers);
});

module.exports = router;
