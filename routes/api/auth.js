const express = require("express");

const { validateBody, authenticate, upload } = require("../../middlewares");
const { schemas } = require("../../models/user");
const {
  register,
  verifyEmail,
  recentVerifyEmail,
  login,
  getCurrent,
  logout,
  updateSubscription,
  updateAvatar,
} = require("../../controllers/auth");

const router = express.Router();

router.post("/register", validateBody(schemas.registerSchema), register);

router.get("/users/verify/:verificationToken", verifyEmail);
router.post(
  "/users/verify",
  validateBody(schemas.emailSchema),
  recentVerifyEmail
);

router.post("/login", validateBody(schemas.loginSchema), login);
router.get("/current", authenticate, getCurrent);
router.get("/logout", authenticate, logout);

router.patch(
  "/users",
  authenticate,
  validateBody(schemas.updateSubscriptionSchema),
  updateSubscription
);
router.patch(
  "/users/avatars",
  authenticate,
  upload.single("avatar"),
  updateAvatar
);

module.exports = router;
