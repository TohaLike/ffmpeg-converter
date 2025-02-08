import { Worker } from "worker_threads"
import ApiError from "../exceptions/api-error.js";
import path from "path"
import fs from "fs"

const __dirname = import.meta.dirname;

class UploadService {

  async uploadFile(file) {
    const inputPath = path.resolve(file.path);
    const worker = new Worker(path.resolve(__dirname, "worker.js"), { workerData: { filePath: inputPath } });

    worker.on("message", (message) => {
      if (message.success) {
        console.log({ message: "File converted successfully", filename: message.downloadUrl });
      } else {
        console.log({ error: message.error });
      }
    });

    worker.on('error', (err) => {
      console.log({ error: "Worker error: " + err.message });
    });

    return file
  }


  async downloadFile(filename) {
    const outputPath = path.join("converted", filename);

    if (!outputPath) throw ApiError.FileNotFound()

    const fileStream = fs.createReadStream(outputPath);

    return fileStream
  }

}

export const uploadService = new UploadService()