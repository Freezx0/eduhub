import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { Course, FeedbackLog, PlatformVideo, PromoEvent, SiteContent } from "./src/types.js";

if (fs.existsSync(".env.local")) {
  dotenv.config({ path: ".env.local" });
} else {
  dotenv.config();
}

const app = express();
app.use(express.json({ limit: "50mb" }));

const PORT = 3000;
const DATA_DIR = path.resolve("./data");
const COURSES_PATH = path.join(DATA_DIR, "courses.json");
const SITE_CONTENT_PATH = path.join(DATA_DIR, "site-content.json");
const FEEDBACKS_PATH = path.join(DATA_DIR, "feedbacks.json");

fs.mkdirSync(DATA_DIR, { recursive: true });

// ─── helpers ────────────────────────────────────────────────────────────────
function readJson<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
    }
  } catch (e) { console.warn("readJson error", filePath, e); }
  return fallback;
}
function writeJson(filePath: string, data: unknown) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// ─── in-memory state (hydrated from disk) ───────────────────────────────────
const defaultCourses: Course[] = [];

const defaultSiteContent: SiteContent = {
  videos: [],
  events: [
    { id: "ev-1", imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop", description: "IT-Олимпиада — соревнование по программированию. Победители получат +500 монет!" },
    { id: "ev-2", imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=400&fit=crop", description: "Хакатон ИИ-Кураторы — создайте собственного помощника." },
    { id: "ev-3", imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop", description: "Новые курсы по Machine Learning уже доступны в каталоге лекций." },
  ]
};

let courses: Course[] = readJson(COURSES_PATH, defaultCourses);
let siteContent: SiteContent = readJson(SITE_CONTENT_PATH, defaultSiteContent);
let feedbacks: FeedbackLog[] = readJson(FEEDBACKS_PATH, []);

function saveCourses() { writeJson(COURSES_PATH, courses); }
function saveSiteContent() { writeJson(SITE_CONTENT_PATH, siteContent); }
function saveFeedbacks() { writeJson(FEEDBACKS_PATH, feedbacks); }

// ─── YouTube ID extractor ───────────────────────────────────────────────────
function extractYoutubeId(input: string): string | null {
  const t = input.trim();
  if (!t) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(t)) return t;
  try {
    const url = new URL(t.startsWith("http") ? t : `https://${t}`);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return url.pathname.slice(1).split("?")[0].slice(0, 11) || null;
    if (host.includes("youtube.com")) {
      const v = url.searchParams.get("v");
      if (v) return v.slice(0, 11);
      const m = url.pathname.match(/\/(embed|shorts|v)\/([a-zA-Z0-9_-]{11})/);
      if (m) return m[2];
    }
  } catch { /* ignore */ }
  return null;
}

// ─── Gemini API helper ──────────────────────────────────────────────────────
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not defined");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': "aistudio-build",
        }
      }
    });
  }
  return aiClient;
}

// In-memory stats state for interactive updates
let totalQuizzesTaken = 0;
let totalScoresSumPct = 0;

// Stats
app.get("/api/stats", (_req, res) => {
  res.json({
    coursesCount: courses.length,
    aiGenerationsCount: courses.filter(c => c.createdWithAI).length,
    quizzesTakenCount: totalQuizzesTaken,
    averageQuizScorePct: totalQuizzesTaken > 0 ? Math.round(totalScoresSumPct / totalQuizzesTaken) : 0,
    feedbacksCount: feedbacks.length,
  });
});

app.post("/api/quizzes/submit", (req, res) => {
  try {
    const { score, maxScore } = req.body;
    if (typeof score === "number" && typeof maxScore === "number" && maxScore > 0) {
      totalQuizzesTaken += 1;
      const pct = (score / maxScore) * 100;
      totalScoresSumPct += pct;
    }
    res.json({ success: true, quizzesTakenCount: totalQuizzesTaken, averageQuizScorePct: totalQuizzesTaken > 0 ? Math.round(totalScoresSumPct / totalQuizzesTaken) : 0 });
  } catch (e) {
    res.status(500).json({ error: "Ошибка сохранения результатов" });
  }
});

