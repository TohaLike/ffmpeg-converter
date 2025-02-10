export default class ApiError extends Error {
  status;
  errors;

  constructor(status, message, errors = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  static BadRequest(message, errors = []) {
    return new ApiError(400, message, errors)
  }

  static FileFormatError() {
    return new ApiError(415, "Только .mov формат")
  }

  static FileSizeLimit() {
    return new ApiError(413, "Размер файла превышает ограничение в 2 ГБ")
  }

  static FileNotFound() {
    return new ApiError(404, "Файл не найден")
  }

  static ServerError(message, errors = []) {
    return new ApiError(500, message, errors)
  }
}