import { Router } from "express";
import { uploadController } from "../controllers/UploadController.js";

const router = new Router();

router.post("/upload", uploadController.UploadFile)

router.get("/download/:filename", uploadController.DownloadFile)

export const routers = router