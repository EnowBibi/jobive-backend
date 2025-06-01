import express from "express"
import { ENV_VARS } from "./config/envVars.js"
import connectDB from "./config/db.js"
import cookieParser from "cookie-parser"
import authRoutes from "./routes/auth.route.js"
import userRoutes from "./routes/user.route.js"
import jobRoutes from "./routes/job.route.js"
import paymentRoutes from "./routes/payment.route.js"
import messageRoutes from "./routes/message.route.js"
import postRoutes from "./routes/post.route.js"
import trainingRoutes from "./routes/training.route.js"
import cors from "cors"
import path from "path"
import { Pay } from "@nkwa-pay/sdk"
import Training from "./models/training.model.js" // Import Training model

const app = express()
const port = 3000
const __dirname = path.resolve()

const allowedOrigins = ["http://localhost:5173", "https://jobive.vercel.app"]

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin like mobile apps or curl requests
      if (!origin) return callback(null, true)
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = "The CORS policy for this site does not allow access from the specified Origin."
        return callback(new Error(msg), false)
      }
      return callback(null, true)
    },
    credentials: true, // if you are sending cookies or auth headers
  }),
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Middleware to extract user ID from token (assuming JWT is used)
app.use((req, res, next) => {
  req.user = { _id: "dummyUserId" } // Dummy user ID for illustration
  next()
})

//Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/jobs", jobRoutes)
app.use("/api/payment", paymentRoutes) // Uncommented the payment routes
app.use("/api/messages", messageRoutes)
app.use("/api/posts", postRoutes)
app.use("/api/trainings", trainingRoutes)

const pay = new Pay({
  apiKeyAuth: "6re58Nb-hqT6jDuo3Oapb",
  serverURL: "https://api.pay.mynkwa.com",
  debugLogger: console,
})

// Collect payment endpoint
app.post("/collect-payment", async (req, res) => {
  try {
    const { amount, phoneNumber } = req.body

    if (!amount || !phoneNumber) {
      return res.status(400).json({
        success: false,
        error: "Amount and phoneNumber are required",
      })
    }

    const response = await pay.payments.collect({
      amount,
      phoneNumber,
    })

    res.json({
      success: true,
      data: response.payment,
    })
  } catch (err) {
    if (err.statusCode) {
      res.status(err.statusCode).json({
        success: false,
        error: err.message,
      })
    } else {
      res.status(500).json({
        success: false,
        error: "Internal server error",
      })
    }
  }
})

// Disburse payment endpoint
app.post("/disburse-payment", async (req, res) => {
  try {
    const { amount, phoneNumber } = req.body

    if (!amount || !phoneNumber) {
      return res.status(400).json({
        success: false,
        error: "Amount and phoneNumber are required",
      })
    }

    const response = await pay.payments.disburse({
      amount,
      phoneNumber,
    })

    res.json({
      success: true,
      data: response.payment,
    })
  } catch (err) {
    if (err.statusCode) {
      res.status(err.statusCode).json({
        success: false,
        error: err.message,
      })
    } else {
      res.status(500).json({
        success: false,
        error: "Internal server error",
      })
    }
  }
})

// Get payment status
app.get("/payment/:id", async (req, res) => {
  try {
    const response = await pay.payments.get(req.params.id)

    res.json({
      success: true,
      data: response.payment,
    })
  } catch (err) {
    if (err.statusCode) {
      res.status(err.statusCode).json({
        success: false,
        error: err.message,
      })
    } else {
      res.status(500).json({
        success: false,
        error: "Internal server error",
      })
    }
  }
})

// Training payment endpoint
app.post("/api/trainings/:id/purchase", async (req, res) => {
  try {
    const trainingId = req.params.id
    const { phoneNumber } = req.body
    const userId = req.user._id

    // Find the training program
    const training = await Training.findById(trainingId)

    if (!training) {
      return res.status(404).json({
        success: false,
        error: "Training program not found",
      })
    }

    // Check if user is already enrolled
    const alreadyEnrolled = training.enrolledUsers.some(
      (enrollment) => enrollment.user.toString() === userId.toString(),
    )

    if (alreadyEnrolled) {
      return res.status(400).json({
        success: false,
        error: "User is already enrolled in this training program",
      })
    }

    // Process payment
    const response = await pay.payments.collect({
      amount: training.price,
      phoneNumber,
    })

    // If payment is successful, enroll the user
    if (response.payment.status === "successful") {
      // Add user to enrolled users
      training.enrolledUsers.push({
        user: userId,
        enrolledAt: Date.now(),
        completedChapters: [],
      })

      // Increment total enrollments
      training.totalEnrollments += 1

      await training.save()

      return res.status(200).json({
        success: true,
        message: "Payment successful and enrolled in training program",
        data: response.payment,
      })
    }

    // If payment is pending, return the payment status
    return res.status(200).json({
      success: true,
      message: "Payment initiated",
      data: response.payment,
    })
  } catch (err) {
    if (err.statusCode) {
      res.status(err.statusCode).json({
        success: false,
        error: err.message,
      })
    } else {
      res.status(500).json({
        success: false,
        error: "Internal server error",
      })
    }
  }
})

if (ENV_VARS.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")))
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"))
  })
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
  connectDB()
})
