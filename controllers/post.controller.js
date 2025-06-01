import Post from "../models/post.model.js"

// Create a new post
export const createPost = async (req, res) => {
  try {
    const { content, tags, images } = req.body
    const userId = req.user._id
    if (!content) {
      return res.status(400).json({ success: false, message: "Post content is required" })
    }

    const newPost = new Post({
      content,
      tags: tags || [],
      images: images || [],
      author: userId,
    })
    await newPost.save()

    // Populate author details for the response
    const populatedPost = await Post.findById(newPost._id).populate("author", "name avatar")

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: populatedPost,
    })
  } catch (error) {
    console.error("Error creating post:", error)
    res.status(500).json({ success: false, message: "Failed to create post", error: error.message })
  }
}

// Get all posts with pagination
export const getAllPosts = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "name avatar")
      .populate("comments.user", "name avatar")
    console.log(posts)
    const total = await Post.countDocuments()

    res.status(200).json({
      success: true,
      data: posts,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    })
  } catch (error) {
    console.error("Error fetching posts:", error)
    res.status(500).json({ success: false, message: "Failed to fetch posts", error: error.message })
  }
}

// Get posts by user
export const getUserPosts = async (req, res) => {
  try {
    const userId = req.params.userId
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const posts = await Post.find({ author: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "name avatar")
      .populate("comments.user", "name avatar")

    const total = await Post.countDocuments({ author: userId })

    res.status(200).json({
      success: true,
      data: posts,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    })
  } catch (error) {
    console.error("Error fetching user posts:", error)
    res.status(500).json({ success: false, message: "Failed to fetch user posts", error: error.message })
  }
}

// Get a single post by ID
export const getPostById = async (req, res) => {
  try {
    const postId = req.params.id

    const post = await Post.findById(postId)
      .populate("author", "name avatar")
      .populate("comments.user", "name avatar")
      .populate("likes", "name avatar")

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" })
    }

    res.status(200).json({
      success: true,
      data: post,
    })
  } catch (error) {
    console.error("Error fetching post:", error)
    res.status(500).json({ success: false, message: "Failed to fetch post", error: error.message })
  }
}

// Update a post
export const updatePost = async (req, res) => {
  try {
    const postId = req.params.id
    const { content, tags, images } = req.body
    const userId = req.user._id

    const post = await Post.findById(postId)

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" })
    }

    // Check if the user is the author of the post
    if (post.author.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to update this post" })
    }

    // Update post fields
    if (content) post.content = content
    if (tags) post.tags = tags
    if (images) post.images = images

    await post.save()

    const updatedPost = await Post.findById(postId)
      .populate("author", "name avatar")
      .populate("comments.user", "name avatar")

    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      data: updatedPost,
    })
  } catch (error) {
    console.error("Error updating post:", error)
    res.status(500).json({ success: false, message: "Failed to update post", error: error.message })
  }
}

// Delete a post
export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id
    const userId = req.user._id

    const post = await Post.findById(postId)

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" })
    }

    // Check if the user is the author of the post
    if (post.author.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this post" })
    }

    await Post.findByIdAndDelete(postId)

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting post:", error)
    res.status(500).json({ success: false, message: "Failed to delete post", error: error.message })
  }
}

// Like or unlike a post
export const likePost = async (req, res) => {
  try {
    const postId = req.params.id
    const userId = req.user._id

    const post = await Post.findById(postId)

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" })
    }

    // Check if the user has already liked the post
    const alreadyLiked = post.likes.includes(userId)

    if (alreadyLiked) {
      // Unlike the post
      post.likes = post.likes.filter((id) => id.toString() !== userId.toString())
    } else {
      // Like the post
      post.likes.push(userId)
    }

    await post.save()

    res.status(200).json({
      success: true,
      message: alreadyLiked ? "Post unliked successfully" : "Post liked successfully",
      liked: !alreadyLiked,
      likesCount: post.likes.length,
    })
  } catch (error) {
    console.error("Error liking/unliking post:", error)
    res.status(500).json({ success: false, message: "Failed to like/unlike post", error: error.message })
  }
}

// Add a comment to a post
export const addComment = async (req, res) => {
  try {
    const postId = req.params.id
    const { text } = req.body
    const userId = req.user._id

    if (!text) {
      return res.status(400).json({ success: false, message: "Comment text is required" })
    }

    const post = await Post.findById(postId)

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" })
    }

    const comment = {
      user: userId,
      text,
    }

    post.comments.push(comment)
    await post.save()

    // Get the newly added comment with populated user
    const updatedPost = await Post.findById(postId).populate("comments.user", "name avatar")
    const newComment = updatedPost.comments[updatedPost.comments.length - 1]

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: newComment,
    })
  } catch (error) {
    console.error("Error adding comment:", error)
    res.status(500).json({ success: false, message: "Failed to add comment", error: error.message })
  }
}

// Delete a comment
export const deleteComment = async (req, res) => {
  try {
    const { id: postId, commentId } = req.params
    const userId = req.user._id

    const post = await Post.findById(postId)

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" })
    }

    // Find the comment
    const comment = post.comments.id(commentId)

    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" })
    }

    // Check if the user is the author of the comment or the post
    if (comment.user.toString() !== userId.toString() && post.author.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this comment" })
    }

    // Remove the comment
    comment.remove()
    await post.save()

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting comment:", error)
    res.status(500).json({ success: false, message: "Failed to delete comment", error: error.message })
  }
}
