const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// const { SECRET_KEY } = process.env;

// const SECRET_KEY = "2b0131f0-mead-3478-9geu-43e9545c5746";

const { HttpError, controllerWrapper } = require("../helpers");
const { User } = require("../models/user");

const register = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    throw HttpError(409, "Email in use");
  }

  const hachPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({ ...req.body, password: hachPassword });

  res.status(201).json({
    email: newUser.email,
    subscription: newUser.subscription,
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw HttpError(401, "Email or password is wrong");
  }

  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw HttpError(401, "Email or password is wrong");
  }

  const payload = {
    id: user._id,
  };

  const token = jwt.sign(payload, `${process.env.SECRET_KEY}`, {
    expiresIn: "12h",
  });

  res.json({
    token,
  });
};

module.exports = {
  register: controllerWrapper(register),
  login: controllerWrapper(login),
};