// Courses
app.get("/api/courses", (_req, res) => res.json(courses));

app.post("/api/courses", (req, res) => {
  const c = req.body as Course;
  if (!c || !c.id) return res.status(400).json({ error: "Invalid course" });
  courses = courses.filter(x => x.id !== c.id);
  courses.unshift(c);
  saveCourses();
  res.status(201).json(c);
});

app.delete("/api/courses/:id", (req, res) => {
  const before = courses.length;
  courses = courses.filter(c => c.id !== req.params.id);
  if (courses.length < before) { saveCourses(); res.json({ success: true }); }
  else res.status(404).json({ error: "Курс не найден" });
});

// Feedback
app.get("/api/feedback", (_req, res) => res.json(feedbacks));

app.post("/api/feedback", (req, res) => {
  const fb: FeedbackLog = {
    id: "fb-" + Date.now(),
    courseId: req.body.courseId,
    courseTitle: req.body.courseTitle,
    userName: req.body.userName || "Студент",
    rating: req.body.rating || 5,
    comment: req.body.comment || "",
    date: new Date().toISOString(),
  };
  feedbacks.unshift(fb);
  saveFeedbacks();
  res.status(201).json(fb);
});

// ─── AI Course generation with Gemini ──────────────────────────────────────────
app.post("/api/courses/generate", async (req, res) => {
  try {
    const { topic, difficulty } = req.body;
    if (!topic) return res.status(400).json({ error: "Тема курса обязательна!" });

    const systemPrompt = `Ты — эксперт-преподаватель. Создаёшь качественные учебные курсы. 
Отвечай ТОЛЬКО валидным JSON без markdown, без \`\`\`json, без комментариев.`;

    const userPrompt = `Создай учебный курс на тему: "${topic}". Уровень: ${difficulty || "Beginner"}.

Верни JSON строго по этой структуре:
{
  "title": "Название курса",
  "description": "Краткое описание курса",
  "category": "Категория",
  "difficulty": "Beginner",
  "lessons": [
    {
      "title": "Название урока",
      "description": "Краткое превью",
      "content": "Подробный текст лекции минимум 300 слов с теорией, примерами и объяснениями",
      "estimatedTime": 15,
      "parts": [
        {"type": "text", "content": "Пояснение"},
        {"type": "code", "content": "пример кода или формулы", "metadata": "python"},
        {"type": "tip", "content": "Полезный совет"}
      ]
    }
  ],
  "quizzes": [
    {
      "question": "Текст вопроса?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "explanation": "Объяснение правильного ответа"
    }
  ]
}

Требования:
- Ровно 3 урока (lessons)
- Ровно 10 вопросов (quizzes) — полноценная проверка знаний
- В каждом уроке 3 блока в parts (text, code/warning/tip)
- Все тексты на русском языке
- correctAnswer должен точно совпадать с одной из строк в options`;

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json"
      }
    });

    const raw = response.text || "{}";
    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    const generatedCourse: Course = {
      id: "course-ai-" + Date.now(),
      title: parsed.title || `Курс: ${topic}`,
      description: parsed.description || "",
      category: parsed.category || "Общее",
      difficulty: parsed.difficulty || difficulty || "Beginner",
      lessons: (parsed.lessons || []).map((l: any, idx: number) => ({
        id: `ai-l-${Date.now()}-${idx}`,
        title: l.title || `Урок ${idx + 1}`,
        description: l.description || "",
        content: l.content || "",
        parts: l.parts || [],
        estimatedTime: Number(l.estimatedTime) || 12
      })),
      quizzes: (parsed.quizzes || []).map((q: any, idx: number) => ({
        id: `ai-q-${Date.now()}-${idx}`,
        question: q.question,
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || ""
      })),
      createdWithAI: true,
      promptUsed: topic,
      createdAt: new Date().toISOString()
    };

    courses.unshift(generatedCourse);
    saveCourses();
    res.status(201).json(generatedCourse);
  } catch (error: any) {
    console.error("Course generation error:", error);
    res.status(500).json({ error: error.message || "Ошибка генерации курса" });
  }
});

