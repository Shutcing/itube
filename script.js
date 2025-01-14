/**
 * server.js
 * 
 * Простой Node.js-сервер, который стримит YouTube-видео в формате MP4 (360p).
 * 
 * Перед запуском установите зависимости:
 *   npm install express ytdl-core
 */

const express = require("express");
const ytdl = require("ytdl-core");

const app = express();
const PORT = 8000;

/**
 * Пример запроса:
 *   GET /stream_video?url=https://www.youtube.com/watch?v=VIDEO_ID
 */
app.get("/stream_video", async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) {
    return res.status(400).json({ error: "No URL provided" });
  }

  try {
    // Сначала получим метаданные, чтобы извлечь title
    const info = await ytdl.getInfo(videoUrl);
    // Заменим символы, которые не подходят для имени файла
    const safeTitle = (info.videoDetails.title || "video").replace(/[\\/:*?"<>|]/g, "_");

    // Указываем клиенту, что это mp4-видео и какое имя файла
    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Content-Disposition", `attachment; filename="${safeTitle}.mp4"`);

    // ytdl-core сам найдёт нужный формат по качеству (18 => 360p mp4)
    const stream = ytdl(videoUrl, { quality: "18" });
    stream.on("error", (err) => {
      console.error("Stream error:", err);
      res.status(500).end("Stream error");
    });

    // Pipe: читаем поток из ytdl &rarr; отправляем клиенту
    stream.pipe(res);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Запускаем сервер
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
  console.log("Use /stream_video?url=https://www.youtube.com/watch?v=... to stream a video");
});
