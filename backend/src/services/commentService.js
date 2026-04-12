import * as commentRepo from '../repositories/commentRepository.js';
import * as jobRepo from '../repositories/jobRepository.js';

export const createComment = async (authorId, jobId, content, parentCommentId) => {
  const job = await jobRepo.findById(jobId);
  if (!job) throw Object.assign(new Error('Job not found'), { status: 404 });

  if (parentCommentId) {
    const parent = await commentRepo.findById(parentCommentId);
    if (!parent) throw Object.assign(new Error('Parent comment not found'), { status: 404 });
    if (parent.job.toString() !== jobId) {
      throw Object.assign(new Error('Parent comment does not belong to this job'), { status: 400 });
    }
  }

  const comment = await commentRepo.create({
    content,
    author: authorId,
    job: jobId,
    parentComment: parentCommentId || null,
  });

  return commentRepo.findByIdPopulated(comment._id);
};

export const getJobComments = async (jobId, { page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;
  const [comments, totalItems] = await Promise.all([
    commentRepo.findByJob(jobId, { skip, limit }),
    commentRepo.countDocuments({ job: jobId, parentComment: null }),
  ]);

  // Fetch replies for each top-level comment
  const commentsWithReplies = await Promise.all(
    comments.map(async (comment) => {
      const replies = await commentRepo.findReplies(comment._id);
      return { ...comment.toObject(), replies };
    })
  );

  const totalPages = Math.max(Math.ceil(totalItems / limit), 1);
  return {
    data: commentsWithReplies,
    pagination: { page, limit, totalItems, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 },
  };
};

export const getUserComments = async (userId, { page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;
  const [data, totalItems] = await Promise.all([
    commentRepo.findByAuthor(userId, { skip, limit }),
    commentRepo.countDocuments({ author: userId }),
  ]);

  const totalPages = Math.max(Math.ceil(totalItems / limit), 1);
  return {
    data,
    pagination: { page, limit, totalItems, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 },
  };
};

export const deleteComment = async (commentId, userId, isAdmin = false) => {
  const comment = await commentRepo.findById(commentId);
  if (!comment) throw Object.assign(new Error('Comment not found'), { status: 404 });

  if (!isAdmin && comment.author.toString() !== userId.toString()) {
    throw Object.assign(new Error('Forbidden: you can only delete your own comments'), { status: 403 });
  }

  // Delete all replies too
  await commentRepo.deleteMany({ parentComment: commentId });
  await commentRepo.deleteById(commentId);
};

export const getHotDiscussions = async () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  return commentRepo.hotDiscussions(sevenDaysAgo);
};
