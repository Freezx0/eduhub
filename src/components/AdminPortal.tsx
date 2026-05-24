import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Video, Image as ImageIcon, BookOpen, Sparkles, Trash2, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { AdminTabId, SiteContent, Course } from "../types";
import AdminMediaPanel from "./AdminMediaPanel";

interface AdminPortalProps {
  siteContent: SiteContent;
  initialTab?: AdminTabId;
  onInitialTabConsumed?: () => void;
  onRefreshSiteContent: () => void;
  onExitToStudent: () => void;
}

export default function AdminPortal({
  siteContent, initialTab, onInitialTabConsumed, onRefreshSiteContent, onExitToStudent,
}: AdminPortalProps) {
  const [activeTab, setActiveTab] = useState<AdminTabId>(initialTab || "courses");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  // AI generation form
  const [aiTopic, setAiTopic] = useState("");
  const [aiDifficulty, setAiDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced">("Beginner");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuccess, setAiSuccess] = useState(false);

  useEffect(() => {
    if (initialTab) { setActiveTab(initialTab); onInitialTabConsumed?.(); }
  }, [initialTab]);

  useEffect(() => { if (activeTab === "courses") fetchCourses(); }, [activeTab]);

  const fetchCourses = async () => {
    setLoadingCourses(true);
    try {
      const res = await fetch("/api/courses");
      if (res.ok) setCourses(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoadingCourses(false); }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm("Удалить курс?")) return;
    await fetch(`/api/courses/${id}`, { method: "DELETE" });
    fetchCourses();
  };

  const handleGenerateCourse = async () => {
    if (!aiTopic.trim()) { setAiError("Введите тему курса"); return; }
    setAiGenerating(true);
    setAiError(null);
    setAiSuccess(false);
    try {
      const res = await fetch("/api/courses/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: aiTopic.trim(), difficulty: aiDifficulty }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка генерации");
      setAiTopic("");
      setAiSuccess(true);
      setTimeout(() => setAiSuccess(false), 4000);
      fetchCourses();
    } catch (err: any) {
      setAiError(err.message);
    } finally {
      setAiGenerating(false);
    }
  };

  const tabs = [
    { id: "courses" as AdminTabId, label: "Курсы", icon: BookOpen },
    { id: "videos" as AdminTabId, label: "Видео", icon: Video },
    { id: "events" as AdminTabId, label: "События", icon: ImageIcon },
  ];

  return (
    <div className="space-y-6 animate-fade-in p-1 text-isa-navy">
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-isa-border pb-5">
        <h1 className="text-2xl font-bold tracking-tight font-[family-name:var(--font-display)]">
          Панель администратора
        </h1>
        <p className="text-xs text-isa-muted">Управление курсами, видео и событиями</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-isa-gold-pale p-1 rounded-2xl border border-isa-gold/30">
        {tabs.map(tab => (
          <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-3 py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === tab.id ? "bg-white text-isa-navy shadow-sm" : "text-isa-muted hover:text-isa-navy"
            }`}>
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>

          {/* ── COURSES TAB ── */}
          {activeTab === "courses" && (
            <div className="space-y-6">
              {/* AI Generation */}
              <div className="isa-card p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-isa-gold" />
                  <h2 className="text-base font-bold text-isa-navy">Создать курс с AI</h2>
                </div>
                <p className="text-xs text-isa-muted">AI создаст 3 урока + 10 вопросов для теста на любую тему</p>

                <div className="space-y-3">
                  <input value={aiTopic} onChange={e => setAiTopic(e.target.value)}
                    placeholder="Тема курса (например: Основы SQL, История Узбекистана, Алгебра)"
                    className="w-full text-sm p-3 border border-isa-border rounded-xl" />

                  <div className="flex gap-2">
                    {(["Beginner", "Intermediate", "Advanced"] as const).map(d => (
                      <button key={d} type="button" onClick={() => setAiDifficulty(d)}
                        className={`flex-1 py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                          aiDifficulty === d
                            ? "bg-isa-navy text-isa-gold-light border-isa-navy"
                            : "border-isa-border text-isa-muted hover:border-isa-navy/40"
                        }`}>
                        {d === "Beginner" ? "Начальный" : d === "Intermediate" ? "Средний" : "Продвинутый"}
                      </button>
                    ))}
                  </div>

                  {aiError && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">{aiError}</p>}
                  {aiSuccess && <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-2">✓ Курс создан и добавлен в каталог!</p>}

                  <button type="button" onClick={handleGenerateCourse} disabled={aiGenerating || !aiTopic.trim()}
                    className="w-full isa-btn-primary py-3 text-sm font-bold cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2">
                    {aiGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Генерирую курс… (~30 сек)
                      </>
                    ) : (
                      <><Sparkles className="w-4 h-4" /> Создать курс с AI</>
                    )}
                  </button>
                </div>
              </div>

              {/* Courses list */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-isa-navy">Все курсы ({courses.length})</h3>
                  {loadingCourses && <div className="w-4 h-4 border-2 border-isa-gold border-t-transparent rounded-full animate-spin" />}
                </div>

                {courses.length === 0 && !loadingCourses && (
                  <p className="text-sm text-isa-muted text-center py-8">Курсов пока нет. Создайте первый с AI!</p>
                )}

                {courses.map(course => (
                  <div key={course.id} className="isa-card overflow-hidden">
                    <div className="p-4 flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-sm text-isa-navy">{course.title}</p>
                          {course.createdWithAI && (
                            <span className="text-[9px] bg-isa-gold-pale text-isa-gold border border-isa-gold/30 px-1.5 py-0.5 rounded font-bold">AI</span>
                          )}
                        </div>
                        <p className="text-[10px] text-isa-muted mt-0.5">
                          {course.category} · {course.difficulty} · {course.lessons.length} уроков · {course.quizzes.length} вопросов
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button type="button" onClick={() => setExpandedCourse(expandedCourse === course.id ? null : course.id)}
                          className="p-2 rounded-lg hover:bg-isa-cream cursor-pointer text-isa-muted">
                          {expandedCourse === course.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        <button type="button" onClick={() => handleDeleteCourse(course.id)}
                          className="p-2 rounded-lg hover:bg-red-50 cursor-pointer text-red-400">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {expandedCourse === course.id && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className="border-t border-isa-border overflow-hidden">
                          <div className="p-4 space-y-3">
                            <p className="text-xs text-slate-600">{course.description}</p>
                            <div>
                              <p className="text-[10px] font-bold text-isa-muted uppercase mb-1.5">Уроки</p>
                              <div className="space-y-1">
                                {course.lessons.map((l, i) => (
                                  <div key={l.id} className="text-xs p-2 bg-isa-cream rounded-lg">
                                    <span className="font-bold text-isa-navy">{i + 1}. {l.title}</span>
                                    <span className="text-isa-muted ml-1">~{l.estimatedTime} мин</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-isa-muted uppercase mb-1.5">Тест ({course.quizzes.length} вопросов)</p>
                              <div className="space-y-1">
                                {course.quizzes.map((q, i) => (
                                  <div key={q.id} className="text-[11px] p-2 bg-isa-cream rounded-lg text-isa-navy">
                                    {i + 1}. {q.question}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── VIDEOS / EVENTS TABS ── */}
          {(activeTab === "videos" || activeTab === "events") && (
            <AdminMediaPanel
              activeSection={activeTab}
              siteContent={siteContent}
              onRefreshSiteContent={onRefreshSiteContent}
            />
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
