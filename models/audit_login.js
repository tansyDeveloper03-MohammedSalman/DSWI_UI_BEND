const Joi = require("joi");
const mongoose = require("mongoose");
const config = require("config");
const jwt = require("jsonwebtoken");

const auditLoginSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true
  },
  login_datetime: {
    type: Date,
    required: true
  },
  logout_datetime: {
    type: Date
  },
  device_type: {
    type: String,
    required: true
  },
  ip_address: {
    type: String,
    required: true
  }
});

auditLoginSchema.methods.generateAuthToken = function() {
  const token = jwt.sign({ _id: this._id }, config.get("jwtPrivateKey"));
  return token;
};

const auditLogin = mongoose.model("audit_login", auditLoginSchema);

function validateAuditLogin(datascience) {
  const schema = {
    user_id: Joi.string()
      .max(30)
      .required(),
    device_type: Joi.string().max(30),
    ip_address: Joi.string()
      .max(50)
      .required()
    // device_type: Joi.string()
  };
  return Joi.validate(datascience, schema);
}

exports.auditLoginSchema = auditLoginSchema;
exports.auditLogin = auditLogin;
exports.auditLoginvalidate = validateAuditLogin;