// ─── Gemini Web Translator Endpoint ──────────────────────────────────
app.post("/api/ai/translate", async (req, res) => {
  try {
    const { text, from, to } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required" });

    const ai = getGeminiClient();
    const userPrompt = `Translate the following text from ${from || "auto"} to ${to}. Return ONLY the translated text, nothing else, no explanations:

${text}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt
    });

    res.json({
      content: [
        { type: "text", text: response.text || "" }
      ]
    });
  } catch (error: any) {
    console.error("Translation error:", error);
    res.status(500).json({ error: error.message || "Ошибка перевода" });
  }
});

// ─── Gemini AI Worker / intelligent Companion ──────────────────────────────────
app.post("/api/ai/worker", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages)) return res.status(400).json({ error: "messages must be an array" });

    const ai = getGeminiClient();
    const systemInstruction = "Ты Райдер (Rider AI) — высококвалифицированный, взрослый, серьезный и лаконичный ИИ-консультант для студентов образовательной платформы ISA. Ты отвечаешь строго по сути, без «воды», приветствий и лишней вежливости. Давай исключительно ценные технические факты, глубокие объяснения и конкретные решения с кодом или формулами на языке пользователя (русский, узбекский, английский). Твой тон — строгий, авторитетный, профессиональный.";

    const contents = messages.map(m => {
      const role = m.role === "assistant" ? "model" : "user";
      const text = typeof m.text === "string" ? m.text : "";
      return {
        role,
        parts: [{ text }]
      };
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction
      }
    });

    res.json({
      content: [
        { type: "text", text: response.text || "" }
      ]
    });
  } catch (error: any) {
    console.error("AI worker error:", error);
    res.status(500).json({ error: error.message || "Ошибка ассистента" });
  }
});

// ─── tutor chat & Smart search seek ──────────────────────────────────────────────────
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { messages, currentTopic, systemInstruction } = req.body;
    if (!Array.isArray(messages)) return res.status(400).json({ error: "messages must be an array" });

    const ai = getGeminiClient();
    let instruction = systemInstruction || "Ты Райдер (Rider AI) — взрослый, лаконичный искусственный интеллект-консультант. Ты даешь исключительно ценную информацию, только важную выжимку фактов по теме проекта, приводишь полезные формулы и примеры кода без лишних слов. Отвечай лаконично, авторитетно и глубоко на русском языке.";
    if (currentTopic) {
      instruction += ` Контекст текущего урока/темы: "${currentTopic}".`;
    }

    const contents = messages.map(m => {
      const role = m.role === "assistant" || m.role === "model" ? "model" : "user";
      const text = typeof m.content === "string" ? m.content : (m.text || "");
      return {
        role,
        parts: [{ text }]
      };
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction: instruction
      }
    });

    res.json({
      content: response.text || ""
    });
  } catch (error: any) {
    console.error("AI chat error:", error);
    res.status(500).json({ error: error.message || "Ошибка чата" });
  }
});

// ─── Duolingo Gamified course generator ───────────────────────────────────────────
app.post("/api/courses/generate-duolingo", async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) return res.status(400).json({ error: "Тема обязательна" });

    const ai = getGeminiClient();
    const systemPrompt = `Ты — эксперт-методист Duolingo. Создаёшь интерактивные игровые микро-уроки.
Отвечай ТОЛЬКО валидным JSON без markdown, без комментариев.`;

    const userPrompt = `Создай интерактивный микро-урок Duolingo на тему: "${topic}".
Верни JSON строго по этой структуре:
{
  "title": "Название игрового урока",
  "description": "Краткое игровое описание",
  "category": "Интерактивная практика",
  "difficulty": "Beginner",
  "lessons": [
    {
      "id": "lesson-duo-1",
      "title": "Игровая практика",
      "description": "Пройди короткие упражнения",
      "content": "Вводная игровая сессия",
      "parts": [
        {
          "type": "duolingo_game",
          "gameQuestion": "Вопрос для перевода или выбора (например, 'Какое ключевое слово используется для объявления переменной в Python?')",
          "gameOptions": ["option A", "option B", "option C", "option D"],
          "gameAnswer": "правильный ответ в точности",
          "metadata": "Пояснение, почему этот ответ правильный."
        },
        {
          "type": "duolingo_game",
          "gameQuestion": "Второй игровой вопрос по теме",
          "gameOptions": ["option A", "option B", "option C", "option D"],
          "gameAnswer": "правильный ответ в точности",
          "metadata": "Пояснение к ответу."
        },
        {
          "type": "duolingo_game",
          "gameQuestion": "Третий игровой вопрос по теме",
          "gameOptions": ["option A", "option B", "option C", "option D"],
          "gameAnswer": "правильный ответ в точности",
          "metadata": "Пояснение к ответу."
        }
      ]
    }
  ],
  "quizzes": []
}

Требования:
- Все тексты на русском языке.
- gameAnswer должен абсолютно точно совпадать с одной из строк в gameOptions.
- parts должен содержать ровно 3 или 4 игровых вопроса дуолинго.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json"
      }
    });

    const raw = response.text || "{}";
    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    res.json(parsed);
  } catch (error: any) {
    console.error("Duolingo generation error:", error);
    res.status(500).json({ error: error.message || "Ошибка генерации интерактивного урока" });
  }
});

