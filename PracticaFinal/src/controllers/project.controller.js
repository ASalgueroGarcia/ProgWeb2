const Project = require("../models/Project");
const Client = require("../models/Client");
const AppError = require("../utils/AppError");

const create = async (req, res, next) => {
  try {
    const { name, projectCode, client: clientId, email, notes, address } = req.body;
    const existing = await Project.findOne({ company: req.user.company._id, projectCode, deleted: false });
    if (existing) return next(new AppError("Project code already exists in this company", 409));

    const client = await Client.findOne({ _id: clientId, company: req.user.company._id });
    if (!client) return next(new AppError("Client not found in this company", 404));

    const project = await Project.create({
      user: req.user._id, company: req.user.company._id, client: clientId,
      name, projectCode, email, notes, address
    });

    const io = req.app.get("io");
    if (io) io.to(req.user.company._id.toString()).emit("project:new", project);

    res.status(201).json(project);
  } catch (err) { next(err); }
};

const list = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, client: clientId, name, active, sort = "createdAt" } = req.query;
    const filter = { company: req.user.company._id, deleted: false };
    if (clientId) filter.client = clientId;
    if (name) filter.name = { $regex: name, $options: "i" };
    if (active !== undefined) filter.active = active === "true";

    const totalItems = await Project.countDocuments(filter);
    const projects = await Project.find(filter)
      .sort({ [sort]: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ projects, totalItems, totalPages: Math.ceil(totalItems / limit), currentPage: Number(page) });
  } catch (err) { next(err); }
};

const listArchived = async (req, res, next) => {
  try {
    const projects = await Project.find({ company: req.user.company._id, deleted: true });
    res.json(projects);
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, company: req.user.company._id });
    if (!project) return next(new AppError("Project not found", 404));
    res.json(project);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    // Validate duplicate project code if being updated
    if (req.body.projectCode) {
      const existing = await Project.findOne({
        company: req.user.company._id,
        projectCode: req.body.projectCode,
        _id: { $ne: req.params.id },
        deleted: false
      });
      if (existing) return next(new AppError("Project code already exists", 409));
    }

    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, company: req.user.company._id },
      req.body, { new: true, runValidators: true }
    );
    if (!project) return next(new AppError("Project not found", 404));
    res.json(project);
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const { soft } = req.query;
    const project = await Project.findOne({ _id: req.params.id, company: req.user.company._id });
    if (!project) return next(new AppError("Project not found", 404));

    if (soft === "true") {
      project.deleted = true;
      await project.save();
      return res.json({ message: "Project archived", project });
    }
    await Project.deleteOne({ _id: req.params.id });
    res.json({ message: "Project deleted" });
  } catch (err) { next(err); }
};

const restore = async (req, res, next) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, company: req.user.company._id, deleted: true },
      { deleted: false }, { new: true }
    );
    if (!project) return next(new AppError("Project not found or not archived", 404));
    res.json(project);
  } catch (err) { next(err); }
};

module.exports = { create, list, listArchived, getOne, update, remove, restore };