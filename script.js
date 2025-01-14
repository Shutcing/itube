const express = require('express');
const ytdl = require('ytdl-core');
const cors = require('cors');

const app = express();
app.use(cors());

// Маршрут, обрабатывающий GET-запрос /stream_video
app.get('/stream_video', async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) {
    return res.status(400).json({ error: 'No URL provided' });
  }

  try {
    // Получаем полную информацию о видео
    const info = await ytdl.getInfo(videoUrl);
    // Выбираем формат 18 (360p). Для ytdl-core это либо явный выбор качества, либо через chooseFormat.
    const format360p = ytdl.chooseFormat(info.formats, { quality: '18' });
    if (!format360p || !format360p.url) {
      return res.status(404).json({ error: 'No suitable stream found' });
    }

    // Формируем название файла (убираем слэши, чтобы не ломать заголовок)
    const safeTitle = info.videoDetails.title.replace(/[\\/]/g, '_');
    const fileName = `${safeTitle}.mp4`;

    // Отправляем соответствующие заголовки
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Создаём поток с видео (360p)
    const videoStream = ytdl(videoUrl, { format: '18' });
    // Отдаём поток клиенту
    videoStream.pipe(res);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
