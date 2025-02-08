import express from "express"
import multer from "multer";
import path from "path"
import { routers } from "./routers/index.js";
import { errorMiddleware } from "./middlewares/error-middleware.js";
import ApiError from "./exceptions/api-error.js";

const PORT = 4000;
const app = express()

app.use(express.json())

const fileConfig = multer.diskStorage({
  destination: (req, res, cb) => {
    cb(null, "./uploads")
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}.mp4`);
  }
})

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname)
  if (ext !== ".mov") {
    return cb(ApiError.BadRequest("Только .mov формат"))
  }
  cb(null, true)
}

app.use(multer({
  storage: fileConfig,
  limits: 2 * 1024 * 1024 * 1024,
  fileFilter: fileFilter
}).single("file"))

app.use("/api", routers)

app.use(errorMiddleware)

const main = async () => {
  try {
    app.listen(PORT, () => console.log(`Server has been started ${PORT}`))
  } catch (e) {
    console.log(e)
  }
}

main()