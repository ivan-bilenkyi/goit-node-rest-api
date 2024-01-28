const express = require("express");
const {
  getAllContacts,
  getOneContact,
  deleteContact,
  createContact,
  updateContact,
  updateStatusContact,
} = require("../controllers/contactsControllers.js");

const validateBody = require("../middlewares/validateBody.js");
const {
  createContactSchema,
  updateContactSchema,
  updateFavotireSchema,
} = require("../models/contacts.js");
const isValidId = require("../middlewares/isValidId.js");

const contactsRouter = express.Router();

contactsRouter.get("/", getAllContacts);

contactsRouter.get("/:id", getOneContact);

contactsRouter.delete("/:id", deleteContact);

contactsRouter.post("/", validateBody(createContactSchema), createContact);

contactsRouter.put("/:id", validateBody(updateContactSchema), updateContact);

contactsRouter.patch(
  "/:id/favorite",
  isValidId,
  validateBody(updateFavotireSchema),
  updateStatusContact
);

module.exports = contactsRouter;
