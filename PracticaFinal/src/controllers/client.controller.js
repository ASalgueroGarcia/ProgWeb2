const Client = require("../models/Client");
const AppError = require("../utils/AppError");

const create = async (req, res, next) => {
  try {
    const { name, cif, email, phone, address } = req.body;
    const existing = await Client.findOne({ company: req.user.company._id, cif, deleted: false });
    if (existing) return next(new AppError("CIF already exists in this company", 409));

    const client = await Client.create({
      user: req.user._id, company: req.user.company._id, name, cif, email, phone, address
    });

    const io = req.app.get("io");
    if (io) io.to(req.user.company._id.toString()).emit("client:new", client);

    res.status(201).json(client);
  } catch (err) { next(err); }
};

const list = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, name, sort = "createdAt" } = req.query;
    const filter = { company: req.user.company._id, deleted: false };
    if (name) filter.name = { $regex: name, $options: "i" };

    const totalItems = await Client.countDocuments(filter);
    const clients = await Client.find(filter)
      .sort({ [sort]: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ clients, totalItems, totalPages: Math.ceil(totalItems / limit), currentPage: Number(page) });
  } catch (err) { next(err); }
};

const listArchived = async (req, res, next) => {
  try {
    const clients = await Client.find({ company: req.user.company._id, deleted: true });
    res.json(clients);
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const client = await Client.findOne({ _id: req.params.id, company: req.user.company._id });
    if (!client) return next(new AppError("Client not found", 404));
    res.json(client);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, company: req.user.company._id },
      req.body, { new: true, runValidators: true }
    );
    if (!client) return next(new AppError("Client not found", 404));
    res.json(client);
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const { soft } = req.query;
    const client = await Client.findOne({ _id: req.params.id, company: req.user.company._id });
    if (!client) return next(new AppError("Client not found", 404));

    if (soft === "true") {
      client.deleted = true;
      await client.save();
      return res.json({ message: "Client archived", client });
    }
    await Client.deleteOne({ _id: req.params.id });
    res.json({ message: "Client deleted" });
  } catch (err) { next(err); }
};

const restore = async (req, res, next) => {
  try {
    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, company: req.user.company._id, deleted: true },
      { deleted: false }, { new: true }
    );
    if (!client) return next(new AppError("Client not found or not archived", 404));
    res.json(client);
  } catch (err) { next(err); }
};

module.exports = { create, list, listArchived, getOne, update, remove, restore };