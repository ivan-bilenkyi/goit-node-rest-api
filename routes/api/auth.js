const express = require("express");

const { validateBody, authenticate } = require("../../middlewares");
const { schemas } = require("../../models/user");
const {
  register,
  login,
  getCurrent,
  logout,
  updateSubscription,
} = require("../../controllers/auth");

const router = express.Router();

router.post("/register", validateBody(schemas.registerSchema), register);
router.post("/login", validateBody(schemas.loginSchema), login);
router.get("/current", authenticate, getCurrent);
router.get("/logout", authenticate, logout);
router.patch(
  "/users",
  authenticate,
  validateBody(schemas.updateSubscriptionSchema),
  updateSubscription
);

module.exports = router;
