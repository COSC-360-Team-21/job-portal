import { validationResult } from 'express-validator';
import * as commentService from '../services/commentService.js';

export const createComment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const comment = await commentService.createComment(
      req.user._id,
      req.body.jobId,
      req.body.content,
      req.body.parentCommentId
    );
    res.status(201).json(comment);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const getJobComments = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const page = Number.parseInt(req.query.page, 10) || 1;
    const limit = Number.parseInt(req.query.limit, 10) || 20;
    const result = await commentService.getJobComments(req.params.jobId, { page, limit });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUserComments = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page, 10) || 1;
    const limit = Number.parseInt(req.query.limit, 10) || 20;
    const result = await commentService.getUserComments(req.user._id, { page, limit });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteComment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const isAdmin = req.user.role === 'admin';
    await commentService.deleteComment(req.params.id, req.user._id, isAdmin);
    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const getHotDiscussions = async (_req, res) => {
  try {
    const data = await commentService.getHotDiscussions();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
