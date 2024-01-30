const Joi = require("joi");
const { Schema, model } = require("mongoose");
const { handleMongooseError } = require("../helpers");
const { validateBody } = require("../middlewares");

const contactSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Set name for contact"],
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    favorite: {
      type: Boolean,
      default: false,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

contactSchema.post("save", handleMongooseError);

const createContactSchema = Joi.object({
  name: Joi.string().alphanum().min(3).max(30).required(),

  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net"] },
    })
    .required(),

  phone: Joi.string().required(),
});

const updateContactSchema = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().optional(),
  favorite: Joi.boolean(),
});

const updateFavotireSchema = Joi.object({
  favorite: Joi.boolean().required(),
});

const schemas = {
  createContactSchema: validateBody(createContactSchema),
  updateContactSchema: validateBody(updateContactSchema),
  updateFavotireSchema: validateBody(updateFavotireSchema),
};

const Contact = model("contact", contactSchema);

module.exports = {
  Contact,
  schemas,
};
