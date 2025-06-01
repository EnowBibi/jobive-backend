import mongoose from "mongoose"

const fileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  publicId: String,
})

const subchapterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Subchapter title is required"],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  files: [fileSchema],
  order: {
    type: Number,
    default: 0,
  },
})

const chapterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Chapter title is required"],
    trim: true,
  },
  subchapters: [subchapterSchema],
  order: {
    type: Number,
    default: 0,
  },
})

const trainingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Training title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Training description is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
    duration: {
      type: String,
      trim: true,
    },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    chapters: [chapterSchema],
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    enrolledUsers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        enrolledAt: {
          type: Date,
          default: Date.now,
        },
        completedChapters: [
          {
            chapterId: mongoose.Schema.Types.ObjectId,
            completedAt: Date,
          },
        ],
      },
    ],
    ratings: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        review: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
    },
    totalEnrollments: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
  },
  { timestamps: true },
)

// Add indexes for better query performance
trainingSchema.index({ instructor: 1, createdAt: -1 })
trainingSchema.index({ category: 1 })
trainingSchema.index({ price: 1 })
trainingSchema.index({ level: 1 })
trainingSchema.index({ averageRating: -1 })

// Calculate average rating before saving
trainingSchema.pre("save", function (next) {
  if (this.ratings && this.ratings.length > 0) {
    const totalRating = this.ratings.reduce((sum, item) => sum + item.rating, 0)
    this.averageRating = totalRating / this.ratings.length
  }
  next()
})

const Training = mongoose.model("Training", trainingSchema)

export default Training
