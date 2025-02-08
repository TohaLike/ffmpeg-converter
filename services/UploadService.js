import ApiError from "../exceptions/api-error.js";
import ffmpeg from "fluent-ffmpeg";
import path from "path"
import fs from "fs"
import Progress from "progress"
import { Worker } from "worker_threads"

const __dirname = import.meta.dirname;

class UploadService {

  async uploadFile(file, req) {
    const inputPath = path.resolve(file.path);

    const worker = new Worker(path.resolve(__dirname, 'worker.js'), { workerData: { filePath: inputPath } });

    worker.on('message', (message) => {
      console.log(message)
      // if (message.success) {
      //   res.json({ message: 'File converted successfully', filename: message.outputFile });
      // } else {
      //   console.log({ error: message.error });
      // }
    });

    // worker.on('error', (err) => {
    //   console.log({ error: 'Worker error: ' + err.message });
    // });

    return file
  }


  async downloadFile(filename) {
    const outputPath = path.join('converted', filename);

    if (!outputPath) throw ApiError.FileNotFound()

    const fileStream = fs.createReadStream(outputPath);

    return fileStream
  }

}

export const uploadService = new UploadService()