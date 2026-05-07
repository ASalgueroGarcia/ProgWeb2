const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Company = require("../models/Company");
const AppError = require("../utils/AppError");
const { sendVerificationEmail } = require("../services/mail.service");

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return next(new AppError("Email already registered", 409));

    const hashedPassword = await bcrypt.hash(password, 10);
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await User.create({
      name, email, password: hashedPassword, validationCode: code
    });

    await sendVerificationEmail(email, code);

    res.status(201).json({ message: "User registered. Check your email for verification code.", userId: user._id });
  } catch (err) { next(err); }
};

const validateEmail = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email, validationCode: code });
    if (!user) return next(new AppError("Invalid verification code", 400));

    user.validated = true;
    user.validationCode = undefined;
    await user.save();

    res.json({ message: "Email validated successfully" });
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).populate("company");
    if (!user) return next(new AppError("Invalid credentials", 401));

    if (!user.validated) return next(new AppError("Please validate your email first", 403));

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return next(new AppError("Invalid credentials", 401));

    const token = jwt.sign(
      { id: user._id.toString(), companyId: user.company?._id?.toString() || "" },
      process.env.JWT_SECRET || "test_secret",
      { expiresIn: "7d" }
    );

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { next(err); }
};

const updatePersonal = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name: req.body.name, email: req.body.email },
      { new: true, runValidators: true }
    );
    res.json(user);
  } catch (err) { next(err); }
};

const updateCompany = async (req, res, next) => {
  try {
    const { name, cif } = req.body;
    let company = await Company.findOne({ owner: req.user._id });

    if (company) {
      company.name = name || company.name;
      company.cif = cif || company.cif;
      await company.save();
    } else {
      company = await Company.create({ name, cif, owner: req.user._id });
      await User.findByIdAndUpdate(req.user._id, { company: company._id });
    }

    res.json(company);
  } catch (err) { next(err); }
};

const uploadLogo = async (req, res, next) => {
  try {
    if (!req.file) return next(new AppError("No file uploaded", 400));
    const logoUrl = req.file.path;
    const company = await Company.findOne({ owner: req.user._id });
    if (company) {
      company.logo = logoUrl;
      await company.save();
    }
    res.json({ logoUrl });
  } catch (err) { next(err); }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate("company");
    res.json(user);
  } catch (err) { next(err); }
};

const deleteAccount = async (req, res, next) => {
  try {
    const { soft } = req.query;
    if (soft === "true") {
      await User.findByIdAndUpdate(req.user._id, { deleted: true });
      return res.json({ message: "Account archived" });
    }
    await User.deleteOne({ _id: req.user._id });
    res.json({ message: "Account deleted" });
  } catch (err) { next(err); }
};

module.exports = { register, validateEmail, login, updatePersonal, updateCompany, uploadLogo, getMe, deleteAccount };