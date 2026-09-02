import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Загружаем .env из корня проекта
dotenv.config({ path: resolve(__dirname, '../.env') });

const app = express();
app.use(cors());
app.use(express.json());

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const API_KEY = process.env.VITE_OPENROUTER_API_KEY;

if (!API_KEY) {
  console.error('❌ API ключ не найден! Создай файл .env в корне проекта с VITE_OPENROUTER_API_KEY');
  process.exit(1);
}

app.post('/api/generate', async (req, res) => {
  try {
    const response = await axios.post(
      OPENROUTER_URL,
      req.body,
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('❌ Ошибка прокси:', error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Ошибка сервера' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ Сервер запущен на http://localhost:${PORT}`);
});