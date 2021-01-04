const path = require("path");
const fs = require("fs");
const Joi = require("joi");

const schema = Joi.object({
  port: Joi.number().required(),
  serveDirectory: Joi.string().required(),
  title: Joi.string().required(),
  truncateNamesAt: Joi.number().required().min(1),
});

module.exports = (configPath, cb) => {
  fs.readFile(path.join(__dirname, configPath), "utf-8", (err, res) => {
    if (err) return cb(err);

    const config = JSON.parse(res);

    const validated = schema.validate(config, { allowUnknown: true });

    if (typeof validated.error !== "undefined") {
      return cb(validated.error);
    }

    return cb(null, validated.value);
  });
};
