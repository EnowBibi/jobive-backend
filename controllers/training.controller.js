import Training from "../models/training.model.js"

// Create a new training program
export const createTraining = async (req, res) => {
  try {
    const { title, description, category, price, duration, level, chapters } = req.body
    const userId = req.user._id

    // Validate required fields
    if (!title || !description || !category || price === undefined) {
      return res.status(400).json({ success: false, message: "Missing required fields" })
    }

    const newTraining = new Training({
      title,
      description,
      category,
      price,
      duration,
      level,
      chapters: chapters || [],
      instructor: userId,
      status: "draft",
    })

    await newTraining.save()

    // Populate instructor details for the response
    const populatedTraining = await Training.findById(newTraining._id).populate("instructor", "name avatar")

    res.status(201).json({
      success: true,
      message: "Training program created successfully",
      data: populatedTraining,
    })
  } catch (error) {
    console.error("Error creating training program:", error)
    res.status(500).json({ success: false, message: "Failed to create training program", error: error.message })
  }
}

// Get all training programs with pagination and filters
export const getAllTrainings = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    // Build filter object
    const filter = { status: "published" }

    if (req.query.category) {
      filter.category = req.query.category
    }

    if (req.query.level) {
      filter.level = req.query.level
    }

    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {}
      if (req.query.minPrice) filter.price.$gte = Number.parseFloat(req.query.minPrice)
      if (req.query.maxPrice) filter.price.$lte = Number.parseFloat(req.query.maxPrice)
    }

    // Build sort object
    let sort = { createdAt: -1 } // Default sort by newest

    if (req.query.sort) {
      switch (req.query.sort) {
        case "price_asc":
          sort = { price: 1 }
          break
        case "price_desc":
          sort = { price: -1 }
          break
        case "rating":
          sort = { averageRating: -1 }
          break
        case "popularity":
          sort = { totalEnrollments: -1 }
          break
      }
    }

    const trainings = await Training.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("instructor", "name avatar")
      .select("-chapters.subchapters.files") // Exclude file details for performance

    const total = await Training.countDocuments(filter)

    res.status(200).json({
      success: true,
      data: trainings,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    })
  } catch (error) {
    console.error("Error fetching training programs:", error)
    res.status(500).json({ success: false, message: "Failed to fetch training programs", error: error.message })
  }
}

