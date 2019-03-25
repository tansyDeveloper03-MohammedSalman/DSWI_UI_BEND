const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const config = require("config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const express = require("express");
const router = express.Router();
const { User } = require("../models/user");
const {
  Profile,
  validateProfile,
  validateExperienceInput,
  validateEducationInput
} = require("../models/profile");

// @route         GET api/profile/test
// @description   Get profile route
// @access        private
router.get("/", auth, async (req, res) => {
  const errors = {};

  Profile.findOne({ user: req.user.id })
    .populate("user", ["name"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user";
        return res.status(404).json(errors.noprofile);
      }
      res.json(profile);
    })
    .catch(err => res.status(404).json(err));
});

// @route         GET api/profile/all
// @description   Get Profile By all
// @access        public
router.get("/all", (req, res) => {
  const errors = {};

  Profile.find()
    .populate("user", ["name", "avatar"])
    .then(profiles => {
      if (!profiles) {
        errors.nohandle = "There are no profiles";
        res.status(404).json(errors);
      }
      res.status(200).json(profiles);
    })
    .catch(err => res.status(404).json("There are no profiles"));
});

// @route         GET api/profile/handle/:handle
// @description   Get Profile By Handle
// @access        public
router.get("/handle/:handle", (req, res) => {
  const errors = {};

  Profile.findOne({ handle: req.params.handle })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user";
        res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => res.status(404).json(err));
});

// @route         GET api/profile/users/:user_id
// @description   Get Profile By user
// @access        public
router.get("/user/:user_id", (req, res) => {
  const errors = {};

  Profile.findOne({ user: req.params.user_id })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user";
        res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err =>
      res.status(404).json({ profile: "There is no profile for this user" })
    );
});
// @route         POST api/profile
// @description   Create or edit profile route
// @access        private
router.post("/", auth, (req, res) => {
  const { errors, isValid } = validateProfile(req.body);

  // check validation
  if (!isValid) {
    // Return any errors with 400 status
    res.status(400).json(errors);
  }

  const profileFields = {};
  profileFields.user = req.user.id;
  if (req.body.handle) profileFields.handle = req.body.handle;
  if (req.body.company) profileFields.company = req.body.company;
  if (req.body.website) profileFields.website = req.body.website;
  if (req.body.location) profileFields.location = req.body.location;
  if (req.body.bio) profileFields.bio = req.body.bio;
  if (req.body.status) profileFields.status = req.body.status;
  if (req.body.githubusername)
    profileFields.githubusername = req.body.githubusername;

  // skills - split into array
  if (typeof req.body.skills !== undefined) {
    profileFields.skills = req.body.skills.split(",");
  }

  // social
  profileFields.social = {};
  if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
  if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
  if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
  if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
  if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

  Profile.findOne({ user: req.user.id }).then(profile => {
    console.log(profile);
    if (profile) {
      // update
      Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true }
      ).then(profile => res.json(profile));
    } else {
      // create
      // check if handle exists
      Profile.findOne({ handle: profileFields.handle }).then(profile => {
        if (profile) {
          errors.handle = "That handle already exists";
          res.status(400).json(errors);
        }

        //
        new Profile(profileFields).save().then(profile => res.json(profile));
      });
    }
  });
});

router.post("/experience", auth, (req, res) => {
  const { errors, isValid } = validateExperienceInput(req.body);

  // check validation
  if (!isValid) {
    // Return any errors with 400 status
    res.status(400).json(errors);
  }

  Profile.findOne({ user: req.user.id }).then(profile => {
    const newExp = {
      title: req.body.title,
      company: req.body.company,
      location: req.body.location,
      from: req.body.from,
      to: req.body.to,
      current: req.body.current,
      description: req.body.description
    };

    // Add to exp array
    profile.experience.unshift(newExp);

    profile.save().then(profile => res.json(profile));
  });
});

router.post("/education", auth, (req, res) => {
  const { errors, isValid } = validateEducationInput(req.body);

  // check validation
  if (!isValid) {
    // Return any errors with 400 status
    res.status(400).json(errors);
  }
  Profile.findOne({ user: req.user.id }).then(profile => {
    const newEdu = {
      school: req.body.school,
      degree: req.body.degree,
      fieldofstudy: req.body.fieldofstudy,
      from: req.body.from,
      to: req.body.to,
      current: req.body.current,
      description: req.body.description
    };

    // Add to exp array
    profile.education.unshift(newEdu);

    profile.save().then(profile => res.json(profile));
  });
});

// @route         DELETE api/profile/experience/:exp_id
// @description   delete education to profile route
// @access        private
router.delete("/experience/:exp_id", auth, (req, res) => {
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      // get remove index
      const removeIndex = profile.experience
        .map(item => item.id)
        .indexOf(req.params.exp_id);
      console.log(profile.experience);
      // Splice out of an array
      profile.experience.splice(removeIndex, 1);

      // save
      profile.save().then(profile => res.json(profile));
    })
    .catch(err => res.status(404).json(err));
});

// @route         DELETE api/profile/education/:edu_id
// @description   delete education to profile route
// @access        private
router.delete("/education/:edu_id", auth, (req, res) => {
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      const removeIndex = profile.education
        .map(item => item.id)
        .indexOf(req.params.edu_id);

      // splice out of an array
      profile.education.splice(removeIndex, 1);

      // save
      profile.save().then(res.json(profile));
    })
    .catch(err => res.status(404).json(err));
});

// @route         DELETE api/profile
// @description   delete user and profile
// @access        private
router.delete("/", auth, (req, res) => {
  Profile.findOneAndRemove({ user: req.user._id }).then(() => {
    User.findOneAndRemove({ _id: req.user._id }).then(() => {
      res.json({ success: true });
    });
  });
});

module.exports = router;
