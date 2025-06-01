import multer from "multer"
import path from "path"
import fs from "fs"

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), "uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/")
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  },
})

// File filter
const fileFilter = (req, file, cb) => {
  // Accept images, videos, and documents
  const allowedFileTypes = /jpeg|jpg|png|gif|mp4|pdf|doc|docx|ppt|pptx|xls|xlsx/
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = allowedFileTypes.test(file.mimetype)

  if (extname && mimetype) {
    return cb(null, true)
  } else {
    cb(new Error("Only images, videos, and documents are allowed!"), false)
  }
}

// Create multer upload instance
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter,
})

export default upload