// ─── Interactive AI Voice Lesson Explainer ────────────────────────────────────
app.post("/api/courses/voice-explain", async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) return res.status(400).json({ error: "Тема урока обязательна" });

    const ai = getGeminiClient();
    const systemPrompt = `Ты — высококвалифицированный, взрослый, опытный и крайне лаконичный ИИ-преподаватель Райдер (Rider). Твоя речь лишена "воды", пустых вступлений и приветствий. Ты говоришь только нужные факты, суть и глубокую профессиональную информацию в серьезном деловом тоне. На каждый вопрос давай максимально эффективную выжимку, сохраняя высокую концентрацию экспертного знания.
Отвечай строго валидным JSON без markdown, без разметки \`\`\`json, без комментариев.`;

    const userPrompt = `Создай интерактивный аудио-урок на тему: "${topic}".
Объясни суть темы максимально концентрированно, профессионально и экспертно. Никаких лишних слов, дай только самую полезную информацию и фундаментальные факты, которые действительно важны специалисту.
Раздели объяснение на 3-5 коротких, информационно насыщенных абзацев (paragraphs). Каждый абзац должен быть емким и удобным для озвучивания (Text-to-Speech).

Затем добавь ровно 10 проверочных вопросов (questions) по всем аспектам этой темы для детального закрепления материала на практике.

Верни JSON строго по следующей структуре:
{
  "topic": "Название темы",
  "paragraphs": [
    "Первый абзац объяснения",
    "Второй абзац объяснения",
    "Третий абзац объяснения"
  ],
  "questions": [
    {
      "question": "Текст сложного тестового вопроса или практического примера",
      "options": ["Вариант A", "Вариант B", "Вариант C", "Вариант D"],
      "correctAnswer": "Вариант A",
      "explanation": "Подробный разбор, почему этот ответ верный"
    }
  ]
}

Требования:
- Все тексты на русском языке.
- Объяснения должны быть профессиональными, зрелыми и без "воды".
- 'correctAnswer' должен в точности совпадать с одним из вариантов в 'options'.
- 'questions' должен содержать ровно 10 вопросов для всесторонней и глубокой проверки знаний.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json"
      }
    });

    const raw = response.text || "{}";
    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    res.json(parsed);
  } catch (error: any) {
    console.error("Voice lesson generation error:", error);
    res.status(500).json({ error: error.message || "Ошибка генерации аудио-урока" });
  }
});

// ─── Real YouTube Video Search using Google Search Grounding ───────────────────────
app.post("/api/youtube/search", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Query is required" });

    const ai = getGeminiClient();

    const userPrompt = `Найди 3 лучших обучающих видеоурока на YouTube по теме: "${query}".
