import { parentPort, workerData } from "worker_threads";
import ffmpeg from "fluent-ffmpeg";
import path from "path";
import fs from "fs"

const { filePath } = workerData;

const outputFilename = `${Date.now()}.mp4`;
const outputPath = path.join('converted', outputFilename);
let totalTime = 0;

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
  .on("codecData", data => {
    totalTime = parseInt(data.duration.replace(/:/g, ''))
  })
  .on("progress", (progress) => {
    const time = parseInt(progress.timemark.replace(/:/g, ''))
    const percent = (time / totalTime) * 100

    // console.log(parseInt(percent))
    
    process.stdout.write("\x1Bc"); // Очистка консоли

    process.stdout.write(`\r${drawProgressBar(parseInt(percent))}`)
  })
  .on("end", (end) => {
    fs.unlinkSync(filePath);
    parentPort.postMessage({ message: 'File converted', downloadUrl: `/converted/${outputFilename}` });
  })
  .on("error", (err) => {
    fs.unlinkSync(filePath);
    parentPort.postMessage({ error: `Conversion error: ${err.message}` });
  })
  .output(outputPath)
  .run();

