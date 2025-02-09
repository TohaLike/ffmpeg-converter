import { parentPort, workerData } from "worker_threads";
import ffmpeg from "fluent-ffmpeg";
import path from "path";
import fs from "fs"

const { filePath } = workerData;

const outputFilename = `${Date.now()}.mp4`;
const outputPath = path.join('converted', outputFilename);

// Сделал progress bar для себя, мне надо было узнать насколько быстро конвертируется видео
const drawProgressBar = (progress) => {
  const barWidth = 30;
  const filledWidth = Math.floor(progress / 100 * barWidth);
  const emptyWidth = barWidth - filledWidth;
  const progressBar = '█'.repeat(filledWidth) + '▒'.repeat(emptyWidth);
  return `[${progressBar}] ${progress}%`;
}

ffmpeg(filePath)
  .videoCodec("h264_videotoolbox")
  .size("1280x720")
  .audioCodec("copy")
  .outputOptions([
    "-b:v 800k", // Снижение битрейта
    "-b:a 128k", // Снижение битрейта аудио
    "-vf scale=1280:-1", // Уменьшение разрешения
    "-r 30", // Понижение FPS
    "-c:v h264_videotoolbox", // Использование GPU (на Mac)
  ])
  .on("start", () => {
    console.log("Start converting")
  })
  .on("progress", (progress) => {
    process.stdout.write(`\r${drawProgressBar(parseInt(progress.percent))}`)
  })
  .on("end", () => {
    process.stdout.write("\r\x1b[K")
    fs.unlinkSync(filePath);
    parentPort.postMessage({ success: true, message: 'File converted', downloadUrl: `/api/download/${outputFilename}` });
  })
  .on("error", (err) => {
    process.stdout.write("\r\x1b[K")
    fs.unlinkSync(filePath);
    parentPort.postMessage({ success: true, error: `Conversion error: ${err.message}` });
  })
  .output(outputPath)
  .run();


