//src/controllers/podcasts.controller.js
import Podcast from '../models/podcast.model.js';
import { handleHttpError } from '../utils/handleError.js';

export const getPodcasts = async (req, res) => {
  try {
    const podcasts = await Podcast.find({ published: true });
    res.json({ data: podcasts });
  } catch (err) {
    handleHttpError(res, 'ERROR_GET_PODCASTS');
  }
};

export const getPodcast = async (req, res) => {
  try {
    const podcast = await Podcast.findById(req.params.id);
    if (!podcast) {
      handleHttpError(res, 'PODCAST_NOT_FOUND', 404);
      return;
    }
    res.json({ data: podcast });
  } catch (err) {
    handleHttpError(res, 'ERROR_GET_PODCAST');
  }
};

export const createPodcast = async (req, res) => {
  try {
    const podcast = await Podcast.create({ ...req.body, author: req.user._id });
    res.status(201).json({ data: podcast });
  } catch (err) {
    handleHttpError(res, 'ERROR_CREATE_PODCAST');
  }
};

export const updatePodcast = async (req, res) => {
  try {
    // only the author can update their own podcast
    const podcast = await Podcast.findOneAndUpdate(
      { _id: req.params.id, author: req.user._id },
      req.body,
      { new: true }
    );
    if (!podcast) {
      handleHttpError(res, 'PODCAST_NOT_FOUND_OR_NOT_OWNER', 404);
      return;
    }
    res.json({ data: podcast });
  } catch (err) {
    handleHttpError(res, 'ERROR_UPDATE_PODCAST');
  }
};

export const deletePodcast = async (req, res) => {
  try {
    const podcast = await Podcast.findByIdAndDelete(req.params.id);
    if (!podcast) {
      handleHttpError(res, 'PODCAST_NOT_FOUND', 404);
      return;
    }
    res.json({ data: podcast, message: 'Podcast eliminado' });
  } catch (err) {
    handleHttpError(res, 'ERROR_DELETE_PODCAST');
  }
};

export const getAllPodcasts = async (req, res) => {
  try {
    const podcasts = await Podcast.find();
    res.json({ data: podcasts });
  } catch (err) {
    handleHttpError(res, 'ERROR_GET_ALL_PODCASTS');
  }
};

export const publishPodcast = async (req, res) => {
  try {
    const podcast = await Podcast.findById(req.params.id);
    if (!podcast) {
      handleHttpError(res, 'PODCAST_NOT_FOUND', 404);
      return;
    }
    podcast.published = !podcast.published; // toggle
    await podcast.save();
    res.json({ data: podcast });
  } catch (err) {
    handleHttpError(res, 'ERROR_PUBLISH_PODCAST');
  }
};