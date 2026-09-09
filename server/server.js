import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { OpenRouter } from '@openrouter/sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../.env') });

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.VITE_OPENROUTER_API_KEY;

if (!API_KEY) {
  console.error('❌ API ключ не найден!');
  process.exit(1);
}

// Инициализируем OpenRouter SDK
const openrouter = new OpenRouter({
  apiKey: API_KEY,
});

app.post('/api/generate', async (req, res) => {
  try {
    console.log('📤 Запрос получен');

    const { model, messages, max_tokens, temperature } = req.body;

    // ✅ Правильный формат для SDK
    const completion = await openrouter.chat.send({
      chatRequest: {
        model: model || 'openai/gpt-3.5-turbo',
        messages: messages || [],
        max_tokens: max_tokens || 300,
        temperature: temperature || 0.7,
      }
    });

    console.log('✅ Ответ получен');
    res.json(completion);
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    console.error('📄 Детали:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ Сервер запущен на http://localhost:${PORT}`);
});