Твой ответ должен основываться на реальных результатах поиска.
Верни ТОЛЬКО JSON-массив объектов следующей структуры:
[
  {
    "id": "создай уникальный id",
    "title": "Название видео",
    "description": "Описание о чем видео",
    "youtubeId": "реальный 11-символьный id видео с YouTube"
  }
]
Не используй markdown-разметку, пиши только чистый JSON-массив.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      }
    });

    const raw = response.text || "[]";
    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    // Map to PlatformVideo array with real video ID fallback or direct ground identifiers
    const videos = (Array.isArray(parsed) ? parsed : []).map((v: any, idx: number) => ({
      id: v.id || `ai-yt-${Date.now()}-${idx}`,
      title: v.title || "Обучающее видео",
      description: v.description || "",
      duration: "—",
      instructor: "YouTube Эксперт",
      views: Math.floor(Math.random() * 5000) + 1200,
      category: "YouTube Поиск",
      thumbnailText: "Видео",
      youtubeId: v.youtubeId || "dQw4w9WgXcQ", // fallback to a known video if missing
      videoUrl: v.youtubeId ? `https://www.youtube.com/watch?v=${v.youtubeId}` : undefined,
      sourceType: "youtube" as const,
      createdAt: new Date().toISOString()
    }));

    res.json(videos);
  } catch (error: any) {
    console.error("YouTube search error:", error);
    res.status(500).json({ error: error.message || "Ошибка поиска видео" });
  }
});

// ─── Site content: videos & events ──────────────────────────────────────────
app.get("/api/site/content", (_req, res) => res.json(siteContent));

app.post("/api/site/videos", (req, res) => {
  try {
    const { title, description, url, fileData } = req.body;
    const link = String(url || "").trim();
    const youtubeId = extractYoutubeId(link);
    const isDataUrl = typeof fileData === "string" && fileData.startsWith("data:");

    let sourceType: PlatformVideo["sourceType"] = "url";
    let finalVideoUrl: string | undefined;
    let finalYoutubeId: string | undefined;

    if (youtubeId) { sourceType = "youtube"; finalYoutubeId = youtubeId; }
    else if (isDataUrl) { sourceType = "upload"; finalVideoUrl = fileData; }
    else if (link) { sourceType = "url"; finalVideoUrl = link; }
    else return res.status(400).json({ error: "Укажите ссылку или загрузите файл" });

    const video: PlatformVideo = {
      id: "vid-" + Date.now(),
      title: title || "Новый видеоурок",
      description: description || "",
      duration: "—", instructor: "Администратор", views: 0,
      category: "Общее", thumbnailText: "Видео",
      youtubeId: finalYoutubeId,
      videoUrl: finalVideoUrl,
      sourceType,
      createdAt: new Date().toISOString(),
    };
    siteContent.videos.unshift(video);
    saveSiteContent();
    res.status(201).json(video);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.delete("/api/site/videos/:id", (req, res) => {
  const before = siteContent.videos.length;
  siteContent.videos = siteContent.videos.filter(v => v.id !== req.params.id);
  if (siteContent.videos.length < before) { saveSiteContent(); res.json({ success: true }); }
  else res.status(404).json({ error: "Видео не найдено" });
});

app.post("/api/site/events", (req, res) => {
  try {
    const { imageUrl, description } = req.body;
    const event: PromoEvent = {
      id: "ev-" + Date.now(),
      imageUrl: imageUrl || "",
      description: description || "",
    };
    siteContent.events.unshift(event);
    saveSiteContent();
    res.status(201).json(event);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.put("/api/site/events", (req, res) => {
  try {
    const { events } = req.body;
    if (!Array.isArray(events)) return res.status(400).json({ error: "events должен быть массивом" });
    siteContent.events = events.map((e: PromoEvent, idx: number) => ({
      id: e.id || "ev-" + Date.now() + "-" + idx,
      imageUrl: e.imageUrl || "",
      description: e.description || "",
    }));
    saveSiteContent();
    res.json(siteContent.events);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.delete("/api/site/events/:id", (req, res) => {
  const before = siteContent.events.length;
  siteContent.events = siteContent.events.filter(e => e.id !== req.params.id);
  if (siteContent.events.length < before) { saveSiteContent(); res.json({ success: true }); }
  else res.status(404).json({ error: "Событие не найдено" });
});

// ─── Start server with appropriate state handles ──────────────────────────────
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve("./dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n✅ Server running at http://localhost:${PORT}`);
    console.log(`📁 Data saved in: ${DATA_DIR}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
});
