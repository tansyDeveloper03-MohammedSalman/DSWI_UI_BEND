const Joi = require("joi");
const mongoose = require("mongoose");
const config = require("config");
const jwt = require("jsonwebtoken");
const Validator = require("validator");
const isEmpty = require("./is_empty");

const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 30
  },
  last_name: {
    type: String,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    minlength: 8,
    maxlength: 50,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    maxlength: 100
  },
  country: {
    type: String,
    required: true
  },
  city: {
    type: String,
    maxlength: 100
  },
  date: {
    type: Date,
    default: Date.now
  },
  audit_login: [
    {
      user_id: {
        type: "string"
      },
      login_datetime: {
        type: Date,
        default: Date.now
      },
      logout_datetime: {
        type: Date,
        default: Date.now
      },
      device_type: {
        type: String,
        required: true
      },
      ip_address: {
        type: String
      }
    }
  ]
});

userSchema.methods.generateAuthToken = function() {
  const token = jwt.sign({ _id: this._id }, config.get("jwtPrivateKey"));
  return token;
};

const User = mongoose.model("user", userSchema);

function validateUser(data) {
  let errors = {};

  data.first_name = !isEmpty(data.first_name) ? data.first_name : "";
  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";
  data.country = !isEmpty(data.country) ? data.country : "";

  if (!Validator.isLength(data.first_name, { min: 2, max: 30 })) {
    errors.first_name = "password must be length 2 to 30 characters";
  }

  if (Validator.isEmpty(data.first_name)) {
    errors.first_name = "first_name field is required";
  }

  if (!Validator.isEmail(data.email)) {
    errors.email = "Emails is invalid";
  }

  if (Validator.isEmpty(data.email)) {
    errors.email = "Emails field is required";
  }

  if (!Validator.isLength(data.password, { min: 2, max: 30 })) {
    errors.password = "password must be length 2 to 30 characters";
  }

  if (Validator.isEmpty(data.password)) {
    errors.password = "password field is required";
  }

  if (Validator.isEmpty(data.country)) {
    errors.country = "country field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
}

function validateLogin(data) {
  let errors = {};

  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";

  if (!Validator.isEmail(data.email)) {
    errors.email = "Emails is invalid";
  }

  if (Validator.isEmpty(data.email)) {
    errors.email = "Emails field is required";
  }

  if (!Validator.isLength(data.password, { min: 2, max: 30 })) {
    errors.password = "password must be length 2 to 30 characters";
  }

  if (Validator.isEmpty(data.password)) {
    errors.password = "password field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
}

function validatechangePassword(data) {
  let errors = {};

  data.password = !isEmpty(data.password) ? data.password : "";
  data.password2 = !isEmpty(data.password2) ? data.password2 : "";

  if (!Validator.isLength(data.password, { min: 2, max: 30 })) {
    errors.password = "password must be length 2 to 30 characters";
  }

  if (Validator.isEmpty(data.password)) {
    errors.password = "password field is required";
  }

  if (Validator.isEmpty(data.password2)) {
    errors.password2 = "Confirm Password field is required";
  } else {
    if (!Validator.equals(data.password, data.password2)) {
      errors.password2 = "Passwords must match";
    }
  }
  return {
    errors,
    isValid: isEmpty(errors)
  };
}

function validateforgotPassword(data) {
  let errors = {};

  data.email = !isEmpty(data.email) ? data.email : "";

  if (!Validator.isEmail(data.email)) {
    errors.email = "Emails is invalid";
  }

  if (Validator.isEmpty(data.email)) {
    errors.email = "Emails field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
}

function validateresetpassword(data) {
  let errors = {};
  data._id = !isEmpty(data._id) ? data._id : "";
  data.password = !isEmpty(data.password) ? data.password : "";
  data.password2 = !isEmpty(data.password2) ? data.password2 : "";

  if (!Validator.isLength(data.password, { min: 2, max: 30 })) {
    errors.password = "password must be length 2 to 30 characters";
  }

  if (Validator.isEmpty(data.password)) {
    errors.password = "password field is required";
  }

  if (Validator.isEmpty(data.password2)) {
    errors.password2 = "Confirm Password field is required";
  } else {
    if (!Validator.equals(data.password, data.password2)) {
      errors.password2 = "Passwords must match";
    }
  }
  return {
    errors,
    isValid: isEmpty(errors)
  };
}
exports.userSchema = userSchema;
exports.User = User;
exports.validatechangePassword = validatechangePassword;
exports.validate = validateUser;
exports.validateLogin = validateLogin;
exports.validateforgotPassword = validateforgotPassword;
exports.validateresetpassword = validateresetpassword;
