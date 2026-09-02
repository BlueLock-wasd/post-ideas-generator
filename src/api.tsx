import axios from 'axios';

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const MODEL = 'openai/gpt-3.5-turbo';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function generateAIResponse(prompt: string): Promise<string | null> {
  try {
    const response = await axios.post(
      OPENROUTER_URL,
      {
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: 'Ты — креативный помощник. Отвечай строго в формате: "Заголовок: описание". Каждая идея с новой строки. Без кавычек, без маркеров, без лишнего текста.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content || null;
  } catch (error) {
    console.error('Ошибка при запросе к OpenRouter:', error);
    return null;
  }
}

export async function generateAIIdeas(
  tone: string,
  quantity: number,
  customPrompt?: string
): Promise<{ title: string; description: string }[]> {
  const prompt = customPrompt
    ? `Сгенерируй ровно ${quantity} идей для поста на тему: "${customPrompt}". Тональность: ${tone}.
    **Правила:**
    1. Каждая идея строго в формате: "Заголовок: описание"
    2. Заголовок — 3-7 слов
    3. Описание — 1 короткое предложение (5-10 слов)
    4. Без кавычек, без звёздочек, без маркеров
    5. Каждая идея с новой строки

    Пример:
    Секреты продуктивного утра: Как правильно начать день и всё успевать.
    Искусство отдыха: Почему перерывы повышают эффективность.

    Твои идеи:`
    : `Сгенерируй ровно ${quantity} идей для поста с тональностью "${tone}".
    **Правила:**
    1. Каждая идея строго в формате: "Заголовок: описание"
    2. Заголовок — 3-7 слов
    3. Описание — 1 короткое предложение (5-10 слов)
    4. Без кавычек, без звёздочек, без маркеров
    5. Каждая идея с новой строки

    Пример:
    Секреты продуктивного утра: Как правильно начать день и всё успевать.
    Искусство отдыха: Почему перерывы повышают эффективность.

    Твои идеи:`;

  try {
    const aiResponse = await generateAIResponse(prompt);
    console.log('✅ Сырой ответ от AI:', aiResponse);

    if (!aiResponse) {
      throw new Error('AI вернул пустой ответ');
    }

    const lines = aiResponse.split('\n').filter(line => line.trim());
    const ideas: { title: string; description: string }[] = [];

    for (const line of lines) {
      let cleaned = line.trim();
      cleaned = cleaned.replace(/^[\d]+[\.\)]\s*/, '');
      cleaned = cleaned.replace(/^[\*\-]\s*/, '');
      cleaned = cleaned.replace(/\*\*/g, '');
      cleaned = cleaned.replace(/^["']|["']$/g, '');

      const matchColon = cleaned.match(/^(.+?)[:：]\s*(.+)$/);
      const matchDot = cleaned.match(/^(.+?)[.．]\s*(.+)$/);
      const matchDash = cleaned.match(/^(.+?)\s*[-–—]\s*(.+)$/);

      if (matchColon) {
        ideas.push({ title: matchColon[1].trim(), description: matchColon[2].trim() });
      } else if (matchDot) {
        ideas.push({ title: matchDot[1].trim(), description: matchDot[2].trim() });
      } else if (matchDash) {
        ideas.push({ title: matchDash[1].trim(), description: matchDash[2].trim() });
      } else if (cleaned) {
        const parts = cleaned.match(/^(.+?)[.!?]\s+(.+)/);
        if (parts) {
          ideas.push({ title: parts[1].trim(), description: parts[2].trim() });
        } else {
          ideas.push({ title: cleaned, description: 'Описание идеи от нейросети' });
        }
      }
    }

    while (ideas.length < quantity) {
      ideas.push({ title: '✨ Новая идея', description: 'Описание идеи от нейросети' });
    }

    return ideas.slice(0, quantity);
  } catch (error) {
    console.error('❌ Ошибка в generateAIIdeas:', error);
    return [];
  }
}