import mongoose from "mongoose"

const postSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Post content is required"],
      trim: true,
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        publicId: String,
      },
    ],
    tags: [String],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        text: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true },
)

// Add indexes for better query performance
postSchema.index({ author: 1, createdAt: -1 })
postSchema.index({ tags: 1 })

const Post = mongoose.model("Post", postSchema)

export default Post
