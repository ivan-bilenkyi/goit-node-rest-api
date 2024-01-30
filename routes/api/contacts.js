const express = require("express");
const {
  getAllContacts,
  getOneContact,
  deleteContact,
  createContact,
  updateContact,
  updateStatusContact,
} = require("../../controllers/contactsControllers.js");

const { validateBody, isValidId } = require("../../middlewares");
const { schemas } = require("../../models/contacts.js");

const contactsRouter = express.Router();

contactsRouter.get("/", getAllContacts);

contactsRouter.get("/:id", getOneContact);

contactsRouter.delete("/:id", deleteContact);

contactsRouter.post("/", schemas.createContactSchema, createContact);

contactsRouter.put("/:id", schemas.updateContactSchema, updateContact);

contactsRouter.patch(
  "/:id/favorite",
  isValidId,
  schemas.updateFavotireSchema,
  updateStatusContact
);

module.exports = contactsRouter;
