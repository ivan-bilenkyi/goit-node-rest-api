const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const Jimp = require("jimp");
const gravatar = require("gravatar");
const { v4 } = require("uuid");
const { sendEmail } = require("../helpers");

const { SECRET_KEY, BASE_URL } = process.env;

const { HttpError, controllerWrapper } = require("../helpers");
const { User } = require("../models/user");

const avatarsDir = path.join(__dirname, "../", "public", "avatars");

const register = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  const verificationToken = v4();

  if (user) {
    throw HttpError(409, "Email in use");
  }

  const hachPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email);

  const newUser = await User.create({
    ...req.body,
    password: hachPassword,
    avatarURL,
    verificationToken: verificationToken,
  });

  const verifyEmail = {
    to: email,
    subject: "Verification email",
    html: `<a href="${BASE_URL}/api/auth/users/verify/${verificationToken}"
        target="_blank ">
        Click for verification
      </a>`,
  };

  await sendEmail(verifyEmail);

  res.status(201).json({
    email: newUser.email,
    subscription: newUser.subscription,
  });
};

const verifyEmail = async (req, res) => {
  const { verificationToken } = req.params;
  const user = await User.findOne({ verificationToken });

  if (!user) {
    throw HttpError(404);
  }

  await User.findByIdAndUpdate(user._id, {
    verify: true,
    verificationToken: null,
  });

  res.json({
    message: "Verification successful",
  });
};

const recentVerifyEmail = async (req, res) => {
  const { email } = req.body;
  console.log(email);
  const user = await User.findOne({ email });
  console.log(user);
  if (!user) {
    throw HttpError(400);
  }

  if (user.verify) {
    throw HttpError(400, "Verification has already been passed");
  }

  const verifyEmail = {
    to: email,
    subject: "Verification email sent",
    html: `<a href="${BASE_URL}/api/auth/users/verify/${user.verificationToken}"
        target="_blank ">
        Click for verification
      </a>`,
  };

  await sendEmail(verifyEmail);

  res.json({
    message: "Verification email sent",
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw HttpError(401, "Email or password is wrong");
  }

  if (!user.verify) {
    throw HttpError(401, "Email not verified");
  }

  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw HttpError(401, "Email or password is wrong");
  }

  const payload = {
    id: user._id,
  };

  const token = jwt.sign(payload, SECRET_KEY, {
    expiresIn: "12h",
  });
  await User.findByIdAndUpdate(user._id, { token });

  res.json({
    token,
  });
};

const getCurrent = async (req, res) => {
  const { email, subscription } = req.user;
  res.json({
    email,
    subscription,
  });
};

const logout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: "" });

  res.status(204).json();
};

const updateSubscription = async (req, res) => {
  const { _id } = req.user;
  const { subscription } = req.body;

  await User.findByIdAndUpdate(_id, { subscription });

  res.json({
    subscription,
  });
};

const updateAvatar = async (req, res) => {
  const { _id } = req.user;
  const { path: tempUpload, originalname } = req.file;
  const filename = `${_id}_${originalname}`;
  const resultUpload = path.join(avatarsDir, filename);

  (await Jimp.read(tempUpload)).resize(250, 250).write(resultUpload);

  const avatarURL = path.join("avatars", filename);
  await User.findByIdAndUpdate(_id, { avatarURL });

  res.json({
    avatarURL,
  });
};

module.exports = {
  register: controllerWrapper(register),
  verifyEmail: controllerWrapper(verifyEmail),
  recentVerifyEmail: controllerWrapper(recentVerifyEmail),
  login: controllerWrapper(login),
  getCurrent: controllerWrapper(getCurrent),
  logout: controllerWrapper(logout),
  updateSubscription: controllerWrapper(updateSubscription),
  updateAvatar: controllerWrapper(updateAvatar),
};
