const express = require("express");
const PostModel = require("../models/post.model");
const authenticateLoginToken = require("../middleware/authenticateLoginToken");
const CommentModel = require("../models/comment.model");

const postRouter = express.Router();

postRouter.post("/", authenticateLoginToken, async (req, res) => {
  const { title, description, stockSymbol, tags } = req.body;
  if (
    !title === "string" ||
    !description === "string" ||
    !stockSymbol === "string" ||
    !Array.isArray(tags)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid or incomplete inputs in request, try again",
    });
  }
  try {
    const newPost = new PostModel({
      title,
      description,
      stockSymbol,
      tags,
      author: req.userId,
      username: req.username,
      likes: [],
      createdAt: Date.now(),
    });
    await newPost.save();

    return res.status(200).json({
      success: true,
      postId: newPost._id,
      message: "Post created successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error, try again!",
    });
  }
});

postRouter.get("/", async (req, res) => {
  const { limit } = req.query || 10;
  const { page } = req.query || 1;
  let skipCount = 0;
  if (page > 1) {
    skipCount = (page - 1) * limit;
  }
  let query = {};
  if (req.query.stockSymbol) {
    const stockSymbol = req.query.stockSymbol;
    if (stockSymbol === "AAPL" || stockSymbol === "TSLA") {
      query.stockSymbol = stockSymbol;
    } else {
      return res.status(400).json({
        success: false,
        messgae: "Invalid query received (stockSymbol)",
      });
    }
  }
  if (req.query.tags) {
    const tags = req.query.tags.split(",");

    if (
      tags.includes("tag1") ||
      tags.includes("tag2") ||
      tags.includes("tag3")
    ) {
      if (tags.length === 1) query.tags = tags[0];
      else query.tags = [...tags];
    } else {
      return res.status(400).json({
        success: false,
        messgae: "Invalid query received (tags)",
      });
    }
  }

  try {
    const posts = await PostModel.find(query).skip(skipCount).limit(limit);
    if (req.query.sort) {
      const sort = req.query.sort;

      if (sort === "likes")
        posts.sort((a, b) => b.likes.length - a.likes.length);
      else if (sort === "createdAt")
        posts.sort((a, b) => b.createdAt - a.createdAt);
      else
        return res
          .status(400)
          .json({ success: false, messgae: "Invalid query received (sort)" });
    }
    return res.status(200).json(posts);
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error, try again!",
    });
  }
});

postRouter.get("/:id", authenticateLoginToken, async (req, res) => {
  const { id } = req.params;
  try {
    const post = await PostModel.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        messgae: "Post not found",
      });
    }
    const comments = (await CommentModel.find({ postId: post._id })) || [];
    return res.status(200).json({
      postId: post._id,
      title: post.title,
      description: post.description,
      stockSymbols: post.stockSymbol,
      likesCount: post.likes.length,
      comments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error, please try again!!",
    });
  }
});
postRouter.delete("/:id", authenticateLoginToken, async (req, res) => {
  const { id } = req.params;
  try {
    const post = await PostModel.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "No post found",
      });
    }
    if (!(post.author === req.userId)) {
      return res.status(401).json({
        success: false,
        message:
          "Only the author can delete their post, you are not the author!!",
      });
    }
    await PostModel.findByIdAndDelete(id);
    return res
      .status(200)
      .json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error, please try again!!",
    });
  }
});

postRouter.post("/:id/comments", authenticateLoginToken, async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;

  if (!comment) {
    return res.status(401).json({
      success: false,
      message: "Please Provide Comment",
    });
  }
  try {
    const post = await PostModel.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "No post found",
      });
    }
    const newComment = new CommentModel({
      comment,
      userId: req.userId,
      postId: id,
      createdAt: Date.now(),
    });
    await newComment.save();

    return res.status(200).json({
      success: true,
      commentId: newComment._id,
      message: "Comment added successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error, please try again!!",
    });
  }
});

postRouter.delete(
  "/:id/comments/:commentId",
  authenticateLoginToken,
  async (req, res) => {
    const { id, commentId } = req.params;

    try {
      const post = await PostModel.findById(id);
      if (!post) {
        return res.status(404).json({
          success: false,
          message: "Post not found",
        });
      }
      const comment = await CommentModel.findById(commentId);
      if (!comment) {
        return res.status(404).json({
          success: false,
          message: "Comment not found",
        });
      }
      if (req.userId != post.userId && req.userId != comment.userId) {
        return res.status(401).json({
          success: false,
          message: "Only post author or comment author can delete the comment",
        });
      }
      await CommentModel.findByIdAndDelete(commentId);
      return res.status(200).json({
        success: true,
        message: "Comment deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error, please try again!! at delete comment",
      });
    }
  }
);

postRouter.post("/:postId/like", authenticateLoginToken, async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const likeResponse = await PostModel.updateOne(
      { _id: postId },
      { $addToSet: { likes: req.userId } } // Use $addToSet to avoid duplicate likes
    );
    if (likeResponse.acknowledged) {
      if (likeResponse.modifiedCount === 1) {
        return res.status(200).json({ success: true, message: "Post liked" });
      } else {
        return res
          .status(409)
          .json({ success: false, message: "You've already liked this post" });
      }
    } else {
      res.status(400).json({
        success: false,
        message: "Failed to like the post",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error, please try again!!",
    });
  }
});

postRouter.delete("/:postId/like", authenticateLoginToken, async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const unlikeResponse = await PostModel.updateOne(
      { _id: postId },
      { $pull: { likes: req.userId } } // Use $pull to remove the like
    );

    if (unlikeResponse.acknowledged) {
      if (unlikeResponse.modifiedCount === 1) {
        return res.status(200).json({ success: true, message: "Post inliked" });
      } else {
        return res
          .status(409)
          .json({
            success: false,
            message: "You didn't liked this post previously",
          });
      }
    } else {
      res.status(400).json({
        success: false,
        message: "Failed to unlike the post",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error, please try again!!",
    });
  }
});
module.exports = postRouter;
