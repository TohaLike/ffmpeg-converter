import { Worker } from "worker_threads"
import ApiError from "../exceptions/api-error.js";
import path from "path"
import fs from "fs"

const __dirname = import.meta.dirname;

class UploadService {

  uploadFile(file) {
    return new Promise((resolve, reject) => {
      const inputPath = path.resolve(file.path);

      if (!fs.existsSync("converted")) fs.mkdirSync("converted", { recursive: true })

      const worker = new Worker(path.resolve(__dirname, "worker.js"), { workerData: { filePath: inputPath } });

      worker
        .on("message", (message) => {
          if (message.success) {
            resolve({ message: message.message, filename: message.downloadUrl });
            worker.terminate();
          }
        })
        .on("error", (error) => {
          reject(ApiError.ServerError(error.message));
          worker.terminate();
        });
    })
  }


  downloadFile(filename) {
    return new Promise((resolve, reject) => {
      const outputPath = path.join("converted", filename);

      const fileStream = fs.createReadStream(outputPath);

      fileStream
        .on("open", () => {
          resolve(fileStream);
          fs.unlinkSync(outputPath);
        })
        .on("error", () => reject(ApiError.FileNotFound()))
    })
  }
}

export const uploadService = new UploadService()