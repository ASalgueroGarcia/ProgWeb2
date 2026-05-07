const DeliveryNote = require("../models/DeliveryNote");
const Project = require("../models/Project");
const Client = require("../models/Client");
const AppError = require("../utils/AppError");
const { generateDeliveryNotePdf } = require("../services/pdf.service");
const { uploadBuffer, uploadPdfBuffer } = require("../services/storage.service");
const sharp = require("sharp");

const create = async (req, res, next) => {
  try {
    const { client: clientId, project: projectId, format, description, workDate, material, quantity, unit, hours, workers } = req.body;

    const project = await Project.findOne({ _id: projectId, company: req.user.company._id });
    if (!project) return next(new AppError("Project not found in this company", 404));

    const client = await Client.findOne({ _id: clientId, company: req.user.company._id });
    if (!client) return next(new AppError("Client not found in this company", 404));

    const note = await DeliveryNote.create({
      user: req.user._id, company: req.user.company._id, client: clientId, project: projectId,
      format, description, workDate: new Date(workDate), material, quantity, unit, hours, workers
    });

    const io = req.app.get("io");
    if (io) io.to(req.user.company._id.toString()).emit("deliverynote:new", note);

    res.status(201).json(note);
  } catch (err) { next(err); }
};

const list = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, project: projectId, client: clientId, format, signed, from, to, sort = "createdAt" } = req.query;
    const filter = { company: req.user.company._id };
    if (projectId) filter.project = projectId;
    if (clientId) filter.client = clientId;
    if (format) filter.format = format;
    if (signed !== undefined) filter.signed = signed === "true";
    if (from || to) {
      filter.workDate = {};
      if (from) filter.workDate.$gte = new Date(from);
      if (to) filter.workDate.$lte = new Date(to);
    }

    const totalItems = await DeliveryNote.countDocuments(filter);
    const notes = await DeliveryNote.find(filter)
      .sort({ [sort]: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ notes, totalItems, totalPages: Math.ceil(totalItems / limit), currentPage: Number(page) });
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const note = await DeliveryNote.findOne({ _id: req.params.id, company: req.user.company._id })
      .populate("user", "name email")
      .populate("client", "name cif")
      .populate("project", "name projectCode");
    if (!note) return next(new AppError("Delivery note not found", 404));
    res.json(note);
  } catch (err) { next(err); }
};

const getPdf = async (req, res, next) => {
  try {
    const note = await DeliveryNote.findOne({ _id: req.params.id, company: req.user.company._id })
      .populate("client", "name cif address")
      .populate("project", "name projectCode address");
    if (!note) return next(new AppError("Delivery note not found", 404));

    if (note.signed && note.pdfUrl) {
      return res.redirect(note.pdfUrl);
    }

    const pdfBuffer = await generateDeliveryNotePdf(note);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=albaran-${note._id}.pdf`);
    res.send(pdfBuffer);
  } catch (err) { next(err); }
};

const sign = async (req, res, next) => {
  try {
    const note = await DeliveryNote.findOne({ _id: req.params.id, company: req.user.company._id });
    if (!note) return next(new AppError("Delivery note not found", 404));
    if (note.signed) return next(new AppError("Delivery note already signed", 400));

    const file = req.file;
    if (!file) return next(new AppError("Signature image required", 400));

    const optimized = await sharp(file.buffer).resize(800).webp().toBuffer();
    const signatureUrl = await uploadBuffer(optimized, "signatures", { format: "webp" });

    note.signed = true;
    note.signedAt = new Date();
    note.signatureUrl = signatureUrl;

    const pdfBuffer = await generateDeliveryNotePdf(note);
    note.pdfUrl = await uploadPdfBuffer(pdfBuffer, "pdfs");

    await note.save();

    const io = req.app.get("io");
    if (io) io.to(req.user.company._id.toString()).emit("deliverynote:signed", note);

    res.json(note);
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const note = await DeliveryNote.findOne({ _id: req.params.id, company: req.user.company._id });
    if (!note) return next(new AppError("Delivery note not found", 404));
    if (note.signed) return next(new AppError("Cannot delete signed delivery note", 403));

    await DeliveryNote.deleteOne({ _id: req.params.id });
    res.json({ message: "Delivery note deleted" });
  } catch (err) { next(err); }
};

module.exports = { create, list, getOne, getPdf, sign, remove };