// Get training programs by instructor
export const getInstructorTrainings = async (req, res) => {
  try {
    const instructorId = req.params.instructorId
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const trainings = await Training.find({ instructor: instructorId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("instructor", "name avatar")
      .select("-chapters.subchapters.files") // Exclude file details for performance

    const total = await Training.countDocuments({ instructor: instructorId })

    res.status(200).json({
      success: true,
      data: trainings,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    })
  } catch (error) {
    console.error("Error fetching instructor training programs:", error)
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch instructor training programs", error: error.message })
  }
}

// Get a single training program by ID
export const getTrainingById = async (req, res) => {
  try {
    const trainingId = req.params.id

    const training = await Training.findById(trainingId)
      .populate("instructor", "name avatar bio")
      .populate("ratings.user", "name avatar")

    if (!training) {
      return res.status(404).json({ success: false, message: "Training program not found" })
    }

    res.status(200).json({
      success: true,
      data: training,
    })
  } catch (error) {
    console.error("Error fetching training program:", error)
    res.status(500).json({ success: false, message: "Failed to fetch training program", error: error.message })
  }
}

// Update a training program
export const updateTraining = async (req, res) => {
  try {
    const trainingId = req.params.id
    const userId = req.user._id
    const updateData = req.body

    const training = await Training.findById(trainingId)

    if (!training) {
      return res.status(404).json({ success: false, message: "Training program not found" })
    }

    // Check if the user is the instructor
    if (training.instructor.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to update this training program" })
    }

    // Fields that can be updated
    const allowedUpdates = ["title", "description", "category", "price", "duration", "level", "chapters", "status"]

    // Filter out fields that are not allowed to be updated
    const filteredUpdates = Object.keys(updateData)
      .filter((key) => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = updateData[key]
        return obj
      }, {})

    // Update the training program
    const updatedTraining = await Training.findByIdAndUpdate(
      trainingId,
      { $set: filteredUpdates },
      { new: true, runValidators: true },
    ).populate("instructor", "name avatar")

    res.status(200).json({
      success: true,
      message: "Training program updated successfully",
      data: updatedTraining,
    })
  } catch (error) {
    console.error("Error updating training program:", error)
    res.status(500).json({ success: false, message: "Failed to update training program", error: error.message })
  }
}

// Delete a training program
export const deleteTraining = async (req, res) => {
  try {
    const trainingId = req.params.id
    const userId = req.user._id

    const training = await Training.findById(trainingId)

    if (!training) {
      return res.status(404).json({ success: false, message: "Training program not found" })
    }

    // Check if the user is the instructor
    if (training.instructor.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this training program" })
    }

    await Training.findByIdAndDelete(trainingId)

    res.status(200).json({
      success: true,
      message: "Training program deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting training program:", error)
    res.status(500).json({ success: false, message: "Failed to delete training program", error: error.message })
  }
}

// Enroll in a training program
export const enrollInTraining = async (req, res) => {
  try {
    const trainingId = req.params.id
    const userId = req.user._id

    const training = await Training.findById(trainingId)

    if (!training) {
      return res.status(404).json({ success: false, message: "Training program not found" })
    }

    // Check if user is already enrolled
    const alreadyEnrolled = training.enrolledUsers.some(
      (enrollment) => enrollment.user.toString() === userId.toString(),
    )

    if (alreadyEnrolled) {
      return res.status(400).json({ success: false, message: "User is already enrolled in this training program" })
    }

    // Add user to enrolled users
    training.enrolledUsers.push({
      user: userId,
      enrolledAt: Date.now(),
      completedChapters: [],
    })

    // Increment total enrollments
    training.totalEnrollments += 1

    await training.save()

    res.status(200).json({
      success: true,
      message: "Successfully enrolled in training program",
    })
  } catch (error) {
    console.error("Error enrolling in training program:", error)
    res.status(500).json({ success: false, message: "Failed to enroll in training program", error: error.message })
  }
}

// Mark chapter as completed
export const completeChapter = async (req, res) => {
  try {
    const { id: trainingId, chapterId } = req.params
    const userId = req.user._id

    const training = await Training.findById(trainingId)

    if (!training) {
      return res.status(404).json({ success: false, message: "Training program not found" })
    }

    // Find the user's enrollment
    const enrollmentIndex = training.enrolledUsers.findIndex(
      (enrollment) => enrollment.user.toString() === userId.toString(),
    )

    if (enrollmentIndex === -1) {
      return res.status(400).json({ success: false, message: "User is not enrolled in this training program" })
    }

    // Check if the chapter exists
    const chapterExists = training.chapters.some((chapter) => chapter._id.toString() === chapterId)

    if (!chapterExists) {
      return res.status(404).json({ success: false, message: "Chapter not found" })
    }

    // Check if chapter is already completed
    const alreadyCompleted = training.enrolledUsers[enrollmentIndex].completedChapters.some(
      (chapter) => chapter.chapterId.toString() === chapterId,
    )

    if (alreadyCompleted) {
      return res.status(400).json({ success: false, message: "Chapter is already marked as completed" })
    }

    // Add chapter to completed chapters
    training.enrolledUsers[enrollmentIndex].completedChapters.push({
      chapterId,
      completedAt: Date.now(),
    })

    await training.save()

    res.status(200).json({
      success: true,
      message: "Chapter marked as completed",
    })
  } catch (error) {
    console.error("Error marking chapter as completed:", error)
    res.status(500).json({ success: false, message: "Failed to mark chapter as completed", error: error.message })
  }
}

// Rate and review a training program
export const rateTraining = async (req, res) => {
  try {
    const trainingId = req.params.id
    const userId = req.user._id
    const { rating, review } = req.body

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" })
    }

    const training = await Training.findById(trainingId)

    if (!training) {
      return res.status(404).json({ success: false, message: "Training program not found" })
    }

    // Check if user is enrolled
    const isEnrolled = training.enrolledUsers.some((enrollment) => enrollment.user.toString() === userId.toString())

    if (!isEnrolled) {
      return res.status(400).json({ success: false, message: "Only enrolled users can rate training programs" })
    }

    // Check if user has already rated
    const existingRatingIndex = training.ratings.findIndex((r) => r.user.toString() === userId.toString())

    if (existingRatingIndex !== -1) {
      // Update existing rating
      training.ratings[existingRatingIndex].rating = rating
      training.ratings[existingRatingIndex].review = review || ""
    } else {
      // Add new rating
      training.ratings.push({
        user: userId,
        rating,
        review: review || "",
      })
    }

    // Recalculate average rating
    const totalRating = training.ratings.reduce((sum, item) => sum + item.rating, 0)
    training.averageRating = totalRating / training.ratings.length

    await training.save()

    res.status(200).json({
      success: true,
      message: "Training program rated successfully",
      averageRating: training.averageRating,
    })
  } catch (error) {
    console.error("Error rating training program:", error)
    res.status(500).json({ success: false, message: "Failed to rate training program", error: error.message })
  }
}

// Get enrolled training programs for a user
export const getEnrolledTrainings = async (req, res) => {
  try {
    const userId = req.user._id
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const trainings = await Training.find({ "enrolledUsers.user": userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("instructor", "name avatar")
      .select("-chapters.subchapters.files") // Exclude file details for performance

    const total = await Training.countDocuments({ "enrolledUsers.user": userId })

    res.status(200).json({
      success: true,
      data: trainings,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    })
  } catch (error) {
    console.error("Error fetching enrolled training programs:", error)
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch enrolled training programs", error: error.message })
  }
}

// Upload files for a subchapter
export const uploadTrainingFiles = async (req, res) => {
  try {
    const { id: trainingId, chapterId, subchapterId } = req.params
    const userId = req.user._id
    const files = req.files

    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: "No files uploaded" })
    }

    const training = await Training.findById(trainingId)

    if (!training) {
      return res.status(404).json({ success: false, message: "Training program not found" })
    }

    // Check if the user is the instructor
    if (training.instructor.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to upload files to this training program" })
    }

    // Find the chapter and subchapter
    const chapter = training.chapters.id(chapterId)
    if (!chapter) {
      return res.status(404).json({ success: false, message: "Chapter not found" })
    }

    const subchapter = chapter.subchapters.id(subchapterId)
    if (!subchapter) {
      return res.status(404).json({ success: false, message: "Subchapter not found" })
    }

    // Process uploaded files
    const uploadedFiles = files.map((file) => ({
      name: file.originalname,
      url: `/uploads/${file.filename}`,
      type: file.mimetype,
      size: file.size,
    }))

    // Add files to subchapter
    subchapter.files.push(...uploadedFiles)
    await training.save()

    res.status(200).json({
      success: true,
      message: "Files uploaded successfully",
      data: uploadedFiles,
    })
  } catch (error) {
    console.error("Error uploading files:", error)
    res.status(500).json({ success: false, message: "Failed to upload files", error: error.message })
  }
}
