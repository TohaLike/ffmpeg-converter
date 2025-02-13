import { uploadService } from "../services/UploadService.js"

class UploadController {
  async UploadFile(req, res, next) {
    try {
      const { file } = req;

      const fileData = await uploadService.uploadFile(file);

      return res.json(fileData)
    } catch (e) {
      next(e)
    }
  }


  async DownloadFile(req, res, next) {
    try {
      const { filename } = req.params;

      const downloadData = await uploadService.downloadFile(filename);

      return downloadData.pipe(res)
    } catch (e) {
      next(e)
    }
  }
}

export const uploadController = new UploadController()