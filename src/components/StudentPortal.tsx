import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BookOpen, 
  CheckCircle, 
  HelpCircle, 
  ArrowLeft, 
  ArrowRight, 
  MessageSquare, 
  ChevronRight, 
  Play, 
  Award, 
  MessageCircle, 
  Lightbulb, 
  AlertTriangle,
  Code,
  Copy,
  Star,
  Send,
  Sparkles,
  BookMarked,
  X,
  Home,
  Search,
  Video,
  User,
  Flame,
  Globe,
  Smartphone,
  Laptop,
  Check,
  FileText,
  TrendingUp,
  RotateCcw,
  Sparkle,
  Activity,
  Trophy,
  Coins,
  ShoppingBag,
  Languages,
  Brain,
  Terminal,
  Phone,
  Fingerprint,
  Calendar,
  Bell,
  Zap,
  Droplets,
  Footprints,
  RefreshCw,
  Calculator,
  Plus,
  Trash2,
  ExternalLink,
  Bot,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Course, Lesson, QuizQuestion, ChatMessage, StudentStats, SiteContent, PromoEvent } from "../types";
import {
  analyzeFaceFrame,
  FaceScanPhase,
  FACE_PHASE_LABELS,
  FACE_PHASE_STEPS,
} from "../utils/faceBlink";

interface StudentPortalProps {
  courses: Course[];
  studentStats: StudentStats;
  updateStats: (statChanges: Partial<StudentStats>) => void;
  onRefreshCourses: () => void;
  siteContent: SiteContent;
  onOpenAdmin?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

/** YouTube Shorts on home — embed only, no chrome — 4 штуки */
const HOME_YOUTUBE_SHORTS = [
  "jNQXAC9IVRw",
  "kUMe1fhM0lo",
  "kh060lK7Zrc",
  "ZGwQoRw7yh8",
];

const CAMPUS_MARKET_ITEMS = [
  {
    name: "Gold House Badge",
    desc: "Эксклюзивный золотой герб на вашем профиле и таблице лидеров. Показывает ваш высокий статус в академии.",
    cost: 200,
    icon: "🏅",
    photo: "https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?w=400&h=300&fit=crop",
    category: "Статус",
    badge: "Редкий",
  },
  {
    name: "Library Pass +2h",
    desc: "Дополнительные 2 часа в читальном зале на этой неделе. Больше времени для углублённого изучения материала.",
    cost: 120,
    icon: "📚",
    photo: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop",
    category: "Учёба",
    badge: "Популярный",
  },
  {
    name: "Cafeteria Voucher",
    desc: "Премиальное меню обеда на один день. Лучшие блюда кампуса за счёт накопленных монет.",
    cost: 80,
    icon: "🍽️",
    photo: "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=400&h=300&fit=crop",
    category: "Еда",
    badge: "Выгодно",
  },
  {
    name: "Sports Day VIP",
    desc: "VIP-место на межфакультетском матче. Лучший вид на поле и доступ в VIP-зону болельщиков.",
    cost: 150,
    icon: "⚽",
    photo: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400&h=300&fit=crop",
    category: "Спорт",
    badge: "Лимит",
  },
  {
    name: "Merit Boost +50 XP",
    desc: "Мгновенные 50 очков заслуг для рейтинга факультета. Поднимитесь в таблице лидеров прямо сейчас!",
    cost: 100,
    icon: "⭐",
    photo: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=300&fit=crop",
    category: "XP",
    badge: "Хит",
  },
  {
    name: "Rider AI Plus",
    desc: "Расширенные подсказки ИИ-репетитора Райдера на 7 дней. Только важные выжимки, глубокие и лаконичные технические факты.",
    cost: 180,
    icon: "🎓",
    photo: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=400&h=300&fit=crop",
    category: "ИИ",
    badge: "Новинка",
  },
  {
    name: "Hoodie кампуса",
    desc: "Фирменная толстовка Академии. Ограниченный тираж — только для лучших студентов!",
    cost: 350,
    icon: "👕",
    photo: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400&h=300&fit=crop",
    category: "Мерч",
    badge: "Эксклюзив",
  },
  {
    name: "Exam Cheat Sheet",
    desc: "Официальная шпаргалка с формулами и подсказками для экзамена (одобрена преподавателями).",
    cost: 90,
    icon: "📝",
    photo: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop",
    category: "Учёба",
    badge: null,
  },
];

export default function StudentPortal({ 
  courses, 
  studentStats, 
  updateStats,
  onRefreshCourses,
  siteContent,
  onOpenAdmin,
  onRefresh,
  isRefreshing = false,
}: StudentPortalProps) {
  // Navigation: "home" | "lessons" | "search" | "video" | "profile" | "market" | "translator" | "universities" | "ai-worker" | "exam-hub" | "calculator"
  const [currentTab, setCurrentTab] = useState<"home" | "lessons" | "search" | "video" | "profile" | "market" | "translator" | "universities" | "ai-worker" | "exam-hub" | "calculator">("home");

  // Custom Exam states
  const [examGoals, setExamGoals] = useState<{ id: string; subject: string; targetDate: string; targetScore: string; registered: boolean }[]>(() => {
    const saved = localStorage.getItem("isa_exam_goals");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: "1", subject: "IELTS Academic", targetDate: "2026-06-25", targetScore: "7.5", registered: true },
      { id: "2", subject: "SAT Digital", targetDate: "2026-10-10", targetScore: "1480", registered: false },
      { id: "3", subject: "Вестминстер Математика", targetDate: "2026-07-15", targetScore: "80%", registered: false },
    ];
  });

  useEffect(() => {
    localStorage.setItem("isa_exam_goals", JSON.stringify(examGoals));
  }, [examGoals]);

  const [newExamSubject, setNewExamSubject] = useState("IELTS Academic");
  const [newExamDate, setNewExamDate] = useState("");
  const [newExamScore, setNewExamScore] = useState("");
  const [examHubActiveTab, setExamHubActiveTab] = useState<"my-exams" | "prep-courses" | "registration" | "mock-calendar">("my-exams");
  const [registeredMocks, setRegisteredMocks] = useState<string[]>([]);
  const [selectedCalendarMonth, setSelectedCalendarMonth] = useState<"May" | "June">("May");
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<string>("2026-05-24");

  // Calculator state
  const [calcType, setCalcType] = useState<"standard" | "ielts" | "sat" | "gpa">("standard");
  const [calcInput, setCalcInput] = useState<string>("0");
  const [calcEquation, setCalcEquation] = useState<string>("");
  const [isNewNumber, setIsNewNumber] = useState<boolean>(true);
  // Pre-load Speech Synthesis voices
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if ("speechSynthesis" in window) {
      const updateVoices = () => {
        setAvailableVoices(window.speechSynthesis.getVoices());
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);
  // Interactive Rotary Tools Wheel
  const [activeWheelIndex, setActiveWheelIndex] = useState<number>(2); // Default to AI Assistant (index 2)
  const [wheelRotateAngle, setWheelRotateAngle] = useState<number>(0);
  const [isWheelSpinned, setIsWheelSpinned] = useState<boolean>(false);
  // IELTS
  const [ieltsL, setIeltsL] = useState<number>(6.5);
  const [ieltsR, setIeltsR] = useState<number>(6.5);
  const [ieltsW, setIeltsW] = useState<number>(6.0);
  const [ieltsS, setIeltsS] = useState<number>(6.5);
  // SAT
  const [satReading, setSatReading] = useState<number>(650);
  const [satMath, setSatMath] = useState<number>(720);
  // GPA
  const [gpaScores, setGpaScores] = useState<{ id: string; subject: string; grade: number; credits: number }[]>([
    { id: "1", subject: "Академическое Письмо", grade: 90, credits: 4 },
    { id: "2", subject: "Высшая Математика", grade: 85, credits: 5 },
    { id: "3", subject: "История и Общество", grade: 95, credits: 3 },
  ]);
  const [newGpaSubject, setNewGpaSubject] = useState("");
  const [newGpaGrade, setNewGpaGrade] = useState("");
  const [newGpaCredits, setNewGpaCredits] = useState("4");
  // Translator state
  const [translatorInput, setTranslatorInput] = useState<string>("");
  const [translatorOutput, setTranslatorOutput] = useState<string>("");
  const [translatorFrom, setTranslatorFrom] = useState<string>("ru");
  const [translatorTo, setTranslatorTo] = useState<string>("en");
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  
  // Word pronunciation trainer states
  const [translatorSubTab, setTranslatorSubTab] = useState<"translate" | "pronounce">("translate");
  const [selectedWordToPractice, setSelectedWordToPractice] = useState<{word: string, translation: string}>({ word: "Artificial Intelligence", translation: "Искусственный Интеллект" });
  const [speechRecognized, setSpeechRecognized] = useState<string>("");
  const [isSpeechListening, setIsSpeechListening] = useState<boolean>(false);
  const [pronunciationResult, setPronunciationResult] = useState<"none" | "success" | "failure">("none");
  const [customWordInput, setCustomWordInput] = useState<string>("");
  const [micErrorMsg, setMicErrorMsg] = useState<string>("");
  // AI Worker state
  const [aiWorkerMessages, setAiWorkerMessages] = useState<{role:"user"|"assistant", text:string}[]>([]);
  const [aiWorkerInput, setAiWorkerInput] = useState<string>("");
  const [isAiWorking, setIsAiWorking] = useState<boolean>(false);
  const [isAiVoiceListening, setIsAiVoiceListening] = useState<boolean>(false);
  const [autoSpeakResponse, setAutoSpeakResponse] = useState<boolean>(true);
  const aiWorkerBottomRef = useRef<HTMLDivElement | null>(null);
  const toggleMicRef = useRef<() => void>(() => {});
  
  // Format / Simulator Settings
  const [isPhoneView, setIsPhoneView] = useState<boolean>(false);

  // User Profile Name editor states
  const [profileFirstName, setProfileFirstName] = useState<string>(() => localStorage.getItem("isa_profile_first_name") || "");
  const [profileLastName, setProfileLastName] = useState<string>(() => localStorage.getItem("isa_profile_last_name") || "");
  const [profilePhone, setProfilePhone] = useState<string>(() => localStorage.getItem("isa_profile_phone") || "");
  const [profileFaceId, setProfileFaceId] = useState<boolean>(false);
  const [certExpanded, setCertExpanded] = useState<boolean>(false);
  const [proxyExpanded, setProxyExpanded] = useState<boolean>(false);

  // Website Settings
  const [siteLanguage, setSiteLanguage] = useState<"ru" | "uz" | "en">(() => {
    const saved = localStorage.getItem("isa_site_language");
    return (saved as "ru" | "uz" | "en") || "ru";
  });
  const [siteNotifications, setSiteNotifications] = useState<boolean>(true);
  const [siteVibration, setSiteVibration] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem("isa_site_language", siteLanguage);
  }, [siteLanguage]);

  const t = (key: string) => {
    const dict: Record<string, Record<"ru" | "uz" | "en", string>> = {
      // Navigation
      "nav_home": { ru: "Главная", uz: "Bosh sahifa", en: "Home" },
      "nav_lessons": { ru: "Лекции", uz: "Ma'ruzalar", en: "Lectures" },
      "nav_ai": { ru: "Rider AI", uz: "Rider AI", en: "Rider AI" },
      "nav_video": { ru: "Видео", uz: "Video", en: "Video" },
      "nav_profile": { ru: "Профиль", uz: "Profil", en: "Profile" },
      // Home elements
      "house_coins": { ru: "House coins", uz: "Gildiya tangalari", en: "House coins" },
      "merit_points": { ru: "Merit points", uz: "Yutuq ochkolari", en: "Merit points" },
      "xp_descr": { ru: "Накапливайте за уроки", uz: "Darslar uchun to'plang", en: "Earn from lessons" },
      "merit_descr": { ru: "Рейтинг среди студентов", uz: "Talabalar reytingi", en: "Student leaderboard" },
      "welcome_back": { ru: "С возвращением!", uz: "Xush kelibsiz!", en: "Welcome back!" },
      // Stats labels
      "completed_lessons": { ru: "Пройдено лекций", uz: "Tugallangan darslar", en: "Completed lessons" },
      "quiz_score": { ru: "Средний балл тестов", uz: "Test o'rtacha bali", en: "Average quiz score" },
      "quests_done": { ru: "Выполнено квестов", uz: "Bajarilgan vazifalar", en: "Completed quests" },
      "active_day": { ru: "Активных дней", uz: "Faol kunlar", en: "Active days" },
      // Sections
      "recent_events": { ru: "События кампуса", uz: "Kampus voqealari", en: "Campus events" },
      "available_courses": { ru: "Доступные курсы", uz: "Mavjud kurslar", en: "Available courses" },
      "study_hubs": { ru: "Учебные хабы", uz: "O'quv markazlari", en: "Study hubs" },
      "all_lessons": { ru: "Все лекции вашего потока", uz: "Oqimingiz barcha darslari", en: "All flow lessons" },
      "not_selected": { ru: "Курс не выбран", uz: "Kurs tanlanmagan", en: "Course not selected" },
      "generate_ai_course": { ru: "Генератор AI курсов", uz: "AI Kurs Generator", en: "AI Course Generator" },
      // Settings
      "interface_lang": { ru: "Язык интерфейса", uz: "Interfeys tili", en: "Interface language" },
      "notifications": { ru: "Уведомления", uz: "Bildirishnomalar", en: "Notifications" },
      "vibration": { ru: "Виброотклик", uz: "Vibratsiya aloqasi", en: "Vibration feedback" },
      "save_profile": { ru: "Сохранить профиль", uz: "Profilni saqlash", en: "Save profile" },
      "settings_title": { ru: "Настройки профиля", uz: "Profil sozламalari", en: "Profile settings" },
      "sec_settings_title": { ru: "Безопасность и личный бренд", uz: "Xavfsizlik va brend", en: "Security & Personal Brand" },
      // Certificates
      "academic_cert": { ru: "Академический сертификат", uz: "Akademik sertifikat", en: "Academic certificate" },
      "download_pdf": { ru: "Скачать PDF", uz: "PDF yuklab olish", en: "Download PDF" },
    };
    return dict[key]?.[siteLanguage] || dict[key]?.["ru"] || key;
  };
  
  // Active Course/Classroom state
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [activeLessonIdx, setActiveLessonIdx] = useState<number>(0);
  const [classroomTab, setClassroomTab] = useState<"lessons" | "quiz">("lessons");
  
  // Quiz states within classroom
  const [currentQuizIdx, setCurrentQuizIdx] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);

  // AI Tutor chat states (Kapusta AI)
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const chatInputRef = useRef<HTMLInputElement | null>(null);
  const eventsCarouselRef = useRef<HTMLDivElement | null>(null);
  const [currentEventSlide, setCurrentEventSlide] = useState<number>(0);

  // Optical Face ID sensor references
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Feedback states
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);
  const [submittingFeedback, setSubmittingFeedback] = useState<boolean>(false);

  // Practice States
  const [activePracticeIdx, setActivePracticeIdx] = useState<number>(0);
  const [practiceCode, setPracticeCode] = useState<string>("");
  const [practiceOutput, setPracticeOutput] = useState<string>("");
  const [practiceSuccess, setPracticeSuccess] = useState<boolean | null>(null);
  const [showPracticeHint, setShowPracticeHint] = useState<boolean>(false);

  // AI Interactive Audio Lesson States
  const [activeVoiceLesson, setActiveVoiceLesson] = useState<{
    topic: string;
    paragraphs: string[];
    questions: {
      question: string;
      options: string[];
      correctAnswer: string;
      explanation: string;
    }[];
  } | null>(null);
  const [generatingVoiceLesson, setGeneratingVoiceLesson] = useState<boolean>(false);
  const [voiceLessonStep, setVoiceLessonStep] = useState<number>(-1); // -1 = audio explanation mode, 0+ = quiz questions
  const [currentNarratingParagraph, setCurrentNarratingParagraph] = useState<number>(0);
  const [isVoiceSpeaking, setIsVoiceSpeaking] = useState<boolean>(false);
  const [voiceRate, setVoiceRate] = useState<number>(1.0);
  const [selectedVoiceOption, setSelectedVoiceOption] = useState<string | null>(null);
  const [revealedVoiceQuestion, setRevealedVoiceQuestion] = useState<boolean>(false);
  const [voiceScore, setVoiceScore] = useState<number>(0);
  const [customVoiceTopic, setCustomVoiceTopic] = useState<string>("");
  const [voiceCompleted, setVoiceCompleted] = useState<boolean>(false);
  const [userVoiceAnswers, setUserVoiceAnswers] = useState<Record<number, string>>({});
  const [enrollSuccessMessage, setEnrollSuccessMessage] = useState<string | null>(null);

  // Video States
  const [videoActiveIdx, setVideoActiveIdx] = useState<number>(0);
  const [videoPlaying, setVideoPlaying] = useState<boolean>(false);
  const [videoProgress, setVideoProgress] = useState<number>(35);
  const [videoSpeed, setVideoSpeed] = useState<string>("1.0x");

  // Search States
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isAiSearching, setIsAiSearching] = useState<boolean>(false);
  const [aiSearchRecommendation, setAiSearchRecommendation] = useState<string | null>(null);

  // SSO Login simulator states
  const [userProfile, setUserProfile] = useState<{
    name: string;
    email: string;
    tier: string;
    streak: number;
    avatar: string;
    badgeCount: number;
  }>(() => {
    const saved = localStorage.getItem("isa_user_profile");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      name: "",
      email: "",
      tier: "Новый Студент · Level 1",
      streak: 0,
      avatar: "",
      badgeCount: 0
    };
  });

  const [ssoModalOpen, setSsoModalOpen] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Home-tab customized dynamic states
  const [userCoins, setUserCoins] = useState<number>(() => {
    const saved = localStorage.getItem("student_user_coins");
    return saved ? Number(saved) : 0;
  });
  const [userRating, setUserRating] = useState<number>(() => {
    const saved = localStorage.getItem("student_user_rating");
    return saved ? Number(saved) : 0;
  });

  const [eventsOffset, setEventsOffset] = useState<number>(0);
  const [eventModal, setEventModal] = useState<PromoEvent | null>(null);
  const [activeFullscreenShort, setActiveFullscreenShort] = useState<string | null>(null);
  const [aiExtraVideos, setAiExtraVideos] = useState<any[]>([]);
  const [marketOpen, setMarketOpen] = useState<boolean>(false);
  const [marketCategory, setMarketCategory] = useState<string>("Все");
  const [showRatingLeaderboard, setShowRatingLeaderboard] = useState<boolean>(false);
  const [marketPurchaseHistory, setMarketPurchaseHistory] = useState<string[]>([]);

  // Helpers state: text translator state, active helper, output text
  const [selectedHelperId, setSelectedHelperId] = useState<string | null>(null);
  const [helperInputText, setHelperInputText] = useState<string>("");
  const [helperResultText, setHelperResultText] = useState<string>("");
  const [isTranslatingHelper, setIsTranslatingHelper] = useState<boolean>(false);

  // Real Face ID states (blink liveness: open → close → open)
  const [faceScannerOpen, setFaceScannerOpen] = useState<boolean>(false);
  const [faceScannerMode, setFaceScannerMode] = useState<"register" | "authenticate">("register");
  const [faceScannerStatus, setFaceScannerStatus] = useState<"idle" | "camera-active" | "scanning" | "success" | "error">("idle");
  const [faceScannerMessage, setFaceScannerMessage] = useState<string>("");
  const [faceScanPhase, setFaceScanPhase] = useState<FaceScanPhase>("camera_start");
  const [faceSimulatedMode, setFaceSimulatedMode] = useState(false);
  const [storedFaceIdImage, setStoredFaceIdImage] = useState<string | null>(() => localStorage.getItem("stored_face_id_image"));
  const [storedFaceIdTemplate, setStoredFaceIdTemplate] = useState<string | null>(() => localStorage.getItem("stored_face_id_template"));

  const faceScanPhaseRef = useRef<FaceScanPhase>("camera_start");
  const faceScanModeRef = useRef<"register" | "authenticate">("register");
  const faceScannerOpenRef = useRef(false);
  const phaseHoldSinceRef = useRef<number | null>(null);
  const faceCompletingRef = useRef(false);
  const peakEyeContrastRef = useRef(0);
  const PHASE_HOLD_MS = 750;

  // YouTube / Video Search states
  const [videoSearchQuery, setVideoSearchQuery] = useState<string>("");
  const [isVideoSearching, setIsVideoSearching] = useState<boolean>(false);

  // Duolingo game states
  const [isGeneratingDuo, setIsGeneratingDuo] = useState<boolean>(false);
  const [activeDuolingoLesson, setActiveDuolingoLesson] = useState<any | null>(null);
  const [duolingoStep, setDuolingoStep] = useState<number>(0);
  const [duolingoLives, setDuolingoLives] = useState<number>(3);
  const [duolingoXP, setDuolingoXP] = useState<number>(0);
  const [duolingoSelectedAnswers, setDuolingoSelectedAnswers] = useState<Record<number, string>>({});
  const [duolingoCheckedAnswers, setDuolingoCheckedAnswers] = useState<number[]>([]);

  const handleProfileNameChange = (first: string, last: string) => {
    setProfileFirstName(first);
    setProfileLastName(last);
    setUserProfile(prev => ({
      ...prev,
      name: `${first} ${last}`.trim()
    }));
  };

  const DEFAULT_AVATAR = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23e8d5c0'/><circle cx='50' cy='36' r='22' fill='%23b0956e'/><ellipse cx='50' cy='85' rx='32' ry='24' fill='%23b0956e'/></svg>";

  const handleAvatarChange = (newAvatar: string) => {
    setUserProfile(prev => ({
      ...prev,
      avatar: newAvatar
    }));
  };

  const renderAvatar = (av: string, classNameString: string = "w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 bg-slate-900 text-white select-none overflow-hidden") => {
    const src = (!av || av === "🎒" || (av.length <= 2 && !av.startsWith("data:"))) ? DEFAULT_AVATAR : av;
    if (src.startsWith("data:") || src.startsWith("http://") || src.startsWith("https://")) {
      return (
        <img
          src={src}
          alt="Avatar"
          className={`${classNameString} object-cover`}
          referrerPolicy="no-referrer"
        />
      );
    }
    return (
      <div className={classNameString}>
        <img src={DEFAULT_AVATAR} alt="Avatar" className="w-full h-full object-cover" />
      </div>
    );
  };

  const setFacePhase = (phase: FaceScanPhase, message?: string) => {
    faceScanPhaseRef.current = phase;
    setFaceScanPhase(phase);
    setFaceScannerMessage(message ?? FACE_PHASE_LABELS[phase]);
    phaseHoldSinceRef.current = null;
  };

  const advancePhaseIfHeld = (condition: boolean, next: FaceScanPhase) => {
    if (!condition) {
      phaseHoldSinceRef.current = null;
      return;
    }
    const now = Date.now();
    if (phaseHoldSinceRef.current === null) phaseHoldSinceRef.current = now;
    if (now - phaseHoldSinceRef.current >= PHASE_HOLD_MS) {
      setFacePhase(next);
    }
  };

  const stopFaceAnimationLoop = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const scheduleNextFaceFrame = () => {
    stopFaceAnimationLoop();
    animationFrameRef.current = requestAnimationFrame(processFaceBlinkFrame);
  };

  const eyesClosedWithBaseline = (analysis: ReturnType<typeof analyzeFaceFrame>) => {
    const peak = peakEyeContrastRef.current;
    const dropped =
      peak > 12 && analysis.contrast < peak * 0.55;
    return analysis.eyesClosed || dropped;
  };

  const processFaceBlinkFrame = () => {
    if (!faceScannerOpenRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) {
      scheduleNextFaceFrame();
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      scheduleNextFaceFrame();
      return;
    }

    const w = canvas.width;
    const h = canvas.height;
    let phase = faceScanPhaseRef.current;

    if (phase === "success") return;

    if (phase === "capturing") {
      completeFaceScan(faceScanModeRef.current);
      return;
    }

    const videoReady = video.readyState >= 2 && !video.paused && video.videoWidth > 0;

    if (videoReady) {
      ctx.save();
      ctx.clearRect(0, 0, w, h);
      ctx.scale(-1, 1);
      ctx.drawImage(video, -w, 0, w, h);
      ctx.restore();
      setFaceScannerStatus("scanning");

      const analysis = analyzeFaceFrame(ctx, w, h);

      if (analysis.contrast > peakEyeContrastRef.current) {
        peakEyeContrastRef.current = analysis.contrast;
      }

      switch (phase) {
        case "camera_start":
        case "position_face":
          if (analysis.facePresent) {
            advancePhaseIfHeld(true, "eyes_open_1");
          } else {
            setFaceScannerMessage(FACE_PHASE_LABELS.position_face);
          }
          break;
        case "eyes_open_1":
          if (analysis.eyesOpen) peakEyeContrastRef.current = Math.max(peakEyeContrastRef.current, analysis.contrast);
          advancePhaseIfHeld(analysis.eyesOpen, "eyes_closed");
          break;
        case "eyes_closed":
          advancePhaseIfHeld(eyesClosedWithBaseline(analysis), "eyes_open_2");
          break;
        case "eyes_open_2":
          advancePhaseIfHeld(analysis.eyesOpen, "capturing");
          break;
        default:
          break;
      }

      drawFaceGuideOverlay(ctx, w, h, analysis.contrast);
    } else {
      setFaceScannerMessage(FACE_PHASE_LABELS.camera_start);
    }

    phase = faceScanPhaseRef.current;
    if (phase === "capturing") {
      completeFaceScan(faceScanModeRef.current);
      return;
    }

    scheduleNextFaceFrame();
  };

  const drawFaceGuideOverlay = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    contrast: number
  ) => {
    const phase = faceScanPhaseRef.current;

    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, Math.min(w, h) * 0.38, 0, Math.PI * 2);
    ctx.stroke();

    const stepIdx = FACE_PHASE_STEPS.indexOf(phase as (typeof FACE_PHASE_STEPS)[number]);
    if (stepIdx >= 0) {
      const ey = h * 0.36;
      ctx.fillStyle = phase === "eyes_closed" ? "rgba(12, 49, 37, 0.45)" : "rgba(201, 162, 39, 0.35)";
      ctx.fillRect(w * 0.2, ey - 5, w * 0.24, 12);
      ctx.fillRect(w * 0.56, ey - 5, w * 0.24, 12);
    }

    ctx.fillStyle = "#0c3125";
    ctx.font = "bold 9px system-ui, sans-serif";
    ctx.fillText(`Signal ${Math.min(99, Math.round(contrast * 2.5))}%`, 8, h - 10);
  };

  const advanceSimulatedBlinkStep = () => {
    const order: FaceScanPhase[] = [
      "position_face",
      "eyes_open_1",
      "eyes_closed",
      "eyes_open_2",
      "capturing",
    ];
    const idx = order.indexOf(faceScanPhaseRef.current);
    const next = order[Math.min(idx + 1, order.length - 1)];
    setFacePhase(next);
    if (next === "capturing") {
      setTimeout(() => completeFaceScan(faceScanModeRef.current), 400);
    }
  };

  const startFaceScan = (mode: "register" | "authenticate") => {
    if (mode === "authenticate" && !storedFaceIdTemplate) {
      alert("Register Face ID in Profile first (eyes open → closed → open).");
      return;
    }

    faceCompletingRef.current = false;
    peakEyeContrastRef.current = 0;
    faceScanModeRef.current = mode;
    faceScannerOpenRef.current = true;
    setFaceScannerMode(mode);
    setFaceScannerOpen(true);
    setFaceSimulatedMode(false);
    setFaceScannerStatus("camera-active");
    setFacePhase("camera_start");

    if (siteVibration && "vibrate" in navigator) navigator.vibrate([20, 20]);
  };

  useEffect(() => {
    if (!faceScannerOpen || faceSimulatedMode) return;

    let cancelled = false;

    const attachStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;

        video.srcObject = stream;
        video.muted = true;
        video.playsInline = true;

        const onReady = () => {
          if (cancelled) return;
          video
            .play()
            .then(() => {
              setFacePhase("position_face");
              scheduleNextFaceFrame();
            })
            .catch((e) => {
              console.warn("Video play error:", e);
              enableSimulatedFaceFlow();
            });
        };

        if (video.readyState >= 2) onReady();
        else video.addEventListener("loadeddata", onReady, { once: true });
      } catch (err) {
        console.warn("Webcam unavailable:", err);
        if (!cancelled) enableSimulatedFaceFlow();
      }
    };

    const enableSimulatedFaceFlow = () => {
      setFaceSimulatedMode(true);
      setFaceScannerStatus("scanning");
      setFacePhase("eyes_open_1", "Camera unavailable. Confirm each step manually:");
    };

    const t = window.setTimeout(() => attachStream(), 150);

    return () => {
      cancelled = true;
      window.clearTimeout(t);
      stopFaceAnimationLoop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [faceScannerOpen, faceSimulatedMode]);

  const completeFaceScan = (mode: "register" | "authenticate") => {
    if (faceCompletingRef.current) return;
    faceCompletingRef.current = true;

    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach(track => track.stop());
      } catch (e) {}
      streamRef.current = null;
    }
    stopFaceAnimationLoop();

    if (siteVibration && "vibrate" in navigator) navigator.vibrate([100, 50, 100]);

    if (mode === "register") {
      let capturedBase64 =
        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><circle cx='50' cy='50' r='40' fill='%230c3125'/><text x='50' y='58' font-size='28' text-anchor='middle'>👤</text></svg>";

      const canvas = canvasRef.current;
      if (canvas) {
        try {
          capturedBase64 = canvas.toDataURL("image/jpeg", 0.85);
        } catch (e) {
          console.warn("Canvas capture failed:", e);
        }
      }

      const templateId = `Face-ISA-${Date.now().toString(16)}`;
      setStoredFaceIdImage(capturedBase64);
      setStoredFaceIdTemplate(templateId);
      localStorage.setItem("stored_face_id_image", capturedBase64);
      localStorage.setItem("stored_face_id_template", templateId);
      
      setProfileFaceId(true);
      setFaceScannerStatus("success");
      setFacePhase("success", "Face ID сохранён! Проверка «глаза открыты → закрыты → открыты» пройдена.");
      setTimeout(() => closeFaceScanner(), 2200);
    } else {
      setFaceScannerStatus("success");
      setFacePhase("success", "Вход подтверждён! Liveness (моргание) пройден.");
      setTimeout(() => {
        setUserProfile((prev) => ({
          ...prev,
          name: `${profileFirstName} ${profileLastName}`.trim() || prev.name,
        }));
        closeFaceScanner();
        alert(
          `Face ID sign-in successful — welcome, ${profileFirstName || "Student"} ${profileLastName || ""}!`
        );
      }, 1500);
    }
  };

  const closeFaceScanner = () => {
    faceCompletingRef.current = false;
    faceScannerOpenRef.current = false;
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => track.stop());
      } catch (e) {}
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    stopFaceAnimationLoop();
    setFaceScannerOpen(false);
    setFaceScannerStatus("idle");
    setFaceSimulatedMode(false);
    setFacePhase("camera_start");
  };

  // Pre-seed practice problems
  const practiceProblems = [
    {
      id: "prac-py",
      title: "🐍 Основы циклов в Python",
      description: "Напишите простой цикл, который выведет числа от 1 до 5 включительно.",
      task: "Замените заполнитель, чтобы вызвать правильный вывод переменной i:",
      initialCode: "for i in range(1, 6):\n    print(______)",
      expectedResult: "1\n2\n3\n4\n5",
      correctCodeSnippet: "i",
      hint: "Просто введите ключевое имя переменной 'i' внутрь функции print() без скобок!",
      language: "python"
    },
    {
      id: "prac-js",
      title: "📦 Стрелочные функции в JS",
      description: "Напишите стрелочную функцию sum(a, b), возвращающую их сумму.",
      task: "Объявите математическое сложение (a, b) => a + b:",
      initialCode: "const sum = (a, b) => __________",
      expectedResult: "a + b",
      correctCodeSnippet: "a + b",
      hint: "Справа от стрелочного аргумента укажите 'a + b' для лаконичного вычисления.",
      language: "javascript"
    },
    {
      id: "prac-html",
      title: "🎨 HTML & CSS Стилизация",
      description: "Задайте тегу абзаца ярко-красный цвет методами инлайн-стилизации.",
      task: "Допишите атрибут style с красителем red:",
      initialCode: '<p style="color: _________;">Привет от Google</p>',
      expectedResult: "red",
      correctCodeSnippet: "red",
      hint: "Просто напишите 'red' в значении цвета, чтобы браузер закрасил текст в красный цвет.",
      language: "html"
    }
  ];

  const videoLessons = [...siteContent.videos, ...aiExtraVideos];

  // Auto initialize practice code based on selection
  useEffect(() => {
    setPracticeCode(practiceProblems[activePracticeIdx].initialCode);
    setPracticeOutput("");
    setPracticeSuccess(null);
    setShowPracticeHint(false);
  }, [activePracticeIdx]);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isTyping]);

  useEffect(() => {
    if (chatMessages.length > 0) {
      updateStats({ aiChatMessagesCount: chatMessages.length });
    }
  }, [chatMessages]);

  // Synchronize dynamic home coins and offline ratings
  useEffect(() => {
    localStorage.setItem("student_user_coins", String(userCoins));
  }, [userCoins]);

  useEffect(() => {
    localStorage.setItem("student_user_rating", String(userRating));
  }, [userRating]);

  useEffect(() => {
    localStorage.setItem("isa_user_profile", JSON.stringify(userProfile));
  }, [userProfile]);


  // Auto-scroll events carousel every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const el = eventsCarouselRef.current;
      if (!el) return;
      const totalSlides = el.children.length;
      if (totalSlides === 0) return;
      setCurrentEventSlide(prev => {
        const next = (prev + 1) % totalSlides;
        el.scrollTo({ left: next * el.offsetWidth, behavior: "smooth" });
        return next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);



  const handleStartCourse = (course: Course) => {
    setActiveCourse(course);
    
    // Automatically find the first uncompleted lesson in the course
    const firstUncompletedIdx = course.lessons.findIndex(l => !studentStats.completedLessons.includes(l.id));
    setActiveLessonIdx(firstUncompletedIdx !== -1 ? firstUncompletedIdx : 0);
    
    setClassroomTab("lessons");
    setQuizCompleted(false);
    setCurrentQuizIdx(0);
    setSelectedAnswer(null);
    setIsAnswerRevealed(false);
    setQuizScore(0);
    setCurrentTab("lessons"); // Switch tab to lessons internally when starting

    setChatMessages([
      {
        id: "greet-" + Date.now(),
        role: "model",
        content: `Привет! Я твой ИИ-консультант Райдер (Rider AI). Рад видеть тебя на курсе "${course.title}". Я готов предоставить тебе только важную техническую выжимку, формулы, теорию или разборы кода. Спрашивай меня по любым вопросам. 🎙️`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleMarkLessonComplete = (lessonId: string) => {
    if (!studentStats.completedLessons.includes(lessonId)) {
      const updated = [...studentStats.completedLessons, lessonId];
      updateStats({ completedLessons: updated });
    }
    
    if (activeCourse && activeLessonIdx < activeCourse.lessons.length - 1) {
      setActiveLessonIdx(prev => prev + 1);
    } else {
      setClassroomTab("quiz");
    }
  };

  const handleSubmitAnswer = (option: string, questionObj: QuizQuestion) => {
    if (isAnswerRevealed) return;
    setSelectedAnswer(option);
    setIsAnswerRevealed(true);
    if (option === questionObj.correctAnswer) {
      setQuizScore(prev => prev + 1);
    }
  };

  const handleNextQuizQuestion = () => {
    if (!activeCourse) return;
    setSelectedAnswer(null);
    setIsAnswerRevealed(false);
    
    if (currentQuizIdx < activeCourse.quizzes.length - 1) {
      setCurrentQuizIdx(prev => prev + 1);
    } else {
      setQuizCompleted(true);
      
      const finalVal = quizScore + (selectedAnswer === activeCourse.quizzes[currentQuizIdx].correctAnswer ? 1 : 0);
      fetch("/api/quizzes/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: finalVal, maxScore: activeCourse.quizzes.length })
      }).catch(err => console.error("Error submitting quiz analytics:", err));

      const existingQuizzes = { ...studentStats.gradedQuizzes };
      existingQuizzes[activeCourse.id] = {
        score: finalVal,
        maxScore: activeCourse.quizzes.length,
        date: new Date().toLocaleDateString()
      };
      updateStats({ gradedQuizzes: existingQuizzes });
    }
  };

  const handleSendChatMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg: ChatMessage = {
      id: "msg-" + Date.now(),
      role: "user",
      content: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    const nextMessages = [...chatMessages, userMsg];
    setChatMessages(nextMessages);
    setChatInput("");
    setIsTyping(true);

    try {
      const resp = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map(m => ({ role: m.role, content: m.content })),
          currentTopic: activeCourse?.title || "Общее обучение"
        })
      });

      if (!resp.ok) throw new Error("Не удалось связаться с ИИ репетитором.");
      const data = await resp.json();
      setChatMessages(prev => [
        ...prev,
        {
          id: "reply-" + Date.now(),
          role: "model",
          content: data.content,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (e: any) {
      setChatMessages(prev => [
        ...prev,
        {
          id: "err-" + Date.now(),
          role: "model",
          content: `⚠️ Извини, возникла ошибка: ${e.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCourse) return;
    setSubmittingFeedback(true);

    try {
      const resp = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: activeCourse.id,
          courseTitle: activeCourse.title,
          userName: userProfile.name,
          rating,
          comment
        })
      });

      if (resp.ok) {
        setFeedbackSubmitted(true);
        setComment("");
        onRefreshCourses();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // Run user code compilers mockup check
  const handleCompilePracticeCode = () => {
    const activePrac = practiceProblems[activePracticeIdx];
    const isMatched = practiceCode.includes(activePrac.correctCodeSnippet);
    
    setPracticeOutput("⏳ [EduSandbox] Подключение к компилятору...\n🔄 [Sandbox] Анализ синтаксиса и отступов...");
    
    setTimeout(() => {
      if (isMatched) {
        setPracticeOutput(`✅ [SUCCESS] Компиляция завершена без предупреждений.\n🛰️ [Получено]: ${activePrac.expectedResult}\n🎯 [Совпадение результатов]: СУПЕР! Задание выполнено на отлично!`);
        setPracticeSuccess(true);
        // Increase user stats streak or mock badge internally
        if (userProfile.streak < 7) {
          setUserProfile(prev => ({ ...prev, streak: prev.streak + 1 }));
        }
      } else {
        setPracticeOutput(`❌ [ERROR] Ошибка вывода. Ожидался результат:\n${activePrac.expectedResult}\n\nПолучено пустое значение или синтаксическое падение. Попробуйте еще раз или воспользуйтесь подсказкой!`);
        setPracticeSuccess(false);
      }
    }, 1200);
  };

  // Google Search simulated responder involving Gemini API recommendation
  const handleAiSmartSeek = async () => {
    if (!searchQuery.trim()) return;
    setIsAiSearching(true);
    setAiSearchRecommendation(null);
    
    try {
      const resp = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "user", content: `Найди мне лучший урок, сделай краткое саммари и порекомендуй план изучения по теме: "${searchQuery}".` }
          ],
          currentTopic: "Рекомендации Google Scholar Search"
        })
      });

      if (resp.ok) {
        const data = await resp.json();
        setAiSearchRecommendation(data.content);
      } else {
        setAiSearchRecommendation("Поиск по ключевым словам выполнен успешно! (см. список ниже). Ответ от ИИ Куратора временно задержан.");
      }
    } catch (err) {
      console.error(err);
      setAiSearchRecommendation("Поиск по ключевым словам выполнен успешно! Рекомендации от ИИ временно недоступны.");
    } finally {
      setIsAiSearching(false);
    }
  };

  // Copy code handler
  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Filter courses by manual search
  const filteredCoursesByQuery = courses.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return c.title.toLowerCase().includes(q) || 
           c.description.toLowerCase().includes(q) || 
           c.category.toLowerCase().includes(q);
  });

  // Render visual parts within lessons beautifully
  const renderVisualParts = (parts: any[]) => {
    if (!parts || parts.length === 0) return null;
    return (
      <div className="space-y-4 pt-3 border-t border-slate-100 mt-4">
        {parts.map((p, idx) => (
          <div 
            key={idx} 
            className={`p-3.5 rounded-xl border text-xs leading-relaxed transition-all ${
              p.type === 'code' ? 'bg-slate-900 text-slate-100 border-slate-800 font-mono' :
              p.type === 'tip' ? 'bg-[#E6F4EA] border-[#A8DAB5] text-[#137333] font-sans' :
              p.type === 'warning' ? 'bg-[#FCE8E6] border-[#FAD2CF] text-[#C5221F] font-sans' :
              'bg-white border-slate-205 text-slate-750 font-sans'
            }`}
          >
            <div className="flex justify-between items-center text-[10px] uppercase tracking-wider font-extrabold mb-1.5 opacity-80 select-none">
              <span className="flex items-center gap-1.5">
                {p.type === 'code' && (
                  <>
                    <Code className="w-3.5 h-3.5 text-[#4285F4]" />
                    <span>Пример кода / Формулы</span>
                  </>
                )}
                {p.type === 'tip' && (
                  <>
                    <Lightbulb className="w-3.5 h-3.5 text-[#34A853]" />
                    <span>Лайфхак / Идея ученых</span>
                  </>
                )}
                {p.type === 'warning' && (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-[#EA4335]" />
                    <span>Частая ошибка новичков</span>
                  </>
                )}
                {p.type === 'text' && (
                  <>
                    <BookOpen className="w-3.5 h-3.5 text-[#4285F4]" />
                    <span>Дополнительные сведения</span>
                  </>
                )}
                {p.type === 'duolingo_game' && (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-[#58cc02]" />
                    <span>Интерактивное задание</span>
                  </>
                )}
              </span>

              {p.type === 'code' && (
                <button
                  type="button"
                  onClick={() => handleCopyCode(p.content)}
                  className="bg-slate-800 hover:bg-slate-700 text-white rounded px-2 py-0.5 border border-slate-700 font-bold tracking-normal transition scale-90 cursor-pointer flex items-center gap-0.5"
                >
                  <Copy className="w-2.5 h-2.5" />
                  <span>{copiedText === p.content ? "Copied" : "Copy"}</span>
                </button>
              )}
            </div>

            <p className="whitespace-pre-wrap">
              {p.type === 'duolingo_game' && p.gameQuestion ? p.gameQuestion : p.content}
            </p>
            {p.type === 'duolingo_game' && p.gameOptions && p.gameOptions.length > 0 && (
              <ul className="mt-2 space-y-1 list-none">
                {p.gameOptions.map((opt: string, i: number) => (
                  <li key={i} className={`text-[11px] px-2 py-1 rounded-lg border ${
                    opt === p.gameAnswer ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-700'
                  }`}>
                    {opt}
                  </li>
                ))}
              </ul>
            )}
            {p.metadata && (
              <span className="text-[10px] font-bold text-slate-400 block mt-1 select-none font-mono">
                Раздел: {p.metadata}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Google Colored Line Accent Header
  const googleAccentBar = (
    <div className="h-1 flex w-full select-none shrink-0 z-50">
      <div className="h-full bg-[#4285F4] w-1/4" />
      <div className="h-full bg-[#EA4335] w-1/4" />
      <div className="h-full bg-[#FBBC05] w-1/4" />
      <div className="h-full bg-[#34A853] w-1/4" />
    </div>
  );

  // Phone Mockup shell container view
  const renderInPhoneFrame = (bodyContent: React.ReactNode) => {
    return (
      <div className="mx-auto max-w-[395px] w-full bg-[#202124] p-3.5 rounded-[48px] shadow-2xl border-4 border-slate-700 relative overflow-hidden select-none">
        {/* Physical Button Mockups */}
        <div className="absolute top-28 -left-1 w-1 h-12 bg-slate-700 rounded-r" />
        <div className="absolute top-44 -left-1 w-1 h-12 bg-slate-700 rounded-r" />
        <div className="absolute top-36 -right-1 w-1 h-16 bg-slate-700 rounded-l" />

        {/* Smartphone Camera Pill */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-full z-50 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900/40 absolute left-4" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#34A853] absolute right-4 animate-pulse" />
        </div>
        
        {/* Outer Phone Shell Glass wrapper */}
        <div className="bg-[#F8F9FA] rounded-[36px] overflow-hidden flex flex-col h-[710px] relative text-slate-800 select-text outline-none shadow-inner">
          
          {/* Top Google Colors highlight under status bar */}
          <div className="h-9 bg-white px-5 pt-4 flex justify-between items-center text-[10px] font-extrabold text-[#202124] font-sans tracking-tight z-40 relative select-none">
            <span>09:41</span>
            <div className="flex items-center gap-1.5">
              <span className="bg-[#34A853]/10 text-[#137333] border border-[#A8DAB5] rounded px-1 text-[8px] font-bold">Google Fi 5G</span>
              <span className="text-slate-500 text-[9px]">📶 🔋 98%</span>
            </div>
          </div>

          {googleAccentBar}
          
          {/* Scrollable Phone App Body (Container) */}
          <div className="flex-1 overflow-y-auto pb-20 pt-1.5 px-3 bg-[#F8F9FA] scrollbar-thin">
            {bodyContent}
          </div>

          {/* Fixed Bottom Navigation inside Phone Frame */}
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-2.5 px-3 flex justify-around items-center z-40 shadow-lg select-none">
            {[
              { id: "home", label: "Главная", icon: Home, color: "text-[#4285F4]" },
              { id: "lessons", label: "Лекторий", icon: BookOpen, color: "text-[#EA4335]" },
              { id: "search", label: "ИИ Поиск", icon: Search, color: "text-[#34A853]" },
              { id: "video", label: "Видео", icon: Video, color: "text-[#4285F4]" },
              { id: "profile", label: "Профиль", icon: User, color: "text-[#EA4335]" }
            ].map(tab => {
              const active = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setCurrentTab(tab.id as any);
                    if (tab.id !== 'lessons') setActiveCourse(null); // Return from course list when switching tabs
                  }}
                  className="flex flex-col items-center justify-center transition p-1 cursor-pointer"
                >
                  <tab.icon className={`w-5 h-5 ${active ? `${tab.color} scale-110 font-bold filter drop-shadow` : "text-slate-400 hover:text-slate-650"}`} />
                  <span className={`text-[9px] font-bold mt-0.5 tracking-tight ${active ? "text-slate-900 font-extrabold" : "text-slate-400 font-normal"}`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>

        </div>
      </div>
    );
  };

  // Wide View layout
  const renderInWideFrame = (bodyContent: React.ReactNode) => {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden min-h-[720px] flex flex-col justify-between relative">
        
        {googleAccentBar}

        {/* Desktop Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 select-none">
          <div className="flex items-center gap-2">
            <span className="bg-[#4285F4] text-white p-1 rounded-lg text-xs font-bold leading-none">🧠 Google Classroom</span>
            <span className="font-extrabold text-slate-900 text-sm font-mono uppercase tracking-wider">/ Студ-Портал</span>
          </div>

          {/* Quick SSO avatar button in Header to navigate directly */}
          <button
            onClick={() => setCurrentTab("profile")}
            className="flex items-center gap-2 bg-white hover:bg-slate-100 border border-slate-200 py-1.5 px-3 rounded-xl transition cursor-pointer text-left shadow-xs"
            title="Перейти в Личный SSO Кабинет"
          >
            {renderAvatar(userProfile.avatar, "text-sm w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center shrink-0 border border-slate-200")}
            <div className="leading-none">
              <span className="text-[10px] font-bold text-slate-800 block">{userProfile.name}</span>
              <span className="text-[8px] font-mono text-[#4285F4] uppercase tracking-wide">SSO Кабинет ⚙️</span>
            </div>
          </button>
        </div>

        {/* Wide Body Container */}
        <div className="flex-1 p-6 md:p-8 bg-[#F8F9FA] overflow-y-auto pb-24 scrollbar-thin">
          {bodyContent}
        </div>

        {/* Fixed Bottom Navigation inside Wide/Desktop Frame */}
        <div className="bg-white border-t border-slate-200 py-3.5 px-6 flex justify-around items-center z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] select-none shrink-0">
          {[
            { id: "home", label: "Главная", icon: Home, bgActive: "bg-[#4285F4]/10 text-[#4285F4]", iconColor: "text-[#4285F4]" },
            { id: "lessons", label: "Лекции", icon: BookOpen, bgActive: "bg-[#EA4335]/10 text-[#EA4335]", iconColor: "text-[#EA4335]" },
            { id: "search", label: "ИИ Поиск", icon: Search, bgActive: "bg-[#34A853]/10 text-[#34A853]", iconColor: "text-[#34A853]" },
            { id: "video", label: "Видео-Колледж", icon: Video, bgActive: "bg-[#4285F4]/10 text-[#4285F4]", iconColor: "text-[#4285F4]" },
            { id: "profile", label: "Профиль (SSO)", icon: User, bgActive: "bg-[#EA4335]/10 text-[#EA4335]", iconColor: "text-[#EA4335]" }
          ].map(tab => {
            const active = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setCurrentTab(tab.id as any);
                  if (tab.id !== 'lessons') setActiveCourse(null);
                }}
                className={`flex flex-col md:flex-row items-center gap-1.5 md:gap-2 px-4 py-2 rounded-xl transition-all duration-150 cursor-pointer ${
                  active 
                    ? `${tab.bgActive} shadow-xs font-bold scale-102` 
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                <tab.icon className={`w-4 h-4 ${active ? tab.iconColor : "text-slate-400"}`} />
                <span className="text-[10px] md:text-xs font-extrabold font-sans">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

      </div>
    );
  };

  const handleBuyProduct = (itName: string, price: number) => {
    if (userCoins < price) {
      alert(
        `Not enough house coins.\nYou have ${userCoins} 🪙 — need ${price - userCoins} more.\nComplete lessons and campus quests to earn coins.`
      );
      return;
    }
    setUserCoins((prev) => prev - price);
    setUserRating((prev) => prev + 50);
    setMarketPurchaseHistory((prev) => [...prev, itName]);
    alert(`Purchased "${itName}" for ${price} 🪙 house coins. +50 merit XP!`);
  };

  const renderCampusProfileHeader = () => (
    <header className="isa-school-header sticky top-0 z-40 -mx-4 px-4 pt-0 mb-4 shadow-md">
      <div className="isa-school-header__gold-rule" />
      <div className="py-3 space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <button
            type="button"
            onClick={() => setCurrentTab("profile")}
            className="flex items-center gap-3 text-left cursor-pointer min-w-0 flex-1"
          >
            {renderAvatar(
              userProfile.avatar,
              "w-14 h-14 bg-isa-gold-pale text-2xl rounded-full flex items-center justify-center border-2 border-isa-gold/60 shadow-md shrink-0"
            )}
            <div className="min-w-0">
              <p className="text-[10px] text-isa-gold-light font-bold uppercase tracking-widest">
                EduHub
              </p>
              <h1 className="text-lg font-bold text-white leading-tight truncate font-[family-name:var(--font-display)]">
                {profileFirstName} {profileLastName}
              </h1>
              <p className="text-[10px] text-white/70 truncate">{userProfile.tier}</p>
            </div>
          </button>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setChatOpen(true)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-isa-gold-light cursor-pointer transition"
              title="Academic chat"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowRatingLeaderboard(true)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-isa-gold cursor-pointer transition"
              title="House cup"
            >
              <Trophy className="w-4 h-4" />
            </button>
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 cursor-pointer transition"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </button>
            )}
            {onOpenAdmin && (
              <button
                type="button"
                onClick={onOpenAdmin}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-isa-gold/40 text-isa-gold cursor-pointer transition"
                title="Admin"
              >
                <Zap className="w-3.5 h-3.5 fill-isa-gold" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );

  const renderMarketModal = () => (
    <AnimatePresence>
      {marketOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="bg-isa-navy text-white rounded-t-3xl sm:rounded-3xl p-5 max-w-md w-full border border-isa-gold/30 shadow-2xl space-y-4 max-h-[88vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-isa-gold" />
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wide font-[family-name:var(--font-display)]">
                    Campus Market
                  </h3>
                  <p className="text-[9px] text-isa-gold-light/80">Spend house coins on campus rewards</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMarketOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-xl text-white/70 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="isa-wallet-pill flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-isa-gold-light">Your balance</span>
              <div className="flex items-center gap-1 font-mono">
                <span className="text-xl font-black text-white">{userCoins}</span>
                <span className="text-xs text-isa-gold">🪙</span>
              </div>
            </div>

            <div className="space-y-2">
              {CAMPUS_MARKET_ITEMS.map((it) => {
                const purchased = marketPurchaseHistory.includes(it.name);
                return (
                  <div
                    key={it.name}
                    className="bg-white/5 border border-white/10 p-3 rounded-xl flex gap-3 items-center"
                  >
                    <span className="text-2xl shrink-0">{it.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs font-bold text-white">{it.name}</h4>
                        {purchased && (
                          <span className="isa-badge-gold text-[7px] py-0">Owned</span>
                        )}
                      </div>
                      <p className="text-[10px] text-white/60 mt-0.5">{it.desc}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleBuyProduct(it.name, it.cost)}
                      disabled={purchased}
                      className={`py-1.5 px-3 rounded-lg text-xs font-bold shrink-0 ${
                        purchased
                          ? "bg-white/10 text-white/40 cursor-not-allowed"
                          : "bg-isa-gold text-isa-navy hover:bg-isa-gold-light cursor-pointer"
                      }`}
                    >
                      {purchased ? "Owned" : `${it.cost} 🪙`}
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  const renderLeaderboardModal = () => (
    <AnimatePresence>
      {showRatingLeaderboard && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="isa-card rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-4"
          >
            <div className="flex justify-between items-center border-b border-isa-border pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-isa-gold" />
                <h3 className="text-sm font-black text-isa-navy uppercase tracking-wide font-[family-name:var(--font-display)]">
                  House Cup
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRatingLeaderboard(false)}
                className="p-1.5 hover:bg-isa-cream rounded-xl text-isa-muted cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {[
                { rank: 1, name: "Emma Watson", rating: 1450, isMe: false, avatar: "" },
                { rank: 2, name: "James Chen", rating: 1390, isMe: false, avatar: "" },
                { rank: 3, name: "Sofia Aliyeva", rating: 1310, isMe: false, avatar: "" },
                { rank: 4, name: `${profileFirstName} ${profileLastName} (You)`, rating: userRating, isMe: true, avatar: userProfile.avatar },
                { rank: 5, name: "Lucas Martin", rating: 1120, isMe: false, avatar: "" },
              ].map((lead) => (
                <div
                  key={lead.rank}
                  className={`flex justify-between items-center p-2 rounded-xl ${
                    lead.isMe ? "bg-isa-gold-pale border border-isa-gold/40" : "bg-isa-cream border border-isa-border"
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs text-isa-navy">
                    <span className="w-5 h-5 rounded-full bg-isa-navy text-isa-gold-light flex items-center justify-center text-[10px] font-bold">
                      {lead.rank}
                    </span>
                    {renderAvatar(lead.avatar, "w-6 h-6 rounded-full overflow-hidden shrink-0 border border-isa-border")}
                    <span className="truncate max-w-[140px] font-medium">{lead.name}</span>
                  </div>
                  <span className="text-xs font-bold text-isa-navy">{lead.rating} XP</span>
                </div>
              ))}
            </div>
            <p className="text-center text-[9px] text-isa-muted font-bold uppercase">Rank #4 · 120 students</p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  // TAB 1: HOME PAGE RENDERER
  const renderHomeTab = () => {
    const promoEvents = siteContent.events.length > 0 ? siteContent.events : [];

    const homeShortIds = HOME_YOUTUBE_SHORTS.slice(0, 4);

    const toolsList = [
      {
        id: "translator",
        title: "Переводчик",
        desc: "Быстрый профессиональный перевод учебных материалов, терминов и кода на 4 языка с озвучкой правильного произношения.",
        icon: "🌐",
        tab: "translator",
        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=85",
        color: "indigo-600"
      },
      {
        id: "universities",
        title: "ВУЗы Ташкента",
        desc: "Каталог высших учебных заведений Узбекистана с информацией о проходных баллах, факультетах и льготных грантах.",
        icon: "🏛️",
        tab: "universities",
        image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=400&q=85",
        color: "emerald-600"
      },
      {
        id: "ai-worker",
        title: "AI Рабочий",
        desc: "Персональный ИИ-ассистент Rider AI для мгновенного разбора сложных формул, программирования и ответов на любые вопросы.",
        icon: "🤖",
        tab: "ai-worker",
        image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=85",
        color: "purple-600"
      },
      {
        id: "exam-hub",
        title: "Подготовка в ВУЗ",
        desc: "Интерактивный академический кабинет подготовки, персональные учебные цели, расписание и онлайн-регистрация на Mock экзамены.",
        icon: "🎓",
        tab: "exam-hub",
        image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=400&q=85",
        color: "orange-500"
      },
      {
        id: "calculator",
        title: "Калькулятор",
        desc: "Универсальный калькулятор: обычный математический счётник, а также расчёт результатов IELTS, SAT Total и среднего балла GPA университета.",
        icon: "📊",
        tab: "calculator",
        image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=85",
        color: "yellow-500"
      }
    ];

    const handleSelectWheelItem = (idx: number) => {
      setActiveWheelIndex(idx);
      setWheelRotateAngle(-idx * 72);
    };

    const handleNextWheel = () => {
      const nextIdx = (activeWheelIndex + 1) % toolsList.length;
      setActiveWheelIndex(nextIdx);
      setWheelRotateAngle(prev => prev - 72);
    };

    const handlePrevWheel = () => {
      const prevIdx = (activeWheelIndex - 1 + toolsList.length) % toolsList.length;
      setActiveWheelIndex(prevIdx);
      setWheelRotateAngle(prev => prev + 72);
    };

    const handleRandomSpin = () => {
      if (isWheelSpinned) return;
      setIsWheelSpinned(true);
      const spins = 2 + Math.floor(Math.random() * 3); // 2-4 spins
      const randomIdx = Math.floor(Math.random() * toolsList.length);
      const targetAngle = wheelRotateAngle - (spins * 360) - (randomIdx - activeWheelIndex) * 72;
      
      setWheelRotateAngle(targetAngle);
      setTimeout(() => {
        setActiveWheelIndex(randomIdx);
        setIsWheelSpinned(false);
      }, 850);
    };

    const translationHelpers = [
      { id: "ru-en", title: "🇷🇺 ➜ 🇬🇧 Английский", desc: "Перевод лекций и кода на English", emoji: "📝" },
      { id: "en-ru", title: "🇬🇧 ➜ 🇷🇺 Русский", desc: "Ошибки и термины с английского", emoji: "🩺" },
      { id: "ru-uz", title: "🇷🇺 ➜ 🇺🇿 O'zbek", desc: "Перевод материалов на узбекский", emoji: "🌐" },
      { id: "ru-kk", title: "🇷🇺 ➜ 🇰🇿 Қазақ", desc: "Перевод на казахский язык", emoji: "🏔️" },
      { id: "syntax", title: "🐍 ➜ 💻 Python/JS", desc: "Конвертация синтаксиса кода", emoji: "⚙️" },
      { id: "brain", title: "🧠 Объяснение терминов", desc: "Простыми словами про науку", emoji: "☄️" },
      { id: "regex", title: "📜 RegExp генератор", desc: "Регулярные выражения", emoji: "🔍" },
      { id: "summarize", title: "📋 Краткий конспект", desc: "Сжать длинный текст", emoji: "📎" },
      { id: "quiz", title: "❓ Вопросы для теста", desc: "Сгенерировать 3 вопроса", emoji: "🎯" },
    ];

    const handleHelperTranslate = () => {
      if (!helperInputText.trim() || !selectedHelperId) return;
      setIsTranslatingHelper(true);
      setHelperResultText("");
      setTimeout(() => {
        setIsTranslatingHelper(false);
        const text = helperInputText.trim();
        const h = selectedHelperId;
        const templates: Record<string, string> = {
          "ru-en": `[EN] ${text}\n→ Hello! This academic phrase translates naturally for international study materials.`,
          "en-ru": `[RU] ${text}\n→ Понятный перевод: технический фрагмент объяснён для студента на русском.`,
          "ru-uz": `[UZ] ${text}\n→ O'zbekcha: ushbu ibora darslikda quyidagicha ifodalanadi...`,
          "ru-kk": `[KK] ${text}\n→ Қазақша аударма: оқу материалында осылай түсіндіріледі...`,
          syntax: `// JS аналог:\n${text.replace(/print/g, "console.log")}`,
          brain: `💡 ${text} — это фундаментальное понятие курса. Разберите его на 2–3 простых примера из жизни.`,
          regex: `const pattern = /^[\\w.@+-]+$/;\n// Проверяет: "${text.slice(0, 30)}..."`,
          summarize: `📋 Кратко: ${text.slice(0, 80)}…\nГлавная мысль сохранена в 2 предложениях для конспекта.`,
          quiz: `1) Что означает "${text.slice(0, 20)}"?\n2) Приведите пример.\n3) Где применяется на практике?`,
        };
        setHelperResultText(templates[h] || `✅ Обработано (${h}): ${text}`);
      }, 900);
    };

    const displayEvents =
      promoEvents.length > 0
        ? promoEvents
        : [
            {
              id: "fb-1",
              imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop",
              description: "IT-Олимпиада — соревнование по программированию. Победители получат +500 монет!",
            },
            {
              id: "fb-2",
              imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=400&fit=crop",
              description: "Хакатон ИИ-Кураторы — создайте собственного помощника на базе Gemini API.",
            },
            {
              id: "fb-3",
              imageUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=400&fit=crop",
              description: "День открытых дверей факультета — 15 декабря. Приходи и узнай о новых курсах.",
            },
            {
              id: "fb-4",
              imageUrl: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&h=400&fit=crop",
              description: "Межфакультетский спортивный турнир — болей за свою команду и зарабатывай XP!",
            },
            {
              id: "fb-5",
              imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop",
              description: "Новые курсы по Machine Learning уже доступны в каталоге лекций.",
            },
          ];


    return (
      <div className="space-y-4 animate-fade-in select-none">

        {/* YouTube Shorts — Even-spaced grid with absolutely NO empty spaces */}
        <div className="grid grid-cols-4 gap-2.5 md:gap-4.5 w-full">
          {homeShortIds.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveFullscreenShort(id)}
              className="relative aspect-[9/16] w-full rounded-2xl overflow-hidden bg-slate-950 shadow-sm md:shadow-md border border-slate-200/50 group cursor-pointer transition-all hover:scale-[1.04] active:scale-95 duration-300 outline-none select-none"
            >
              {/* Image thumbnail of the video */}
              <img
                src={`https://img.youtube.com/vi/${id}/mqdefault.jpg`}
                alt="Short thumbnail"
                className="w-full h-full object-cover group-hover:scale-110 group-hover:opacity-90 transition duration-500 pointer-events-none"
                referrerPolicy="no-referrer"
              />
              
              {/* Dark overlay and micro play button */}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-8 h-8 rounded-full bg-red-650 flex items-center justify-center shadow-lg border border-white/30 transform group-hover:scale-110 transition duration-300 text-white text-[11px] font-bold">
                  ▶
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Campus events — swipeable carousel with soft rounded corners ("тупые углы") */}
        <div className="relative mx-0 rounded-[2rem] overflow-hidden border border-slate-200/50 shadow-md">
          <div
            ref={eventsCarouselRef}
            className="flex overflow-x-auto isa-shorts-row snap-x snap-mandatory rounded-[2rem] overflow-hidden"
            style={{ scrollBehavior: "smooth" }}
            onScroll={(e) => {
              const el = e.currentTarget;
              const idx = Math.round(el.scrollLeft / el.offsetWidth);
              setCurrentEventSlide(idx);
            }}
          >
            {displayEvents.map((ev) => (
              <div
                key={ev.id}
                className="shrink-0 w-full snap-center relative select-none rounded-[2rem] overflow-hidden"
                style={{ minWidth: "100%", aspectRatio: "16/4.5" }}
              >
                <img
                  src={ev.imageUrl}
                  alt=""
                  className="w-full h-full object-cover rounded-[2rem]"
                  draggable={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent rounded-[2rem]" />
                <p className="absolute bottom-4 left-4 right-4 text-white text-[11px] font-bold leading-snug drop-shadow-lg">
                  {ev.description}
                </p>
              </div>
            ))}
          </div>
          {/* Dot indicators */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {displayEvents.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  eventsCarouselRef.current?.scrollTo({ left: i * (eventsCarouselRef.current?.offsetWidth ?? 0), behavior: "smooth" });
                  setCurrentEventSlide(i);
                }}
                className={`rounded-full transition-all cursor-pointer ${
                  currentEventSlide === i
                    ? "w-4 h-1.5 bg-white"
                    : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Cinematics Fullscreen Overlay for YouTube Shorts */}
        {activeFullscreenShort && (
          <div
            className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center p-4 animate-fade-in"
            onClick={() => setActiveFullscreenShort(null)}
          >
            <div
              className="relative w-full max-w-sm aspect-[9/16] rounded-3xl overflow-hidden border border-white/20 shadow-2xl bg-black"
              onClick={(e) => e.stopPropagation()}
            >
              <iframe
                src={`https://www.youtube.com/embed/${activeFullscreenShort}?autoplay=1&playsinline=0&controls=1&modestbranding=1&rel=0&iv_load_policy=3&fs=1&loop=1&playlist=${activeFullscreenShort}`}
                title="Short Fullscreen"
                className="w-full h-full border-0 absolute inset-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              <button
                type="button"
                onClick={() => setActiveFullscreenShort(null)}
                className="absolute top-4 right-4 bg-black/70 hover:bg-black/90 active:scale-95 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-base cursor-pointer border border-white/20 shadow-lg transition z-[210] select-none"
              >
                ✕
              </button>
            </div>
          </div>
        )}



        {eventModal && (
          <div
            className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4"
            onClick={() => setEventModal(null)}
          >
            <div
              className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img src={eventModal.imageUrl} alt="" className="w-full aspect-video object-cover" />
              <div className="p-4 space-y-2">
                <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {eventModal.description || "Описание скоро появится."}
                </p>
                <button
                  type="button"
                  onClick={() => setEventModal(null)}
                  className="w-full py-3 wellness-btn-primary text-sm cursor-pointer"
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        )}



        {/* 3 карты: коины + XP слева стопкой, Lessons справа большая */}
        <div className="grid grid-cols-2 gap-2">
          {/* Левая колонка: Coins и XP друг над другом */}
          <div className="flex flex-col gap-2">
            <div
              className="wellness-card p-3 flex flex-col justify-between text-left"
            >
              <span className="isa-section-label">{t("house_coins")}</span>
              <div className="flex items-end gap-1 mt-1.5">
                <span className="text-2xl font-extrabold text-isa-navy">{userCoins}</span>
                <span className="text-sm mb-0.5">🪙</span>
              </div>
              <span className="mt-1.5 text-[9px] font-bold text-slate-400">{t("xp_descr")}</span>
            </div>

            <div className="wellness-card p-3 flex flex-col justify-between">
              <span className="isa-section-label">{t("merit_points")}</span>
              <div className="flex items-end gap-1 mt-1.5">
                <span className="text-2xl font-extrabold text-isa-navy">{userRating}</span>
                <span className="text-[10px] text-isa-navy-mid font-bold mb-1">XP</span>
              </div>
              <span className="isa-badge-gold mt-1.5 inline-block">{t("merit_descr")} (Rank #4)</span>
            </div>
          </div>

          {/* Правая колонка: большая кнопка Lessons */}
          {(() => {
            const currentSelectedCourse = activeCourse || (courses && courses.length > 0 ? courses[0] : null);
            const homeCoursePct = (() => {
              if (!currentSelectedCourse) return 0;
              const completedCount = currentSelectedCourse.lessons.filter(l => studentStats.completedLessons.includes(l.id)).length;
              const totalLessons = currentSelectedCourse.lessons.length;
              return totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
            })();
            const homeCoursePctCapped = Math.min(homeCoursePct, 100);

            return (
              <button
                type="button"
                onClick={() => {
                  setCurrentTab("lessons");
                  // Keep activeCourse if it exists, otherwise set to first active course to allow resuming
                  if (!activeCourse && currentSelectedCourse) {
                    setActiveCourse(currentSelectedCourse);
                  }
                }}
                className="isa-lessons-cta p-4 rounded-2xl flex flex-col justify-between text-left cursor-pointer hover:opacity-95 transition shadow-md group relative overflow-hidden"
                style={{ minHeight: "212px" }}
              >
                <div className="flex justify-between items-start">
                  <BookOpen className="w-7 h-7 text-isa-gold-light group-hover:scale-110 transition" />
                  {currentSelectedCourse && (
                    <span className="bg-white/25 text-white font-mono text-[9px] font-black px-2.5 py-1 rounded-xl backdrop-blur-xs select-none border border-white/10">
                      {homeCoursePctCapped}% Пройдено
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-xl font-extrabold block leading-tight text-white">Lessons</span>
                  <span className="text-[10.5px] font-semibold opacity-90 block mt-1 truncate max-w-[150px] text-white/90">
                    {currentSelectedCourse ? currentSelectedCourse.title : "Учебный план"}
                  </span>
                </div>
                
                <div className="space-y-2 w-full">
                  {currentSelectedCourse && (
                    <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden">
                      <div className="bg-white h-full transition-all duration-300" style={{ width: `${homeCoursePctCapped}%` }} />
                    </div>
                  )}
                  <span className="text-[10px] opacity-95 font-bold block text-white">
                    {activeCourse ? "Продолжить занятие →" : "Начать обучение →"}
                  </span>
                </div>
              </button>
            );
          })()}
        </div>


        {/* Инструменты Rider AI - Сетка Сервисов */}
        <div className="space-y-4 pt-1">
          <div className="flex items-center justify-between px-1.5">
            <span className="text-[10px] font-black uppercase text-slate-400 font-mono tracking-widest">Инструменты Rider AI</span>
            <div className="h-[1px] flex-1 bg-slate-100 ml-3" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {toolsList.map((tool) => (
              <div
                key={tool.id}
                onClick={() => {
                  if (tool.tab === "exam-hub") {
                    setCurrentTab("exam-hub");
                    setExamHubActiveTab("my-exams");
                  } else {
                    setCurrentTab(tool.tab as any);
                  }
                }}
                className="group relative rounded-[2rem] overflow-hidden border border-slate-200/70 bg-white hover:border-[#10B981] hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between h-[155px]"
              >
                {/* Visual Photo Background */}
                <div className="absolute inset-0 overflow-hidden">
                  <img 
                    src={tool.image} 
                    alt={tool.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none opacity-85"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-900/30" />
                </div>

                {/* Top Row: Icon & Tag */}
                <div className="relative z-10 p-4 flex items-center justify-between">
                  <span className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-lg shadow-sm select-none">
                    {tool.icon}
                  </span>
                  <span className="text-[7.5px] uppercase font-mono font-black tracking-widest text-[#10B981] bg-[#ECFDF5]/10 backdrop-blur-md px-2 py-0.5 rounded-full border border-[#10B981]/25 select-none">
                    RIDER AI
                  </span>
                </div>

                {/* Bottom Row: Info & Action */}
                <div className="relative z-10 p-4 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent pt-6 text-left">
                  <h4 className="text-white text-[12.5px] font-black tracking-tight leading-tight mb-1 group-hover:text-[#10B981] transition-colors flex items-center gap-1.5">
                    {tool.title} <span className="text-xs group-hover:translate-x-1 transition-transform">➜</span>
                  </h4>
                  <p className="text-[10px] text-slate-300 leading-relaxed font-medium line-clamp-2 select-none">
                    {tool.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    );
  };

  const renderVoiceLessonWorkspace = () => {
    if (!activeVoiceLesson) return null;

    const isNarrationMode = voiceLessonStep === -1;
    const totalQuestions = activeVoiceLesson.questions.length;
    const currentQ = voiceLessonStep >= 0 && voiceLessonStep < totalQuestions ? activeVoiceLesson.questions[voiceLessonStep] : null;

    return (
      <div className="space-y-4 animate-fade-in p-1">
        
        {/* Workspace Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                stopVoiceSpeaking();
                setActiveVoiceLesson(null);
              }}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-705 transition cursor-pointer flex items-center justify-center border border-slate-200"
              title="Назад к курсам"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
            </button>
            <div>
              <span className="bg-emerald-100 border border-emerald-300 text-emerald-800 text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase font-mono tracking-wider">
                🎧 ИИ Аудио-Лекторий
              </span>
              <h2 className="text-xs md:text-sm font-black text-slate-905 tracking-tight leading-none mt-1">
                {activeVoiceLesson.topic}
              </h2>
            </div>
          </div>

          <div className="flex gap-2 items-center">
            <span className="text-[10px] text-slate-400 font-bold">Скорость речи:</span>
            <div className="flex gap-0.5 bg-slate-50 border border-slate-150 p-0.5 rounded-lg">
              {[0.8, 1.0, 1.25].map(rate => (
                <button
                  key={rate}
                  onClick={() => {
                    setVoiceRate(rate);
                    if (isVoiceSpeaking) {
                      // Restart current sentence with new rate
                      if (isNarrationMode) {
                        handleNarrateParagraph(currentNarratingParagraph);
                      } else if (currentQ) {
                        startVoiceSpeaking(currentQ.question);
                      }
                    }
                  }}
                  className={`text-[9px] font-mono px-2 py-0.5 rounded-md font-bold transition ${
                    voiceRate === rate ? "bg-emerald-650 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {isNarrationMode ? (
          /* NARRATION SCREEN */
          <div className="space-y-4">
            
            {/* Rider Speaking Indicator */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <span className="text-3xl">🎙️</span>
                  {isVoiceSpeaking && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-[11px] font-black text-emerald-950 block leading-tight">ИИ Райдер читает лекцию</span>
                  <p className="text-[9.5px] text-emerald-800 font-medium">Прослушайте профессиональную емкую выжимку по теме!</p>
                </div>
              </div>

              <div className="flex gap-1.5">
                {isVoiceSpeaking ? (
                  <button
                    onClick={stopVoiceSpeaking}
                    className="bg-rose-500 hover:bg-rose-600 text-white p-2 text-xs rounded-full shadow-md transition cursor-pointer flex items-center justify-center w-8 h-8"
                    title="Приостановить озвучку"
                  >
                    ⏹️
                  </button>
                ) : (
                  <button
                    onClick={() => handleNarrateParagraph(currentNarratingParagraph)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 text-xs rounded-full shadow-md transition cursor-pointer flex items-center justify-center w-8 h-8 animate-pulse"
                    title="Слушать текущий абзац"
                  >
                    ▶️
                  </button>
                )}
              </div>
            </div>

            {/* Paragraphs Panel */}
            <div className="bg-white rounded-3xl border border-slate-200 p-4.5 space-y-3.5 shadow-sm">
              <div className="text-[9.5px] text-slate-400 font-bold font-mono uppercase tracking-wider">Теоретический обзор:</div>
              
              <div className="space-y-3">
                {activeVoiceLesson.paragraphs.map((para, pIdx) => {
                  const isActive = currentNarratingParagraph === pIdx;
                  return (
                    <div
                      key={pIdx}
                      onClick={() => {
                        setCurrentNarratingParagraph(pIdx);
                        handleNarrateParagraph(pIdx);
                      }}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer text-xs leading-relaxed ${
                        isActive
                          ? "bg-emerald-50 border-emerald-400 text-emerald-950 ring-2 ring-emerald-400/10 shadow-sm font-medium"
                          : "bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className={`text-[10px] w-5 h-5 rounded-full flex items-center justify-center shrink-0 font-bold font-mono ${
                          isActive ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-600"
                        }`}>
                          {pIdx + 1}
                        </span>
                        <div className="flex-1">
                          <p className="whitespace-pre-line">{para}</p>
                          {isActive && isVoiceSpeaking && (
                            <span className="inline-flex gap-0.5 items-center text-[8.5px] text-emerald-700 font-bold mt-2 bg-emerald-500/10 px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">
                              🔊 СИНТЕЗ КИПИТ...
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Navigation timeline */}
              <div className="flex justify-between items-center pt-3 border-t border-slate-105">
                <div className="flex gap-1.5">
                  <button
                    disabled={currentNarratingParagraph === 0}
                    onClick={() => {
                      const idx = currentNarratingParagraph - 1;
                      setCurrentNarratingParagraph(idx);
                      handleNarrateParagraph(idx);
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded-lg text-[10px] font-extrabold cursor-pointer transition select-none border border-slate-200"
                  >
                    ◀ Назад
                  </button>
                  <button
                    disabled={currentNarratingParagraph === activeVoiceLesson.paragraphs.length - 1}
                    onClick={handleNextParagraphAuto}
                    className="px-3 py-1.5 bg-slate-150 hover:bg-slate-200 disabled:opacity-40 text-slate-800 rounded-lg text-[10px] font-extrabold cursor-pointer transition select-none border border-slate-200"
                  >
                    Вперед ▶
                  </button>
                </div>

                <button
                  onClick={() => {
                    stopVoiceSpeaking();
                    setVoiceLessonStep(0); // jump straight to questions
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10.5px] font-black py-2 px-4 rounded-xl cursor-pointer transition flex items-center gap-1 shadow-sm uppercase tracking-wide"
                >
                  🎯 Перейти к тесту
                </button>
              </div>
            </div>

          </div>
        ) : voiceCompleted ? (
          /* COMPLETION VIEW */
          <div className="bg-white border border-slate-200 rounded-3xl p-6 text-center space-y-5 animate-fade-in py-10 shadow-sm">
            <span className="text-5xl block animate-bounce">🏆</span>
            
            <div className="space-y-1">
              <span className="bg-[#4285F4]/10 text-[#4285F4] text-[8.5px] px-2 py-0.5 rounded border border-[#4285F4]/20 font-extrabold tracking-wider uppercase">
                Базовый разбор завершен успешно!
              </span>
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Урок пройден отлично!
              </h2>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto leading-relaxed">
                Поздравляем! Вы прослушали голосовое объяснение Райдера ИИ по теме "{activeVoiceLesson.topic}" и успешно ответили на проверочные вопросы.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 max-w-xs mx-auto text-center">
              <span className="text-[8.5px] uppercase font-bold text-slate-400 block font-mono">Ваш балл проверки</span>
              <span className="text-xl font-black font-mono text-emerald-600">
                {voiceScore} <span className="text-sm font-semibold text-slate-400">/ {totalQuestions}</span>
              </span>
            </div>

            <p className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 max-w-xs mx-auto">
              🌟 Вы заработали +40 XP ИИ-активности!
            </p>

            <button
              onClick={() => {
                stopVoiceSpeaking();
                setActiveVoiceLesson(null);
                setVoiceCompleted(false);
                setVoiceLessonStep(-1);
                // Update studentStats XP as well!
                updateStats({ aiChatMessagesCount: (studentStats.aiChatMessagesCount || 0) + 15 });
              }}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-[10.5px] font-black rounded-xl cursor-pointer shadow transition select-none uppercase tracking-wider"
            >
              Вернуться в Лекторий
            </button>
          </div>
        ) : (
          /* QUESTION TEST VIEW */
          <div className="bg-white rounded-3xl border border-slate-205 p-5 shadow-sm space-y-4.5">
            <div className="space-y-2 pb-1.5 border-b border-slate-100">
              <div className="flex justify-between items-center text-[9.5px] text-slate-400 font-mono font-bold uppercase tracking-widest">
                <span>Проверочный тест Райдера:</span>
                <span>Вопрос {voiceLessonStep + 1} из {totalQuestions}</span>
              </div>
              
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-indigo-650 transition-all duration-300"
                  style={{ width: `${((voiceLessonStep + 1) / totalQuestions) * 105}%` }}
                />
              </div>
            </div>

            {currentQ && (
              <div className="space-y-4">
                <h3 className="text-xs md:text-sm font-extrabold text-slate-900 leading-snug">
                  {currentQ.question}
                </h3>

                {/* Speaker playback for testing question itself! */}
                <button
                  onClick={() => startVoiceSpeaking(currentQ.question)}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-750 font-bold text-[9.5px] py-1 px-3.5 rounded-lg border border-indigo-150 transition inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {isVoiceSpeaking ? "🔊 Озвучка идет..." : "🎙️ Озвучить вопрос ИИ"}
                </button>

                <div className="space-y-2">
                  {currentQ.options.map((opt, oIdx) => {
                    const isSelected = selectedVoiceOption === opt;
                    const isCorrect = opt === currentQ.correctAnswer;
                    const isWrongSelection = isSelected && !isCorrect;

                    let classes = "border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100";
                    if (revealedVoiceQuestion) {
                      if (isCorrect) {
                        classes = "border-emerald-500 bg-emerald-50 text-emerald-800 font-bold";
                      } else if (isWrongSelection) {
                        classes = "border-rose-500 bg-rose-50 text-rose-800 font-bold";
                      } else {
                        classes = "border-slate-150 bg-slate-100 text-slate-400 opacity-60";
                      }
                    } else if (isSelected) {
                      classes = "border-indigo-600 bg-indigo-50 text-indigo-900 font-black";
                    }

                    return (
                      <button
                        key={oIdx}
                        disabled={revealedVoiceQuestion}
                        onClick={() => setSelectedVoiceOption(opt)}
                        className={`w-full text-left p-3 rounded-xl border text-[11px] font-semibold transition flex justify-between items-center cursor-pointer ${classes}`}
                      >
                        <span>{opt}</span>
                        {revealedVoiceQuestion && isCorrect && <span className="text-emerald-600 font-bold text-xs">✓ Верно</span>}
                        {revealedVoiceQuestion && isWrongSelection && <span className="text-rose-600 font-bold text-xs">✗ Неверно</span>}
                      </button>
                    );
                  })}
                </div>

                {revealedVoiceQuestion && (
                  <div className="bg-emerald-50 border border-emerald-250 p-4.5 rounded-2xl text-[10px] md:text-[11px] text-emerald-955 leading-relaxed animate-fade-in space-y-1">
                    <span className="font-extrabold uppercase text-emerald-850 tracking-wider font-mono block">💡 ИИ-эксперт Райдер:</span>
                    <p>{currentQ.explanation}</p>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  {!revealedVoiceQuestion ? (
                    <button
                      disabled={!selectedVoiceOption}
                      onClick={() => {
                        setRevealedVoiceQuestion(true);
                        const isCorrect = selectedVoiceOption === currentQ.correctAnswer;
                        if (isCorrect) setVoiceScore(prev => prev + 1);
                        if (siteVibration && "vibrate" in navigator) {
                          navigator.vibrate(isCorrect ? [40, 40] : [100, 50, 100]);
                        }
                        // Speak feedback automatically!
                        const feedbackSpeech = isCorrect 
                          ? `Правильно! ${currentQ.explanation}`
                          : `Неверно. Правильный ответ: ${currentQ.correctAnswer}. ${currentQ.explanation}`;
                        startVoiceSpeaking(feedbackSpeech);
                      }}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white text-[10px] font-extrabold rounded-lg transition h-fit inline-flex items-center gap-1 cursor-pointer uppercase select-none tracking-wider shadow-sm"
                    >
                      ✔️ Проверить
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedVoiceOption(null);
                        setRevealedVoiceQuestion(false);
                        stopVoiceSpeaking();
                        
                        if (voiceLessonStep < totalQuestions - 1) {
                          const nextStep = voiceLessonStep + 1;
                          setVoiceLessonStep(nextStep);
                          // Auto speak next question!
                          if (activeVoiceLesson.questions[nextStep]) {
                            setTimeout(() => {
                              startVoiceSpeaking(activeVoiceLesson.questions[nextStep].question);
                            }, 500);
                          }
                        } else {
                          // Complete!
                          setVoiceCompleted(true);
                        }
                      }}
                      className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white text-[10px] font-extrabold rounded-lg transition h-fit inline-flex items-center gap-1.5 cursor-pointer uppercase select-none tracking-wider shadow-sm"
                    >
                      <span>Дальше</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // TAB 2: COURSE CATALOG & CLASSROOM LECTURES
  const renderLessonsTab = () => {
    // If studying an active voice lesson, render audio studio workspace!
    if (activeVoiceLesson) {
      return renderVoiceLessonWorkspace();
    }

    // If studying an active course, render study workspace!
    if (activeCourse) {
      const currentLesson = activeCourse.lessons[activeLessonIdx];
      const isLessonComplete = currentLesson ? studentStats.completedLessons.includes(currentLesson.id) : false;

      // Calculate progress of this specific course: completed lessons vs total
      const courseLessonsCount = activeCourse.lessons.length;
      const completedLessonsInCourse = activeCourse.lessons.filter(l => studentStats.completedLessons.includes(l.id)).length;
      const courseProgressPct = courseLessonsCount > 0 ? Math.round((completedLessonsInCourse / courseLessonsCount) * 100) : 0;

      return (
        <div className="space-y-4 animate-fade-in p-1 text-left font-sans">
          {/* Top header navigation buttons */}
          <button
            onClick={() => setActiveCourse(null)}
            className="inline-flex items-center gap-1.5 text-slate-700 hover:text-slate-900 text-[10px] font-extrabold bg-white border border-slate-205 py-1.5 px-3.5 rounded-xl shadow-sm cursor-pointer transition"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#EA4335]" />
            Прервать и выйти к курсам
          </button>

          {/* Classroom Header Banner with Improved CSS & Percentage tracker */}
          <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-2xl border-2 border-slate-100 p-4.5 space-y-3.5 shadow-md relative overflow-hidden">
            <span className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-400/10 to-transparent rounded-bl-full pointer-events-none" />
            
            <div className="flex items-center justify-between">
              <span className="bg-[#4285F4]/10 text-[#4285F4] text-[8.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-[#4285F4]/20">
                {activeCourse.category}
              </span>
              <span className="text-emerald-700 text-[10.5px] font-mono font-black select-none">
                {courseProgressPct === 100 ? "🎉 Пройдено 100%" : `📈 Пройдено: ${courseProgressPct}%`}
              </span>
            </div>

            <h2 className="text-base font-black text-slate-900 tracking-tight leading-tight pr-6">
              {activeCourse.title}
            </h2>

            {/* Premium Progress Bar */}
            <div className="space-y-1">
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden p-[1px] border border-slate-150">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-400 to-[#34A853] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${courseProgressPct}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
                <span>Изучено уроков: {completedLessonsInCourse} из {courseLessonsCount}</span>
                <span>{courseProgressPct}% завершено</span>
              </div>
            </div>

            {/* Sub classroom mode selector switcher with persistent quiz state */}
            <div className="grid grid-cols-2 gap-2 pt-1.5">
              <button
                onClick={() => setClassroomTab("lessons")}
                className={`py-1.5 rounded-xl text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                  classroomTab === "lessons" 
                    ? "bg-slate-900 text-white shadow-xs" 
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                }`}
              >
                📖 Лекции ({activeCourse.lessons.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setClassroomTab("quiz");
                  // We DO NOT reset quiz parameters here to allow continuing tests exactly where they left!
                }}
                className={`py-1.5 rounded-xl text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                  classroomTab === "quiz" 
                    ? "bg-slate-900 text-white shadow-xs" 
                    : "bg-slate-100 hover:bg-slate-200 text-slate-705 border border-slate-200"
                }`}
              >
                🎯 Контроль ({activeCourse.quizzes.length})
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            
            {/* LECTURES SLIDES VIEW */}
            {classroomTab === "lessons" ? (
              <motion.div
                key="lessons-deck"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-4"
              >
                {/* Lecture selection slider indicators */}
                <div className="flex gap-2.0 overflow-x-auto py-1 select-none">
                  {activeCourse.lessons.map((les, idx) => {
                    const done = studentStats.completedLessons.includes(les.id);
                    const isCurrent = idx === activeLessonIdx;
                    return (
                      <button
                        key={les.id}
                        onClick={() => setActiveLessonIdx(idx)}
                        className={`px-3 py-1.5 rounded-xl text-[10.5px] font-bold border transition-all shrink-0 cursor-pointer ${
                          isCurrent 
                            ? "bg-[#4285F4] text-white border-[#4285F4] font-black" 
                            : done 
                            ? "bg-[#E6F4EA] text-[#137333] border-[#A8DAB5]" 
                            : "bg-white text-slate-650 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {done ? "✓" : idx + 1}. {les.title.substring(0, 18)}...
                      </button>
                    );
                  })}
                </div>

                {/* Lesson Sheet Paper */}
                {currentLesson ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-4.5 space-y-3.5 relative shadow-sm">
                    <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold uppercase tracking-widest font-mono">
                      <span>Лекционный материал</span>
                      <span>⏱️ ~{currentLesson.estimatedTime} мин</span>
                    </div>

                    <h3 className="text-sm font-extrabold text-[#202124] leading-snug">
                      {currentLesson.title}
                    </h3>

                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                      {currentLesson.content}
                    </p>

                    <div className="bg-[#E8F0FE]/60 rounded-xl p-3 border border-[#AECBFA]/40 flex flex-col sm:flex-row justify-between items-center gap-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🎙️</span>
                        <div>
                          <span className="text-[10.5px] font-black text-[#1967D2] block leading-tight">Сложно читать? Озвучить с ИИ!</span>
                          <span className="text-[9px] text-[#4285F4] font-medium block">ИИ Райдер объяснит всё вслух и проверит вас.</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleStartVoiceLesson(currentLesson.title)}
                        className="bg-[#4285F4] hover:bg-blue-600 text-white font-extrabold text-[9px] py-1.5 px-3 rounded-lg shadow-sm transition flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        🗣️ Запустить разбор с озвучкой
                      </button>
                    </div>

                    {/* Styled parts list */}
                    {renderVisualParts(currentLesson.parts)}

                    {/* Continue Exercises Alert box in the slide */}
                    <div className="bg-emerald-50/65 rounded-xl p-3 border border-emerald-200/50 flex items-center justify-between text-left gap-2 select-none">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-600 text-base">🎯</span>
                        <div>
                          <span className="text-[10.5px] font-black text-emerald-800 block leading-tight">Продолжить решать упражнения?</span>
                          <span className="text-[9px] text-emerald-600 font-semibold block">Ваш прогресс в тестировании сохранен автоматически.</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setClassroomTab("quiz")}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[9px] py-1.5 px-3 rounded-lg shadow-xs transition cursor-pointer shrink-0"
                      >
                        Решать упражнения →
                      </button>
                    </div>

                    {/* Lesson Footer Controls */}
                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/50 -mx-4.5 -mb-4.5 p-4 rounded-b-2xl">
                      <div className="text-[10px] text-slate-400 font-bold font-mono">Слайд {activeLessonIdx + 1} из {activeCourse.lessons.length}</div>
                      
                      <button
                        onClick={() => handleMarkLessonComplete(currentLesson.id)}
                        className={`py-1.5 px-3.5 rounded-xl text-[10.5px] font-black shadow transition-all cursor-pointer flex items-center gap-1 ${
                          isLessonComplete 
                            ? "bg-[#34A853] hover:bg-[#2C8E47] text-white" 
                            : "bg-slate-900 hover:bg-slate-850 text-white"
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        {isLessonComplete 
                          ? "Изучено (следующий)" 
                          : "Завершить изучение"}
                      </button>
                    </div>

                  </div>
                ) : (
                  <div className="text-center text-xs p-6 bg-white rounded-2xl text-slate-400 border border-slate-200">
                    Урок не найден или база данных устарела.
                  </div>
                )}
              </motion.div>
            ) : (
              
              // LIVE QUIZ EXAMINATION MODE
              <motion.div
                key="quiz-deck"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-4"
              >
                {!quizCompleted ? (
                  <div className="bg-white rounded-2xl border border-slate-203 p-4 space-y-4 shadow-sm">
                    <div className="space-y-2 pb-1 border-b border-slate-100">
                      <div className="flex justify-between items-center text-[9.5px] text-slate-400 font-mono font-bold uppercase tracking-widest">
                        <span>Контрольное тестирование</span>
                        <span>Вопрос {currentQuizIdx + 1} / {activeCourse.quizzes.length}</span>
                      </div>
                      
                      {/* Visual progress bar using motion.div */}
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden relative">
                        <motion.div
                          className="h-full bg-[#34A853]"
                          initial={{ width: 0 }}
                          animate={{ width: `${activeCourse.quizzes.length > 0 ? ((currentQuizIdx + 1) / activeCourse.quizzes.length) * 100 : 0}%` }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                        />
                      </div>
                    </div>

                    <h3 className="text-xs md:text-sm font-extrabold text-slate-900 leading-snug">
                      {activeCourse.quizzes[currentQuizIdx]?.question}
                    </h3>

                    <div className="space-y-2 pt-1.5">
                      {activeCourse.quizzes[currentQuizIdx]?.options.map((opt, oIdx) => {
                        const isSelected = selectedAnswer === opt;
                        const isCorrect = opt === activeCourse.quizzes[currentQuizIdx].correctAnswer;
                        const isWrongSelection = isSelected && !isCorrect;

                        let styleClasses = "border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100";
                        if (isAnswerRevealed) {
                          if (isCorrect) {
                            styleClasses = "border-[#34A853] bg-[#E6F4EA] text-[#137333] font-bold";
                          } else if (isWrongSelection) {
                            styleClasses = "border-[#EA4335] bg-[#FCE8E6] text-[#C5221F] font-bold";
                          } else {
                            styleClasses = "border-slate-150 bg-slate-100 text-slate-400 opacity-60";
                          }
                        } else if (isSelected) {
                          styleClasses = "border-[#4285F4] bg-[#E8F0FE] text-[#1967D2] font-black";
                        }

                        return (
                          <button
                            key={oIdx}
                            disabled={isAnswerRevealed}
                            onClick={() => handleSubmitAnswer(opt, activeCourse.quizzes[currentQuizIdx])}
                            className={`w-full text-left p-3 rounded-xl border text-[11px] font-bold leading-normal transition flex justify-between items-center cursor-pointer ${styleClasses}`}
                          >
                            <span>{opt}</span>
                            {isAnswerRevealed && isCorrect && <CheckCircle className="w-4 h-4 text-[#34A853] shrink-0" />}
                            {isAnswerRevealed && isWrongSelection && <AlertTriangle className="w-4 h-4 text-[#EA4335] shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    {isAnswerRevealed && (
                      <div className="bg-[#E8F0FE] p-3 rounded-xl border border-[#AECBFA] text-[10.5px] text-[#1967D2] leading-relaxed space-y-1">
                        <span className="font-extrabold uppercase tracking-wide block">💡 Разбор от ИИ Капусты:</span>
                        <p>{activeCourse.quizzes[currentQuizIdx]?.explanation}</p>
                      </div>
                    )}

                    <div className="pt-3 border-t border-slate-100 flex justify-end">
                      {isAnswerRevealed ? (
                        <button
                          onClick={handleNextQuizQuestion}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold rounded-lg transition h-fit inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          {currentQuizIdx < activeCourse.quizzes.length - 1 ? "Дальше" : "Посмотреть итог"}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold py-2">Выберите один вариант ответа</span>
                      )}
                    </div>
                  </div>
                ) : (
                  // EXAM FINISHED SCREEN WITH FEEDBACK FORM
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center space-y-5 shadow-sm">
                    <span className="text-3xl block">🏆</span>
                    <h3 className="text-base font-black text-slate-900">Тест сдан успешно!</h3>
                    
                    <div className="bg-slate-50 border border-slate-150 p-4.5 rounded-xl text-center">
                      <span className="text-slate-500 font-bold block text-[10.5px] uppercase tracking-wider">Ваши баллы:</span>
                      <span className="text-3xl font-black font-mono text-slate-800">
                        {quizScore} <span className="text-sm font-semibold text-slate-400">/ {activeCourse.quizzes.length}</span>
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed px-4">
                      {quizScore === activeCourse.quizzes.length 
                        ? "Замечательно! Академический лекторий пройден со 100% результатом!" 
                        : "Хорошая работа! Оценка добавлена в картотеку учебного табеля."}
                    </p>

                    {/* Brief feedback form below result */}
                    <form onSubmit={handleFeedbackSubmit} className="space-y-3.5 text-left border-t border-slate-100 pt-4">
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase text-slate-500">
                        <span>Оставить оценку курсу:</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(st => (
                            <button key={st} type="button" onClick={() => setRating(st)} className="focus:outline-none">
                              <Star className={`w-3.5 h-3.5 ${st <= rating ? "text-[#FBBC05] fill-current" : "text-slate-350"}`} />
                            </button>
                          ))}
                        </div>
                      </div>

                      <input
                        type="text"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Отзыв... Помогите Капусте доработать дидактику..."
                        className="w-full text-[11px] p-2.5 border border-slate-205 rounded-xl bg-slate-50"
                      />

                      <button
                        type="submit"
                        disabled={submittingFeedback || feedbackSubmitted}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white text-[10px] py-2 px-3 rounded-lg font-bold transition-all disabled:bg-slate-300"
                      >
                        {feedbackSubmitted ? "✓ Отзыв отправлен, спасибо!" : "Сохранить отзыв в реестре"}
                      </button>
                    </form>

                    <button
                      onClick={() => {
                        setActiveCourse(null);
                        onRefreshCourses();
                      }}
                      className="w-full bg-[#4285F4] hover:bg-blue-600 text-white py-2.5 text-xs font-black rounded-lg transition shadow-md"
                    >
                      Вернуться к курсам
                    </button>
                  </div>
                )}
              </motion.div>
            )}
            
          </AnimatePresence>
        </div>
      );
    }

    // LIST CATALOG view if no activeCourse studied
    return (
      <div className="space-y-4 animate-fade-in p-1">
        <div className="flex justify-between items-center bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="font-extrabold text-[#202124] text-xs uppercase tracking-wider">Каталог Лекций ({courses.length})</h3>
          <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-650 px-2 py-0.5 rounded-lg font-mono">
            Облачная База
          </span>
        </div>

        {/* Playful AI Voice lesson launcher board */}
        <div className="bg-gradient-to-r from-emerald-500/10 via-[#34A853]/5 to-blue-500/5 border border-emerald-500/20 rounded-2xl p-4.5 space-y-3 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-bounce">🗣️</span>
            <div>
              <h4 className="font-extrabold text-[#202124] text-xs md:text-sm tracking-tight flex items-center gap-1.5">
                <span>ИИ Аудио-Репетитор Райдер</span>
                <span className="bg-isa-navy text-isa-gold-light text-[7.5px] font-extrabold px-1.5 py-0.5 rounded uppercase font-mono tracking-wider animate-pulse">РАЙДЕР ИИ</span>
              </h4>
              <p className="text-[10px] text-slate-505 leading-snug">
                Введите любую сложную или интересную тему. Наш ИИ объяснит её основные понятия голосом и устроит мини-проверку!
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={customVoiceTopic}
              onChange={(e) => setCustomVoiceTopic(e.target.value)}
              placeholder="Например: Основы циклов в Python, Аналогия баз данных, Фотосинтез..."
              className="flex-1 bg-white border border-slate-200 py-2 px-3 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-505 font-medium"
            />
            <button
              disabled={generatingVoiceLesson}
              onClick={() => handleStartVoiceLesson(customVoiceTopic)}
              className="bg-[#34A853] hover:bg-emerald-700 disabled:bg-slate-300 text-white font-extrabold text-[10.5px] px-4.5 rounded-xl transition cursor-pointer flex items-center gap-1 shrink-0"
            >
              {generatingVoiceLesson ? (
                <>
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Генерация...
                </>
              ) : (
                <>
                  <span>🎙️ Начать аудиоурок</span>
                </>
              )}
            </button>
          </div>

          {/* Quick presets buttons */}
          <div className="flex gap-1.5 flex-wrap pt-0.5 select-none text-[9.5px] font-bold text-slate-500 leading-none">
            <span className="text-slate-400 font-medium py-1">Примеры:</span>
            {[
              "Что такое ООП?",
              "Принцип работы Баз Данных",
              "Как работает Интернет?",
              "Основы Кибербезопасности"
            ].map((topic) => (
              <button
                key={topic}
                onClick={() => {
                  setCustomVoiceTopic(topic);
                  handleStartVoiceLesson(topic);
                }}
                className="bg-white hover:bg-emerald-50 border border-slate-200 text-slate-700 hover:text-emerald-750 px-2.5 py-1 rounded-lg transition text-[9px] cursor-pointer"
              >
                💡 {topic}
              </button>
            ))}
          </div>
        </div>

        {courses.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-slate-400 text-xs">
            Нет доступных курсов. Напишите или сгенерируйте в Админ-панели!
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCoursesByQuery.map((course) => {
              const isGrade = studentStats.gradedQuizzes[course.id];
              const completedCount = course.lessons.filter(l => studentStats.completedLessons.includes(l.id)).length;
              const totalLessons = course.lessons.length;
              const pct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

              return (
                <div 
                  key={course.id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-[#4285F4]/60 p-4 shadow-sm space-y-3 transition group relative"
                >
                  {course.createdWithAI && (
                    <div className="absolute top-3.5 right-3.5 bg-[#E8F0FE] text-[#1967D2] border border-[#AECBFA] px-1.5 py-0.5 rounded text-[8px] font-extrabold flex items-center gap-0.5 uppercase tracking-wider scale-95">
                      <Sparkles className="w-2.5 h-2.5 text-[#4285F4] animate-pulse" />
                      Gemini ИИ
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="bg-[#34A853]/10 text-[#137333] border border-[#A8DAB5] font-extrabold py-0.5 px-1.5 rounded text-[8.5px] uppercase">
                        {course.category}
                      </span>
                      <span className="bg-slate-100 text-slate-500 font-mono py-0.5 px-1.5 rounded text-[8.5px]">
                        {course.difficulty}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-slate-900 text-xs md:text-sm pt-1 hover:text-[#4285F4] transition duration-150 leading-snug">
                      {course.title}
                    </h4>
                    <p className="text-slate-500 text-[10.5px] md:text-xs leading-relaxed line-clamp-2">
                      {course.description}
                    </p>
                  </div>

                  {/* progress stat bar inside card */}
                  <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl space-y-1">
                    <div className="flex justify-between items-center text-[9.5px] font-bold text-slate-450">
                      <span>Прогресс: {completedCount}/{totalLessons} уроков</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#4285F4] transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartCourse(course)}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-2 px-4 rounded-xl text-[10.5px] flex items-center justify-center gap-1.5 transition select-none cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Начать лекторий
                  </button>

                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // TAB 4: INTERACTIVE DUOLINGO AI LESSONS (lessons)
  const renderSearchTab = () => {
    // If we are currently loading/generating a lesson
    if (isGeneratingDuo) {
      return (
        <div className="space-y-6 animate-fade-in p-2 text-center py-12 bg-white rounded-3xl border border-slate-100 flex flex-col items-center justify-center min-h-[400px]">
          {/* Animated Playful Green Owl Placeholder loader */}
          <div className="relative w-24 h-24 mb-6">
            <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-75" />
            <div className="absolute inset-1 bg-emerald-555 text-white text-5xl rounded-full flex items-center justify-center shadow-lg relative z-10 animate-pulse">
              🦉
            </div>
          </div>
          <div className="space-y-2 max-w-xs select-none">
            <h3 className="text-base font-black text-slate-900 tracking-tight">Загружаем интерактивный урок...</h3>
            <p className="text-[10.5px] text-slate-450 leading-relaxed font-sans">
              Наш ИИ-сервер подключается к Duolingo и адаптирует уроки в реальном времени под ваш текущий уровень знаний!
            </p>
          </div>
          <div className="w-48 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-6 relative border border-slate-200">
            <div className="h-full bg-emerald-500 animate-[bounce_1.5s_infinite]" style={{ width: '45%' }} />
          </div>
        </div>
      );
    }

    // If active lesson gameplay is loaded
    if (activeDuolingoLesson) {
      const parts = activeDuolingoLesson.parts;
      const isCompleted = duolingoStep >= parts.length || duolingoLives <= 0;
      
      if (isCompleted) {
        return (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 text-center space-y-6 animate-fade-in py-10">
            <div className="text-6xl animate-bounce">
              {duolingoLives > 0 ? "🏆" : "💀"}
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-indigo-950 font-sans">
                {duolingoLives > 0 ? "Урок успешно пройден!" : "Жизни закончились!"}
              </h2>
              <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs mx-auto">
                {duolingoLives > 0 
                  ? "Потрясающая работа! Вы освоили новые навыки в игровом центре Duolingo." 
                  : "Не расстраивайтесь! Шахматы, языки и математика требуют времени. Попробуйте пройти урок заново."}
              </p>
            </div>

            {/* XP Gained Statistics and Streak Increment */}
            <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3.5 text-center">
                <span className="text-[8.5px] uppercase font-bold text-emerald-600 block leading-tight font-mono">Набрано очков</span>
                <span className="text-lg font-mono font-black text-emerald-700">+{duolingoXP} XP</span>
              </div>
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-3.5 text-center">
                <span className="text-[8.5px] uppercase font-bold text-indigo-650 block leading-tight font-mono">Супер Серия</span>
                <span className="text-lg font-mono font-black text-indigo-700">
                  {duolingoLives > 0 ? userProfile.streak + 1 : userProfile.streak} дн
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (duolingoLives > 0) {
                  setUserProfile(prev => ({
                    ...prev,
                    streak: prev.streak + 1,
                    badgeCount: prev.badgeCount + 1,
                  }));
                }
                setActiveDuolingoLesson(null);
              }}
              className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[10px] uppercase tracking-wider px-6 py-3 rounded-full shadow-sm transition cursor-pointer select-none"
            >
              Вернуться в Лекторий lessons
            </button>
          </div>
        );
      }

      const currentPart = parts[duolingoStep];
      const isPartChecked = duolingoCheckedAnswers.includes(duolingoStep);
      const selectedOption = duolingoSelectedAnswers[duolingoStep];
      const selectedCorrectly = selectedOption === currentPart.correctAnswer;

      return (
        <div className="bg-white border border-slate-205 rounded-3xl p-5 shadow-xs space-y-5 animate-fade-in font-sans">
          
          {/* Duolingo HUD Panel Header */}
          <div className="flex justify-between items-center bg-slate-50/70 p-3 rounded-2xl border border-slate-100 select-none">
            <div className="flex items-center gap-1.5">
              <span className="text-lg">🦉</span>
              <div className="space-y-0.1">
                <span className="text-[8px] uppercase tracking-wider font-extrabold text-indigo-600 block leading-none font-mono">Курс: {activeDuolingoLesson.title}</span>
                <span className="text-[10px] font-black text-slate-950 block leading-none">Вопрос {duolingoStep + 1} из {parts.length}</span>
              </div>
            </div>

            {/* Lives ❤️ and Points */}
            <div className="flex items-center gap-2.5 font-mono text-xs font-bold">
              <div className="text-red-550 flex items-center gap-0.5">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <span key={idx} className="transition duration-300">
                    {idx < duolingoLives ? "❤️" : "🤍"}
                  </span>
                ))}
              </div>
              <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase tracking-wider">
                {duolingoXP} XP
              </span>
            </div>
          </div>

          {/* Gamified Progress Bar */}
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
            <div 
              className="h-full bg-emerald-500 transition-all duration-500 shadow-sm"
              style={{ width: `${((duolingoStep) / parts.length) * 100}%` }}
            />
          </div>

          {/* Question Presentation Screen */}
          <div className="space-y-3 pt-1 select-none text-center">
            <div className="inline-block bg-slate-900 text-white rounded-2xl px-3 py-1 text-[8.5px] font-extrabold uppercase font-mono tracking-widest bg-emerald-600">
              DUOLINGO GAME PART
            </div>
            
            <h3 className="text-base font-black text-slate-950 px-2 leading-snug">
              {currentPart.question}
            </h3>
          </div>

          {/* Choice Option Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {currentPart.options.map((opt, oIdx) => {
              const optLetter = ["A", "B", "C", "D"][oIdx] || "•";
              const isSelected = selectedOption === opt;
              const isOptionCorrect = opt === currentPart.correctAnswer;
              
              let borderClass = "border-slate-202 bg-white text-slate-950 hover:bg-slate-50/40";
              if (isSelected) {
                borderClass = "border-indigo-600 bg-indigo-50/50 text-indigo-950 ring-2 ring-indigo-600/10";
              }
              if (isPartChecked) {
                if (isOptionCorrect) {
                  borderClass = "border-emerald-600 bg-emerald-50/80 text-emerald-950 ring-2 ring-emerald-500/10";
                } else if (isSelected) {
                  borderClass = "border-rose-600 bg-rose-50/80 text-rose-950 ring-2 ring-rose-500/10";
                }
              }

              return (
                <button
                  key={oIdx}
                  type="button"
                  disabled={isPartChecked}
                  onClick={() => {
                    setDuolingoSelectedAnswers(prev => ({
                      ...prev,
                      [duolingoStep]: opt
                    }));
                    if (siteVibration && "vibrate" in navigator) navigator.vibrate(10);
                  }}
                  className={`p-3.5 rounded-2xl border transition duration-150 text-left font-sans cursor-pointer flex gap-3.5 text-xs font-semibold ${borderClass}`}
                >
                  <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${
                    isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"
                  }`}>
                    {optLetter}
                  </span>
                  <span className="flex-1 leading-snug">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Verification check banner and Next operations */}
          <div className="space-y-3 pt-2">
            {!isPartChecked ? (
              <button
                type="button"
                onClick={() => handleDuoCheckAnswer(duolingoStep)}
                disabled={!selectedOption}
                className="w-full bg-[#58cc02] hover:bg-[#4cad00] disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold text-[10px] uppercase tracking-wider py-3.5 rounded-2xl cursor-pointer select-none shadow-md transition scale-100 active:scale-98"
              >
                ✔️ Проверить ответ
              </button>
            ) : (
              <div className="space-y-3 animate-slide-up">
                {/* Visual Feedback Message Section */}
                {selectedCorrectly ? (
                  <div className="bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-2xl p-4 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-sans font-black text-xs text-emerald-800">
                      <span>🟢</span>
                      <span>Правильно! +15 XP</span>
                    </div>
                    <p className="text-[10px] leading-relaxed text-emerald-880 font-medium">
                      <strong>Объяснение: </strong> {currentPart.explanation}
                    </p>
                  </div>
                ) : (
                  <div className="bg-rose-50 text-rose-900 border border-rose-200 rounded-2xl p-4 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-sans font-black text-xs text-rose-800">
                      <span>🔴</span>
                      <span>Ой, не совсем верно! Теряем одну жизнь.</span>
                    </div>
                    <p className="text-[10px] leading-relaxed text-rose-880 font-medium pb-0.5">
                      <strong>Правильный ответ: </strong> `{currentPart.correctAnswer}`
                    </p>
                    <p className="text-[10px] leading-relaxed text-rose-880 font-medium">
                      <strong>Объяснение: </strong> {currentPart.explanation}
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setDuolingoStep(prev => prev + 1)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[10px] uppercase tracking-wider py-3.5 rounded-2xl cursor-pointer select-none shadow-md transition"
                >
                  Продолжить ▶
                </button>
              </div>
            )}
          </div>

        </div>
      );
    }

    // Default Selection Panel
    return (
      <div className="space-y-4 animate-fade-in p-1">
        
        {/* Playful Duolingo header card */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 relative overflow-hidden flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left shadow-xs">
          <div className="w-16 h-16 bg-emerald-500 text-white text-4xl rounded-full flex items-center justify-center select-none shadow-md shrink-0">
            🦉
          </div>
          <div className="space-y-1 z-10">
            <h2 className="text-base font-black text-emerald-950 tracking-tight flex items-center gap-1 justify-center sm:justify-start">
              <span>Duolingo ИИ lessons</span>
              <span className="bg-[#4285F4] text-white text-[7px] font-black px-1.5 rounded uppercase font-mono tracking-widest leading-none">AI PLAY</span>
            </h2>
            <p className="text-[10.5px] leading-snug text-emerald-850 font-medium">
              Пройдите пятиступенчатые интерактивные тесты для освоения шахматной теории, языков или математики. Зарабатывайте XP очки!
            </p>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100/40 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Categories Grid - Chess, Languages, Math */}
        <div className="space-y-2.5">
          <span className="text-[9px] text-slate-400 font-mono font-bold uppercase tracking-wider block font-bold">Выберите тему для быстрого игрового урока:</span>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5">
            
            {/* Category 1: Chess */}
            <div className="bg-white border border-slate-200. rounded-2xl p-4.5 shadow-xs flex flex-col justify-between space-y-4 relative group hover:border-[#4285F4] transition-all">
              <div className="space-y-2">
                <div className="text-3xl bg-amber-50 rounded-xl w-11 h-11 flex items-center justify-center border border-amber-100">♟️</div>
                <h3 className="text-xs font-black text-slate-900 group-hover:text-[#4285F4] transition leading-none">Шахматы & Эндшпиль</h3>
                <p className="text-[9.5px] leading-relaxed text-slate-500. font-medium">
                  Обучение тактическим связкам, теории миттельшпиля, рокировкам и вилкам в интерактивных разборах.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleLoadDuolingoLesson("chess")}
                className="w-full bg-[#58cc02] hover:bg-[#4cad00] text-white text-[8px] font-extrabold uppercase tracking-widest py-2 rounded-lg cursor-pointer text-center select-none transition shadow-xs"
              >
                Начать Урок
              </button>
            </div>

            {/* Category 2: Languages */}
            <div className="bg-white border border-slate-202 rounded-2xl p-4.5 shadow-xs flex flex-col justify-between space-y-4 relative group hover:border-[#4285F4] transition-all">
              <div className="space-y-2">
                <div className="text-3xl bg-blue-50 rounded-xl w-11 h-11 flex items-center justify-center border border-blue-100">🌐</div>
                <h3 className="text-xs font-black text-slate-900 group-hover:text-[#4285F4] transition leading-none">Иностранные Языки</h3>
                <p className="text-[9.5px] leading-relaxed text-slate-500. font-medium">
                  Игровой тренинг по лексике, спряжениям глаголов и грамматике английского / испанского языков.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleLoadDuolingoLesson("languages")}
                className="w-full bg-[#58cc02] hover:bg-[#4cad00] text-white text-[8px] font-extrabold uppercase tracking-widest py-2 rounded-lg cursor-pointer text-center select-none transition shadow-xs"
              >
                Начать Урок
              </button>
            </div>

            {/* Category 3: Math */}
            <div className="bg-white border border-slate-202 rounded-2xl p-4.5 shadow-xs flex flex-col justify-between space-y-4 relative group hover:border-[#4285F4] transition-all">
              <div className="space-y-2">
                <div className="text-3xl bg-purple-50 rounded-xl w-11 h-11 flex items-center justify-center border border-purple-100">📐</div>
                <h3 className="text-xs font-black text-slate-900 group-hover:text-[#4285F4] transition leading-none">Быстрая Математика</h3>
                <p className="text-[9.5px] leading-relaxed text-slate-500. font-medium">
                  Увлекательные задачки на логику, устный счет, комбинаторику и геометрическую смекалку.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleLoadDuolingoLesson("math")}
                className="w-full bg-[#58cc02] hover:bg-[#4cad00] text-white text-[8px] font-extrabold uppercase tracking-widest py-2 rounded-lg cursor-pointer text-center select-none transition shadow-xs"
              >
                Начать Урок
              </button>
            </div>

          </div>
        </div>

      </div>
    );
  };

  // TAB 3: INTERACTIVE PRACTICE LAB (praktica)
  const renderPracticeTab = () => {
    const activePrac = practiceProblems[activePracticeIdx];

    return (
      <div className="space-y-4 animate-fade-in p-1">
        <div className="bg-white rounded-2xl border border-slate-202 p-4 shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[#34A853] font-black text-[9px] uppercase tracking-wider flex items-center gap-1">
              <Code className="w-3.5 h-3.5" />
              Код-Лаборатория Google Sandbox
            </span>
            <span className="text-xs">⚡</span>
          </div>

          <h2 className="text-sm font-black text-slate-900 leading-none">Редактор Интерактивных Конспектов</h2>
          <p className="text-slate-655 text-[10.5px] leading-relaxed font-semibold">
            Закрепите полученные из лекций академические навыки во встроенном интерпретаторе. Выберите задачу ниже, заполните недостающие аргументы, запустите синтаксическую проверку и посмотрите вывод.
          </p>
        </div>

        {/* Task presets selector slider tabs */}
        <div className="flex gap-2 overflow-x-auto select-none py-1">
          {practiceProblems.map((prob, pIdx) => (
            <button
              key={prob.id}
              onClick={() => setActivePracticeIdx(pIdx)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition whitespace-nowrap cursor-pointer ${
                pIdx === activePracticeIdx
                  ? "bg-[#34A853] text-white border-[#34A853]"
                  : "bg-white text-slate-700 hover:bg-slate-100 border-slate-202"
              }`}
            >
              {prob.title}
            </button>
          ))}
        </div>

        {/* Selected Task Details Sheet */}
        <div className="bg-white rounded-2xl border border-slate-202 p-4 space-y-3.5 shadow-sm">
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[8.5px] font-mono font-bold uppercase tracking-widest text-[#34A853]">
              <span>Задание {activePracticeIdx + 1}</span>
              <span>Язык: {activePrac.language}</span>
            </div>
            <h3 className="text-xs font-black text-slate-900">{activePrac.title}</h3>
            <p className="text-slate-600 text-[11px] leading-relaxed italic">
              "{activePrac.description}"
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-150 p-2.5 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-500 block pb-1">Поручение:</span>
            <p className="text-xs text-slate-800 font-semibold leading-relaxed">
              {activePrac.task}
            </p>
          </div>

          {/* Code Textarea Editor with line counter mockup */}
          <div className="space-y-1 bg-slate-950 rounded-2xl p-3 border border-slate-900 relative border-slate-202">
            <div className="flex justify-between items-center text-[9px] font-mono text-slate-450 select-none pb-2 border-b border-slate-900 uppercase">
              <span>Секция ввода кода (Интерактивная замена)</span>
              <span className="text-[#34A853]">● ACTIVE EDITING</span>
            </div>

            <textarea
              rows={5}
              value={practiceCode}
              onChange={(e) => {
                setPracticeCode(e.target.value);
                setPracticeSuccess(null);
              }}
              className="w-full bg-transparent font-mono text-[11px] text-emerald-400 focus:outline-none focus:ring-0 leading-relaxed border-none outline-none ring-0 p-1 resize-none h-[110px]"
            />

            <div className="absolute right-3 bottom-3 bg-slate-900/80 px-2 py-0.5 rounded text-[8px] font-mono text-slate-500 tracking-wider">
              {practiceCode.length} chars
            </div>
          </div>

          {/* Compiler Simulator output console */}
          {practiceOutput && (
            <div className="bg-slate-900 rounded-xl p-3 border border-slate-950 font-mono text-[10px] space-y-1">
              <span className="text-slate-500 block select-none uppercase tracking-wide font-extrabold pb-1 border-b border-slate-800">
                Консольный Терминал вывода:
              </span>
              <p className="text-slate-200 whitespace-pre-line leading-relaxed pb-1">{practiceOutput}</p>
            </div>
          )}

          {/* Buttons and actions */}
          <div className="space-y-3.5">
            <div className="flex gap-2">
              <button
                onClick={handleCompilePracticeCode}
                className="flex-1 bg-[#34A853] hover:bg-[#2C8E47] text-white py-2 px-4 rounded-xl text-xs font-black transition flex items-center justify-center gap-1 shadow cursor-pointer select-none"
              >
                <Code className="w-3.5 h-3.5" />
                Проверить код
              </button>

              <button
                onClick={() => setShowPracticeHint(prev => !prev)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-3 rounded-xl text-xs font-bold border border-slate-200 transition select-none cursor-pointer"
                title="Показать подсказку"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>

            {/* Hint Box revealed */}
            <AnimatePresence>
              {showPracticeHint && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-[#FFF9E6] border border-[#FFE082] rounded-xl p-3 text-[10px] text-[#B78103] leading-relaxed space-y-1"
                >
                  <span className="font-extrabold uppercase select-none block">💡 Академическая Подсказка:</span>
                  <p>{activePrac.hint}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Reward Streak progress block upon completion */}
            {practiceSuccess === true && (
              <div className="bg-[#E6F4EA] border border-[#A8DAB5] rounded-xl p-3 text-center text-[#137333] space-y-1 animate-bounce">
                <span className="text-lg block">🌟</span>
                <span className="text-[11px] font-black uppercase tracking-wider block">Упражнение Зачтено!</span>
                <p className="text-[9.5px] leading-relaxed px-2">
                  Результат совпал с эталонным. Студучет повысил ваш академических рейтинг в базе данных. Вы заработали 1 очко дневного стейка!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // AI Interactive Audio Lesson Speech handlers
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stopVoiceSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsVoiceSpeaking(false);
  };

  const startVoiceSpeaking = (text: string, onEnd?: () => void) => {
    if (!("speechSynthesis" in window)) {
      alert("Ваш браузер не поддерживает встроенный синтез речи, но мы покажем текст урока!");
      if (onEnd) onEnd();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      
      const cleanText = text.replace(/[`*#]/g, " ").trim();
      const hasCyrillic = /[а-яА-Я]/.test(cleanText);
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = voiceRate;
      utterance.pitch = 0.83; // Lower pitch significantly to mimic a mature adult voice (Rider tone)
      
      const voices = availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices();
      let selectedVoice = null;
      if (hasCyrillic) {
        const ruVoices = voices.filter(v => v.lang.startsWith("ru"));
        selectedVoice = ruVoices.find(v => {
          const name = v.name.toLowerCase();
          return name.includes("pavel") || name.includes("yuri") || name.includes("dmitry") || name.includes("aleksandr") || name.includes("male") || name.includes("microsoft") || name.includes("guy");
        }) || ruVoices.find(v => v.name.toLowerCase().includes("male")) || ruVoices[0] || null;
      } else {
        const enVoices = voices.filter(v => v.lang.startsWith("en"));
        selectedVoice = enVoices.find(v => {
          const name = v.name.toLowerCase();
          return name.includes("david") || name.includes("george") || name.includes("james") || name.includes("male") || name.includes("guy") || name.includes("natural") || name.includes("google us english") || name.includes("microsoft");
        }) || enVoices.find(v => v.name.toLowerCase().includes("male")) || enVoices[0] || null;
      }
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      // Pitch set to a highly polished deeper adult male profile (0.75 - mature, deeper)
      utterance.pitch = 0.75;
      
      utterance.onend = () => {
        setIsVoiceSpeaking(false);
        if (onEnd) onEnd();
      };
      
      utterance.onerror = (e) => {
        console.warn("Speech synthesis trigger warning", e);
        setIsVoiceSpeaking(false);
        if (onEnd) onEnd();
      };
      
      utteranceRef.current = utterance;
      setIsVoiceSpeaking(true);
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("Synthesis failed to speak:", err);
      setIsVoiceSpeaking(false);
      if (onEnd) onEnd();
    }
  };

  const handleNarrateParagraph = (idx: number) => {
    if (!activeVoiceLesson) return;
    setCurrentNarratingParagraph(idx);
    startVoiceSpeaking(activeVoiceLesson.paragraphs[idx], () => {
      // Finished speaking paragraph
    });
  };

  const handleNextParagraphAuto = () => {
    if (!activeVoiceLesson) return;
    if (currentNarratingParagraph < activeVoiceLesson.paragraphs.length - 1) {
      const nextIdx = currentNarratingParagraph + 1;
      setCurrentNarratingParagraph(nextIdx);
      handleNarrateParagraph(nextIdx);
    } else {
      // No more paragraphs, unlock test
      stopVoiceSpeaking();
      setVoiceLessonStep(0); // transition to the first test question
    }
  };

  const handleStartVoiceLesson = async (topicStr: string) => {
    if (!topicStr.trim()) {
      alert("Пожалуйста, выберите или введите тему для объяснения!");
      return;
    }
    setGeneratingVoiceLesson(true);
    setActiveVoiceLesson(null);
    setVoiceLessonStep(-1);
    setCurrentNarratingParagraph(0);
    setIsVoiceSpeaking(false);
    setUserVoiceAnswers({});
    setRevealedVoiceQuestion(false);
    setVoiceScore(0);
    
    if (siteVibration && "vibrate" in navigator) navigator.vibrate(40);

    try {
      const res = await fetch("/api/courses/voice-explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topicStr })
      });
      if (!res.ok) throw new Error("Could not connect to voice AI");
      const data = await res.json();
      
      if (data && Array.isArray(data.paragraphs) && data.paragraphs.length > 0) {
        setActiveVoiceLesson(data);
        // Start playing the first paragraph instantly
        setTimeout(() => {
          // Play first paragraph
          setCurrentNarratingParagraph(0);
          // Try to speak
          const txt = data.paragraphs[0];
          // Delay briefly to allow voices to load
          if ("speechSynthesis" in window && window.speechSynthesis.getVoices().length === 0) {
            window.speechSynthesis.onvoiceschanged = () => {
              startVoiceSpeaking(txt);
            };
          } else {
            startVoiceSpeaking(txt);
          }
        }, 500);
      } else {
        alert("ИИ сгенерировал неверный формат. Попробуйте еще раз.");
      }
    } catch (e) {
      console.error(e);
      alert("😿 Ошибка при получении ИИ-объяснения. Проверьте сеть или API ключ.");
    } finally {
      setGeneratingVoiceLesson(false);
    }
  };

  const handleLoadDuolingoLesson = async (subject: string) => {
    const topicBySubject: Record<string, string> = {
      chess: "Шахматы: тактика, дебюты и эндшпиль для начинающих",
      languages: "Иностранные языки: лексика, грамматика и переводы",
      math: "Быстрая математика: логика, уравнения и геометрия",
    };

    setIsGeneratingDuo(true);
    setActiveDuolingoLesson(null);
    setDuolingoCheckedAnswers([]);
    setDuolingoSelectedAnswers({});
    setDuolingoStep(0);
    setDuolingoLives(3);
    setDuolingoXP(0);
    
    if (siteVibration && "vibrate" in navigator) navigator.vibrate(50);

    try {
      const response = await fetch("/api/courses/generate-duolingo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topicBySubject[subject] || subject })
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Could not retrieve Duolingo lesson");
      }
      const course = await response.json();

      const gameParts = (course.lessons || []).flatMap((lesson: { parts?: Array<Record<string, unknown>> }) =>
        (lesson.parts || [])
          .filter((p) => p.type === "duolingo_game")
          .map((p) => ({
            question: String(p.gameQuestion || p.content || ""),
            options: Array.isArray(p.gameOptions) ? p.gameOptions.map(String) : [],
            correctAnswer: String(p.gameAnswer || ""),
            explanation: String(p.metadata || "Отличная работа! Продолжайте учиться."),
          }))
      );

      const quizParts = (course.quizzes || []).map((q: QuizQuestion) => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || "Правильный ответ выбран.",
      }));

      const parts = gameParts.length > 0 ? gameParts : quizParts;

      if (parts.length > 0) {
        setActiveDuolingoLesson({
          title: course.title || "Duolingo урок",
          parts,
        });
        onRefreshCourses();
      } else {
        alert("Ошибка генерации. Пожалуйста, попробуйте еще раз.");
      }
    } catch(e) {
      console.warn("Duo lesson load error:", e);
      alert("❌ Ошибка соединения при загрузке интерактивного урока.");
    } finally {
      setIsGeneratingDuo(false);
    }
  };

  const handleDuoCheckAnswer = (partIdx: number) => {
    if (!activeDuolingoLesson) return;
    const currentPart = activeDuolingoLesson.parts[partIdx];
    const selected = duolingoSelectedAnswers[partIdx];
    
    if (!selected) {
      alert("Пожалуйста, выберите ответ!");
      return;
    }

    const isCorrect = selected === currentPart.correctAnswer;
    
    if (siteVibration && "vibrate" in navigator) {
      if (isCorrect) {
        navigator.vibrate([40, 40]);
      } else {
        navigator.vibrate([100, 50, 100]);
      }
    }

    setDuolingoCheckedAnswers(prev => [...prev, partIdx]);
    
    if (isCorrect) {
      setDuolingoXP(prev => prev + 15);
    } else {
      setDuolingoLives(prev => Math.max(0, prev - 1));
    }
  };

  const handleYouTubeSearch = async () => {
    if (!videoSearchQuery.trim()) return;
    setIsVideoSearching(true);
    if (siteVibration && "vibrate" in navigator) navigator.vibrate(30);

    try {
      const response = await fetch("/api/youtube/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: videoSearchQuery })
      });
      if (!response.ok) throw new Error("API responded with an error");
      const matchedVideos = await response.json();
      
      if (matchedVideos && matchedVideos.length > 0) {
        setAiExtraVideos(matchedVideos);
        setVideoActiveIdx(0); // Activate the first search card
        setVideoPlaying(true);
        alert(`🎓 ИИ подобрал ${matchedVideos.length} видеолекций из YouTube специально для вас! Приятного просмотра.`);
      } else {
        alert("🔍 Ничего не найдено. Напишите другой запрос!");
      }
    } catch (e: any) {
      console.warn("YouTube AI search request failed:", e);
      alert("❌ Временный сбой AI-поиска видео. Пожалуйста, попробуйте снова.");
    } finally {
      setIsVideoSearching(false);
    }
  };

  // TAB 5: VIDEO LESSONS GALLERY (video)
  const renderVideoTab = () => {
    if (videoLessons.length === 0) {
      return (
        <div className="text-center py-16 text-slate-550 text-sm">
          Видеоуроков пока нет. Администратор может добавить их в панели «Видео».
        </div>
      );
    }

    const activeVideo = videoLessons[videoActiveIdx] || videoLessons[0];

    return (
      <div className="space-y-5 animate-fade-in p-1 font-sans text-slate-800 select-none">
        
        {/* YouTube Video Search Deck with Academic Theme */}
        <div className="bg-gradient-to-br from-[#0c3125] to-[#124234] border border-[#f0c890]/40 rounded-2xl p-4 shadow-lg space-y-3 relative overflow-hidden">
          {/* Subtle glowing ambient layer */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff7a1a]/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col gap-1.5 relative z-10">
            <h4 className="text-[10px] font-extrabold uppercase text-[#ffb060] font-mono tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Интеллектуальный ИИ-поиск лекций на YouTube
            </h4>
            <p className="text-[10.5px] text-white/80 leading-snug">
              Введите интересующую вас тему (например, <span className="text-[#ffddbd] italic font-semibold">"высшая математика"</span>, <span className="text-[#ffddbd] italic font-semibold">"бизнес переговоры"</span>), и наш ИИ моментально подберет лекции во внешний поток приложения.
            </p>
          </div>
          
          <div className="flex gap-2 relative z-10">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                <Search className="w-4 h-4 text-[#ffb060]/70" />
              </span>
              <input
                type="text"
                value={videoSearchQuery}
                onChange={(e) => setVideoSearchQuery(e.target.value)}
                placeholder="Что вы хотите узнать сегодня?..."
                className="w-full text-xs pl-10 pr-3 py-3 bg-white/10 text-white placeholder-white/50 border border-white/20 hover:border-[#f0c890]/50 focus:border-[#ff9a50] focus:bg-[#0c3125]/90 outline-none rounded-xl font-medium transition shadow-inner"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleYouTubeSearch();
                }}
              />
            </div>
            
            <button
              onClick={handleYouTubeSearch}
              disabled={isVideoSearching || !videoSearchQuery.trim()}
              className="bg-gradient-to-r from-[#ff7a1a] to-[#e05a00] hover:from-[#ff9a50] hover:to-[#ff5c00] disabled:from-slate-700 disabled:to-slate-800 disabled:text-slate-400 text-white text-[10px] font-black uppercase tracking-wider px-5 py-3 rounded-xl transition cursor-pointer select-none flex items-center gap-1.5 shrink-0 shadow-md active:scale-95 duration-150"
            >
              {isVideoSearching ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>Поиск...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Поиск ИИ</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Curved Media Monitor Viewer mockup with overlay */}
        <div className="bg-[#070e0b] rounded-2xl overflow-hidden border-2 border-[#f0c890]/30 shadow-xl flex flex-col justify-between relative group">
          
          {/* Virtual Retro Monitor Frame Screen / Real YouTube Embed Player */}
          <div className="bg-black aspect-video relative flex flex-col justify-center items-center text-white text-center overflow-hidden">
            {activeVideo && activeVideo.youtubeId ? (
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=${videoPlaying ? 1 : 0}&enablejsapi=1&rel=0`}
                title={activeVideo.title}
                className="w-full h-full border-0 absolute inset-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : activeVideo && activeVideo.videoUrl ? (
              <video
                src={activeVideo.videoUrl}
                controls
                autoPlay={videoPlaying}
                className="w-full h-full object-contain absolute inset-0 bg-black"
              />
            ) : activeVideo ? (
              <>
                <div className="absolute top-3 left-3 bg-[#ff7a1a] text-white px-2.5 py-1 rounded-md text-[8.5px] font-black uppercase tracking-wider animate-pulse z-10 shadow-md">
                  ● ЛЕКЦИЯ В ЭФИРЕ
                </div>

                <div className="absolute top-3 right-3 bg-[#0c3125]/85 backdrop-blur-md px-2.5 py-1 rounded-md text-[8.5px] font-bold text-[#ffddbd] border border-[#f0c890]/30 tracking-wider z-10">
                  {activeVideo.category}
                </div>

                {videoPlaying ? (
                  <div className="space-y-4 text-center z-10 px-6">
                    <div className="flex gap-1.5 justify-center items-end h-10 pb-1.5">
                      <div className="w-1.5 bg-[#ff7a1a] rounded-t-full animate-bounce h-8" style={{ animationDuration: '0.6s' }} />
                      <div className="w-1.5 bg-[#c9a227] rounded-t-full animate-bounce h-5" style={{ animationDuration: '0.4s' }} />
                      <div className="w-1.5 bg-emerald-500 rounded-t-full animate-bounce h-10" style={{ animationDuration: '0.7s' }} />
                      <div className="w-1.5 bg-[#ff9a50] rounded-t-full animate-bounce h-6" style={{ animationDuration: '0.5s' }} />
                      <div className="w-1.5 bg-[#c9a227] rounded-t-full animate-bounce h-4" style={{ animationDuration: '0.8s' }} />
                    </div>
                    <div>
                      <span className="text-xs font-black font-mono tracking-widest block text-[#ffe8cc] animate-pulse">ТРАНСЛЯЦИЯ ВИДЕОУРОКА...</span>
                      <p className="text-[9.5px] mt-1 text-emerald-400 font-semibold font-mono">
                        Поток стабилен · Скорость соединения: {videoSpeed}
                      </p>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setVideoPlaying(true)}
                    className="w-16 h-16 bg-[#ff7a1a] hover:bg-[#ff9a50] hover:scale-105 active:scale-95 text-white rounded-full flex items-center justify-center shadow-lg transition duration-200 cursor-pointer text-xl z-20 border-2 border-white/30"
                  >
                    ▶
                  </button>
                )}

                <span className="absolute bottom-3 left-3 text-[10px] font-extrabold text-[#ffb060] font-mono z-10 bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs">
                  {activeVideo.thumbnailText}
                </span>

                <span className="absolute bottom-3 right-3 text-[10px] font-bold text-slate-300 font-mono z-10 bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs">
                  Длительность: {activeVideo.duration}
                </span>
              </>
            ) : (
              <p className="text-xs text-slate-400">Поиск video...</p>
            )}
          </div>

          {/* Player controls deck bar with speed selectors and play click handlers */}
          <div className="bg-[#0b1712] p-4 flex flex-col gap-3.5 border-t border-[#1a382c] select-none">
            
            {/* Slide progress timer timeline */}
            <div className="flex items-center gap-3">
              <span className="text-[9px] text-[#ffddbd] font-mono font-bold">03:45</span>
              <div 
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pct = Math.round(((e.clientX - rect.left) / rect.width) * 105);
                  setVideoProgress(pct);
                }}
                className="flex-grow bg-white/10 hover:bg-white/15 h-2 rounded-full overflow-hidden cursor-pointer relative group transition duration-155"
              >
                <div 
                  className="h-full bg-gradient-to-r from-[#ff7a1a] to-[#c9a227] shadow-[0_0_8px_#ff7a1a] transition-all rounded-full"
                  style={{ width: `${videoProgress}%` }}
                />
              </div>
              <span className="text-[9px] text-[#ffddbd] font-mono font-bold">{activeVideo ? activeVideo.duration : "00:00"}</span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setVideoPlaying(prev => !prev)}
                  className="p-1 px-3 bg-[#0c3125] hover:bg-[#154a39] text-white border border-[#f0c890]/20 rounded-xl font-bold text-[9.5px] cursor-pointer flex items-center gap-1 shadow-sm transition active:scale-95 duration-100"
                >
                  {videoPlaying ? "⏸ Пауза" : "▶ Воспроизвести"}
                </button>

                <button
                  type="button"
                  onClick={() => setVideoProgress(35)}
                  className="p-1 px-2.5 bg-[#0c3125] hover:bg-[#154a39] border border-[#f0c890]/20 rounded-xl text-white text-[9.5px] cursor-pointer transition active:scale-95 duration-100"
                  title="Сбросить время"
                >
                  <RotateCcw className="w-3.5 h-3.5 inline" />
                </button>
              </div>

              {/* speed selectors */}
              <div className="flex bg-[#0c3125] p-0.5 rounded-xl border border-[#f0c890]/20 text-[9px] font-bold font-mono text-[#ffddbd] items-center">
                {["1.0x", "1.5x", "2.0x"].map(spd => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => setVideoSpeed(spd)}
                    className={`px-2 py-1 rounded-lg text-[8.5px] transition cursor-pointer ${
                      videoSpeed === spd 
                        ? "bg-[#ff7a1a] text-white font-black shadow-sm" 
                        : "hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {spd}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Selected Video Meta details information below */}
        <div className="bg-white rounded-2xl border border-[#f0c890]/50 p-4 shadow-sm space-y-3 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0c3125] via-[#ff7a1a] to-[#c9a227]" />
          
          <div className="flex justify-between items-start gap-2 flex-wrap">
            <span className="bg-[#0c3125]/10 text-[#0c3125] font-extrabold text-[8.5px] uppercase tracking-wider px-2.5 py-1 border border-[#0c3125]/15 rounded-lg flex items-center gap-1 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff7a1a] animate-ping" />
              {activeVideo.category}
            </span>
            
            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono font-bold bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">
              <span className="text-[#c9a227]">★</span> ВИДЕОТЕКА АКАДЕМИИ
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-black text-slate-900 leading-snug font-display">
              {activeVideo.title}
            </h3>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              {activeVideo.description}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100">
            <div className="bg-[#fffdf9] border border-[#f0c890]/30 p-2 rounded-xl flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#0c3125]/10 flex items-center justify-center text-[#0c3125] shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[8px] text-slate-400 block uppercase font-mono tracking-wider">Приглашенный Спикер</span>
                <p className="text-[10px] font-extrabold text-[#0c3125] truncate">{activeVideo.instructor}</p>
              </div>
            </div>

            <div className="bg-[#fffdf9] border border-[#f0c890]/30 p-2 rounded-xl flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#ff7a1a]/10 flex items-center justify-center text-[#ff7a1a] shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[8px] text-slate-400 block uppercase font-mono tracking-wider">Просмотров лектория</span>
                <p className="text-[10px] font-extrabold text-slate-800 truncate">{activeVideo.views} раз</p>
              </div>
            </div>
          </div>
        </div>

        {/* Curated videos scroll list */}
        <div className="space-y-2.5">
          <div className="flex justify-between items-center px-1">
            <span className="text-[9.5px] text-[#0c3125]/70 font-mono font-extrabold uppercase tracking-widest block">
              Передачи Медиа-Академии ({videoLessons.length})
            </span>
            <div className="h-0.5 flex-1 bg-gradient-to-r from-[#f0c890]/20 to-transparent ml-4" />
          </div>
          
          <div className="grid grid-cols-1 gap-2.5">
            {videoLessons.map((vd, index) => {
              const isActive = index === videoActiveIdx;
              return (
                <button
                  key={vd.id}
                  onClick={() => {
                    setVideoActiveIdx(index);
                    setVideoPlaying(false);
                    setVideoProgress(35);
                  }}
                  className={`w-full text-left p-3 rounded-2xl border transition duration-200 flex gap-3.5 cursor-pointer items-center relative group overflow-hidden ${
                    isActive 
                      ? "bg-[#fffbf2] border-[#ff7a1a] shadow-md shadow-[#ff7a1a]/5" 
                      : "bg-white hover:bg-[#fffdfa] border-slate-200 hover:border-[#f0c890]/60 shadow-xs hover:shadow-sm"
                  }`}
                >
                  {/* Thumbnail Badge indicator overlay */}
                  {isActive && (
                    <div className="absolute top-0 right-0 w-0 h-0 border-t-[14px] border-r-[14px] border-t-[#ff7a1a] border-r-[#ff7a1a]" />
                  )}

                  <div className="relative shrink-0">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xs font-black shrink-0 border relative overflow-hidden transition duration-200 group-hover:scale-105 ${
                      isActive 
                        ? "bg-[#0c3125] text-white border-[#0c3125]" 
                        : "bg-slate-900 text-slate-300 border-slate-950"
                    }`}>
                      {vd.youtubeId ? (
                        <img 
                          src={`https://img.youtube.com/vi/${vd.youtubeId}/mqdefault.jpg`} 
                          alt="" 
                          className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition duration-200"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="text-[13px]">🎞️</div>
                      )}
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <Play className={`w-4 h-4 transition duration-200 ${isActive ? "text-white scale-110" : "text-white/80 group-hover:scale-115"}`} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-0.5 overflow-hidden flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[8px] font-black uppercase text-[#ff7a1a] tracking-wider">
                        {vd.category}
                      </span>
                      <span className="text-slate-300 text-[8px]">•</span>
                      <span className="text-[8px] text-slate-400 font-mono">
                        {vd.duration} мин
                      </span>
                    </div>

                    <h4 className={`font-extrabold text-xs truncate leading-snug ${isActive ? "text-[#0c3125]" : "text-slate-900"}`}>
                      {vd.title}
                    </h4>
                    
                    <p className="text-slate-500 text-[10.5px] truncate">
                      {vd.description}
                    </p>
                    
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <User className="w-3 h-3 text-[#c9a227]" />
                      <span className="text-[9px] text-[#0c3125]/85 font-semibold font-sans truncate">
                        {vd.instructor.split(" (")[0]}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    );
  };

  // TAB 6: AUTHENTICATION PROFILE & CREDENTIALS CONTROLS
  const renderProfileTab = () => {

    return (
      <div className="space-y-5 animate-fade-in text-slate-800">

        {/* PROFILE HERO CARD */}
        <div className="profile-hero-card p-5">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              {renderAvatar(
                userProfile.avatar,
                "w-20 h-20 bg-white/10 text-4xl rounded-2xl flex items-center justify-center profile-avatar-ring overflow-hidden"
              )}
              <span className="absolute -bottom-1 -right-1 bg-orange-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full border-2 border-white">
                #{4}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] text-orange-300 font-bold uppercase tracking-widest mb-0.5">EduHub</p>
              <h2 className="text-lg font-black text-white leading-tight truncate font-[family-name:var(--font-display)]">
                {profileFirstName} {profileLastName}
              </h2>
              <p className="text-[10px] text-white/60 truncate mt-0.5">{userProfile.tier}</p>
              <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                <div className="profile-stat-pill flex items-center gap-1.5">
                  <span className="text-orange-300 text-xs">🔥</span>
                  <span className="text-[10px] font-bold text-white">{userProfile.streak} дн</span>
                </div>
                <div className="profile-stat-pill flex items-center gap-1.5">
                  <span className="text-yellow-300 text-xs">🪙</span>
                  <span className="text-[10px] font-bold text-white">{userCoins}</span>
                </div>
                <div className="profile-stat-pill flex items-center gap-1.5">
                  <span className="text-green-300 text-xs">⭐</span>
                  <span className="text-[10px] font-bold text-white">{userRating} XP</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AVATAR PICKER — только из галереи */}
        <div className="profile-section-card">
          <div className="profile-section-header">
            <span className="text-[10px] font-extrabold uppercase text-orange-700 font-mono tracking-wider">Фото профиля</span>
          </div>
          <div className="p-4 flex items-center gap-4">
            {/* Current avatar preview */}
            <div className="relative shrink-0">
              {renderAvatar(
                userProfile.avatar,
                "w-16 h-16 rounded-2xl overflow-hidden border-2 border-orange-200 object-cover"
              )}
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Загрузи фото из галереи. Оно будет отображаться в профиле, хедере и таблице лидеров.
              </p>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        if (typeof reader.result === "string") {
                          handleAvatarChange(reader.result);
                          if (siteVibration && "vibrate" in navigator) navigator.vibrate(40);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                  id="custom-avatar-file-upload"
                />
                <label
                  htmlFor="custom-avatar-file-upload"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold rounded-xl cursor-pointer transition uppercase tracking-wider shadow-sm"
                >
                  📁 Выбрать фото
                </label>
                {userProfile.avatar && userProfile.avatar !== DEFAULT_AVATAR && (
                  <button
                    type="button"
                    onClick={() => handleAvatarChange(DEFAULT_AVATAR)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-500 text-[10px] font-bold rounded-xl cursor-pointer transition border border-slate-200"
                  >
                    Сбросить
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* PERSONAL INFO CARD */}
        <div className="profile-section-card">
          <div className="profile-section-header flex items-center justify-between">
            <div>
              <h3 className="text-[11px] font-black text-orange-700 uppercase tracking-wide">Личные данные</h3>
              <p className="text-[9px] text-orange-400 mt-0.5">Имя, фамилия и телефон</p>
            </div>
            <button
              type="button"
              onClick={() => setSsoModalOpen(true)}
              className="bg-orange-50 hover:bg-orange-100 text-orange-600 text-[9px] font-black px-3 py-1.5 rounded-xl border border-orange-200 transition cursor-pointer"
            >
              🌐 SSO
            </button>
          </div>
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[9px] font-extrabold uppercase text-orange-600 font-mono block tracking-wider">Имя</label>
                <input
                  type="text"
                  value={profileFirstName}
                  onChange={(e) => handleProfileNameChange(e.target.value, profileLastName)}
                  className="profile-input"
                  placeholder="Ваше имя"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-extrabold uppercase text-orange-600 font-mono block tracking-wider">Фамилия</label>
                <input
                  type="text"
                  value={profileLastName}
                  onChange={(e) => handleProfileNameChange(profileFirstName, e.target.value)}
                  className="profile-input"
                  placeholder="Ваша фамилия"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[9px] font-extrabold uppercase text-orange-600 font-mono block tracking-wider">Телефон</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-orange-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="profile-input pl-9"
                    placeholder="+7"
                  />
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (siteVibration && "vibrate" in navigator) navigator.vibrate(60);
                alert(`🎉 Студент ${profileFirstName} ${profileLastName} успешно зарегистрирован!`);
              }}
              className="profile-save-btn w-full text-center"
            >
              💾 Сохранить профиль
            </button>
          </div>
        </div>

        {/* SECURITY SETTINGS */}
        <div className="profile-section-card">
          <div className="profile-section-header">
            <h3 className="text-[11px] font-black text-orange-700 uppercase tracking-wide">Безопасность и настройки</h3>
          </div>
          <div className="p-4 space-y-4">
            {/* Vibration */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center text-sm">
                  📳
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-900">Тактильный отклик</p>
                  <p className="text-[9px] text-slate-400">Вибрация на касание</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSiteVibration(!siteVibration);
                  if (!siteVibration && "vibrate" in navigator) navigator.vibrate(30);
                }}
                className={`profile-toggle-btn ${siteVibration ? "active" : "inactive"}`}
              >
                {siteVibration ? "ВКЛ" : "ВЫКЛ"}
              </button>
            </div>

            <hr className="border-orange-100" />

            {/* Language */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-emerald-100/50 rounded-xl flex items-center justify-center text-sm">
                  🌐
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-tight text-slate-900">{t("interface_lang")}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 w-full sm:w-auto mt-1 sm:mt-0 bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                {(["ru", "uz", "en"] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => {
                      setSiteLanguage(lang);
                      if (siteVibration && "vibrate" in navigator) navigator.vibrate(10);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-tight transition-all duration-200 cursor-pointer ${
                      siteLanguage === lang
                        ? "bg-slate-900 text-white shadow-xs scale-102"
                        : "text-slate-550 hover:text-slate-800"
                    }`}
                  >
                    {lang === "ru" ? "🇷🇺 Ru" : lang === "uz" ? "🇺🇿 Uz" : "🇬🇧 En"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CERTIFICATE ACCORDION */}
        <div className="profile-cert-card">
          <button
            onClick={() => {
              setCertExpanded(!certExpanded);
              if (siteVibration && "vibrate" in navigator) navigator.vibrate(15);
            }}
            className="w-full flex justify-between items-center py-4 px-5 cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🏆</span>
              <span className="text-[11px] font-black uppercase tracking-wider text-orange-700">Выпускной Сертификат</span>
            </div>
            <span className="text-[10px] text-orange-500 font-mono font-extrabold uppercase">
              {certExpanded ? "▲" : "▼"}
            </span>
          </button>

          {certExpanded && (
            <div className="px-5 pb-5 space-y-4 border-t border-orange-200/60 pt-4 animate-fade-in">
              <div className="bg-white rounded-xl p-4 border border-orange-200 text-center space-y-3 font-serif shadow-inner">
                <p className="text-[8px] font-sans uppercase tracking-[0.14em] text-orange-400 font-extrabold font-mono">
                  ★ EduHub Google Scholar Certificate ★
                </p>
                <p className="text-[9px] italic text-slate-500">Настоящий документ удостоверяет, что:</p>
                <h4 className="text-sm font-black text-slate-900 font-sans">{profileFirstName} {profileLastName}</h4>
                <p className="text-[8.5px] leading-relaxed italic px-2 text-slate-600">
                  Успешно прослушал лекции Академии, сдал тесты и прошел практику программирования.
                </p>
                <div className="flex justify-between text-[7.5px] font-sans uppercase text-slate-400 border-t border-slate-100 pt-2 font-mono font-bold">
                  <div>Дата: {new Date().toLocaleDateString()}</div>
                  <div className="text-orange-500">Подпись: Райдер ИИ</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => alert(`🎉 Сертификат выгружен для: ${profileFirstName} ${profileLastName}!`)}
                className="profile-save-btn w-full text-center flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Скачать PDF
              </button>
            </div>
          )}
        </div>

      </div>
    );
  };



  // TAB: CAMPUS MARKET PAGE
  const renderMarketTab = () => {
    const categories = ["Все", ...Array.from(new Set(CAMPUS_MARKET_ITEMS.map(i => i.category)))];
    const filtered = marketCategory === "Все" ? CAMPUS_MARKET_ITEMS : CAMPUS_MARKET_ITEMS.filter(i => i.category === marketCategory);

    const badgeColor: Record<string, string> = {
      "Редкий": "bg-purple-100 text-purple-700 border-purple-200",
      "Популярный": "bg-blue-100 text-blue-700 border-blue-200",
      "Выгодно": "bg-green-100 text-green-700 border-green-200",
      "Лимит": "bg-red-100 text-red-700 border-red-200",
      "Хит": "bg-orange-100 text-orange-700 border-orange-200",
      "Новинка": "bg-teal-100 text-teal-700 border-teal-200",
      "Эксклюзив": "bg-amber-100 text-amber-700 border-amber-200",
    };

    return (
      <div className="space-y-4 animate-fade-in">

        {/* Header with back + balance */}
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setCurrentTab("home")}
            className="flex items-center gap-1.5 text-orange-700 hover:text-orange-900 text-[10px] font-extrabold bg-white border border-orange-200 py-1.5 px-3 rounded-xl shadow-sm cursor-pointer transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Назад
          </button>

          <div className="flex items-center gap-2 bg-white border border-orange-200 rounded-xl px-3 py-1.5 shadow-sm">
            <Coins className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-black text-orange-700">{userCoins}</span>
            <span className="text-[9px] text-orange-400 font-bold">монет</span>
          </div>
        </div>

        {/* Page title */}
        <div className="text-center space-y-1 py-2">
          <div className="flex items-center justify-center gap-2">
            <ShoppingBag className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-black text-slate-900 font-[family-name:var(--font-display)]">Campus Market</h2>
          </div>
          <p className="text-[10px] text-slate-500">Трать монеты на награды и привилегии кампуса</p>
        </div>

        {/* Category filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 isa-shorts-row">
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setMarketCategory(cat)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold border transition cursor-pointer ${
                marketCategory === cat
                  ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                  : "bg-white text-slate-600 border-orange-200 hover:border-orange-400"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((item) => {
            const purchased = marketPurchaseHistory.includes(item.name);
            const canAfford = userCoins >= item.cost;
            return (
              <motion.div
                key={item.name}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden hover:shadow-md hover:border-orange-300 transition-all"
              >
                {/* Product photo */}
                <div className="relative h-40 overflow-hidden bg-orange-50">
                  <img
                    src={item.photo}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                  {/* Category tag */}
                  <span className="absolute top-2.5 left-2.5 bg-white/90 text-orange-700 text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {item.category}
                  </span>

                  {/* Badge */}
                  {item.badge && (
                    <span className={`absolute top-2.5 right-2.5 text-[8px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider ${badgeColor[item.badge] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                      {item.badge}
                    </span>
                  )}

                  {/* Purchased overlay */}
                  {purchased && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="bg-green-500 text-white rounded-xl px-3 py-1.5 text-xs font-black flex items-center gap-1.5">
                        <Check className="w-4 h-4" />
                        Куплено
                      </div>
                    </div>
                  )}

                  {/* Icon bubble */}
                  <div className="absolute bottom-2.5 right-2.5 w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shadow-md border border-orange-100">
                    {item.icon}
                  </div>
                </div>

                {/* Product info */}
                <div className="p-3.5 space-y-3">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 leading-tight">{item.name}</h3>
                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed line-clamp-2">{item.desc}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    {/* Price */}
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center">
                        <Coins className="w-3 h-3 text-orange-500" />
                      </div>
                      <span className="text-base font-black text-orange-600">{item.cost}</span>
                      <span className="text-[9px] text-orange-400 font-bold">монет</span>
                    </div>

                    {/* Buy button */}
                    <button
                      type="button"
                      onClick={() => handleBuyProduct(item.name, item.cost)}
                      disabled={purchased}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[10px] font-extrabold transition cursor-pointer ${
                        purchased
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                          : canAfford
                          ? "bg-orange-500 hover:bg-orange-600 text-white shadow-sm hover:shadow-md"
                          : "bg-red-50 text-red-400 border border-red-200 cursor-not-allowed"
                      }`}
                    >
                      {purchased ? (
                        <><Check className="w-3.5 h-3.5" /> Куплено</>
                      ) : canAfford ? (
                        <><ShoppingBag className="w-3.5 h-3.5" /> Купить</>
                      ) : (
                        <>⚠️ Мало монет</>
                      )}
                    </button>
                  </div>

                  {/* Insufficient coins warning */}
                  {!purchased && !canAfford && (
                    <p className="text-[9px] text-red-400 font-medium">
                      Нужно ещё {item.cost - userCoins} монет
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Purchase history */}
        {marketPurchaseHistory.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 space-y-2">
            <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-orange-700 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" /> Купленные товары ({marketPurchaseHistory.length})
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {marketPurchaseHistory.map((name, i) => (
                <span key={i} className="bg-white border border-orange-200 text-orange-700 text-[9px] font-bold px-2 py-0.5 rounded-full">
                  {CAMPUS_MARKET_ITEMS.find(it => it.name === name)?.icon} {name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // TRANSLATOR TAB
  // TRANSLATOR TAB WITH PREMIUM VOCABULARY PRONUNCIATION TRAINER
  const renderTranslatorTab = () => {
    const langs = [
      { code: "ru", label: "Русский 🇷🇺" },
      { code: "en", label: "English 🇬🇧" },
      { code: "uz", label: "O'zbek 🇺🇿" },
      { code: "zh", label: "中文 🇨🇳" },
      { code: "ar", label: "العربية 🇸🇦" },
      { code: "de", label: "Deutsch 🇩🇪" },
    ];
    const langNames: Record<string, string> = { ru: "Russian", en: "English", uz: "Uzbek", zh: "Chinese", ar: "Arabic", de: "German" };

    const curatedVocabulary = [
      { word: "Artificial Intelligence", translation: "Искусственный интеллект" },
      { word: "Algorithm", translation: "Алгоритм" },
      { word: "Academic Scholarship", translation: "Академическая стипендия" },
      { word: "Pristine", translation: "Изначальный / Чистый" },
      { word: "Equilibrium", translation: "Равновесие" },
      { word: "Resilience", translation: "Упругость / Стойкость" },
      { word: "Opportunity", translation: "Возможность" },
      { word: "Environment", translation: "Окружающая среда" },
    ];

    const handleTranslate = async () => {
      if (!translatorInput.trim()) return;
      setIsTranslating(true);
      setTranslatorOutput("");
      try {
        const res = await fetch("/api/ai/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: translatorInput,
            from: langNames[translatorFrom] || translatorFrom,
            to: langNames[translatorTo] || translatorTo
          })
        });
        const data = await res.json();
        const text = data.content?.map((c: any) => c.text || "").join("") || "Ошибка перевода";
        setTranslatorOutput(text);
      } catch {
        setTranslatorOutput("Ошибка соединения. Попробуйте снова.");
      }
      setIsTranslating(false);
    };

    const speakTargetWord = (text: string) => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = "en-US";
        utter.rate = 0.82; // slightly slower for premium learning
        utter.pitch = 0.75; // Deeper adult male voice profile

        const voices = availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices();
        const enVoices = voices.filter(v => v.lang.startsWith("en"));
        const maleVoice = enVoices.find(v => {
          const name = v.name.toLowerCase();
          return name.includes("david") || name.includes("george") || name.includes("james") || name.includes("male") || name.includes("guy") || name.includes("natural") || name.includes("microsoft");
        }) || enVoices.find(v => v.name.toLowerCase().includes("male")) || enVoices[0];
        if (maleVoice) {
          utter.voice = maleVoice;
        }

        window.speechSynthesis.speak(utter);
      } else {
        alert("Синтез речи не поддерживается в вашем браузере.");
      }
    };

    const runSimulatedCorrectPronunciation = () => {
      setIsSpeechListening(true);
      setPronunciationResult("none");
      setSpeechRecognized("Слушаю вас...");
      setMicErrorMsg("");
      setTimeout(() => {
        setSpeechRecognized(selectedWordToPractice.word);
        setPronunciationResult("success");
        setIsSpeechListening(false);
      }, 1800);
    };

    const runSimulatedIncorrectPronunciation = () => {
      setIsSpeechListening(true);
      setPronunciationResult("none");
      setSpeechRecognized("Слушаю вас...");
      setMicErrorMsg("");
      setTimeout(() => {
        setSpeechRecognized("Artifical Inteligens");
        setPronunciationResult("failure");
        setIsSpeechListening(false);
      }, 1800);
    };

    const handleSpeechListen = () => {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setMicErrorMsg("Speech Recognition не поддерживается в iframe / браузере. Запуск симулятора...");
        runSimulatedCorrectPronunciation();
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsSpeechListening(true);
      setPronunciationResult("none");
      setSpeechRecognized("");
      setMicErrorMsg("");

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript || "";
        setSpeechRecognized(transcript);

        const cleanTarget = selectedWordToPractice.word.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").trim();
        const cleanSpoken = transcript.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").trim();

        if (cleanSpoken.includes(cleanTarget) || cleanTarget.includes(cleanSpoken)) {
          setPronunciationResult("success");
        } else {
          setPronunciationResult("failure");
        }
      };

      recognition.onerror = (err: any) => {
        console.error("Mic error:", err);
        setMicErrorMsg("Допуск к микрофону заблокирован. Запуск симулятора...");
        runSimulatedCorrectPronunciation();
      };

      recognition.onend = () => {
        setIsSpeechListening(false);
      };

      try {
        recognition.start();
      } catch (ex) {
        console.error(ex);
        runSimulatedCorrectPronunciation();
      }
    };

    return (
      <div className="space-y-4 animate-fade-in font-sans text-left">
        <div className="flex items-center gap-3 px-1">
          <button type="button" onClick={() => setCurrentTab("home")} className="p-2 rounded-xl bg-white border border-isa-border text-isa-navy cursor-pointer">
            ←
          </button>
          <h2 className="text-base font-extrabold text-isa-navy">Лингвистическая Студия</h2>
        </div>

        {/* Dual Mode Switcher Tab */}
        <div className="bg-slate-100 rounded-xl p-1 border border-slate-200 grid grid-cols-2 gap-1 select-none">
          <button
            type="button"
            onClick={() => setTranslatorSubTab("translate")}
            className={`py-2 rounded-xl text-[11px] font-black transition ${
              translatorSubTab === "translate" 
                ? "bg-white text-slate-800 shadow-sm border border-slate-200" 
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            🌐 Умный переводчик
          </button>
          <button
            type="button"
            onClick={() => {
              setTranslatorSubTab("pronounce");
              setSpeechRecognized("");
              setPronunciationResult("none");
              setMicErrorMsg("");
            }}
            className={`py-2 rounded-xl text-[11px] font-black transition ${
              translatorSubTab === "pronounce" 
                ? "bg-white text-slate-800 shadow-sm border border-slate-200" 
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            🎙️ Тренажёр произношения
          </button>
        </div>

        {translatorSubTab === "translate" ? (
          <div className="space-y-4">
            {/* Lang selectors */}
            <div className="wellness-card p-3 flex items-center gap-2">
              <select
                value={translatorFrom}
                onChange={(e) => setTranslatorFrom(e.target.value)}
                className="flex-1 text-xs p-2 border border-isa-border rounded-xl bg-white text-isa-navy font-bold cursor-pointer"
              >
                {langs.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
              <button type="button" onClick={() => {
                const tmp = translatorFrom;
                setTranslatorFrom(translatorTo);
                setTranslatorTo(tmp);
                setTranslatorInput(translatorOutput);
                setTranslatorOutput(translatorInput);
              }} className="p-2 rounded-xl bg-isa-navy-soft text-isa-navy font-bold text-sm cursor-pointer">⇄</button>
              <select
                value={translatorTo}
                onChange={(e) => setTranslatorTo(e.target.value)}
                className="flex-1 text-xs p-2 border border-isa-border rounded-xl bg-white text-isa-navy font-bold cursor-pointer"
              >
                {langs.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
            </div>

            {/* Input */}
            <div className="wellness-card p-3 space-y-2">
              <textarea
                value={translatorInput}
                onChange={(e) => setTranslatorInput(e.target.value)}
                placeholder="Введите текст для перевода..."
                rows={5}
                className="w-full text-sm p-3 border border-isa-border rounded-xl bg-white resize-none text-isa-navy"
              />
              <button
                type="button"
                onClick={handleTranslate}
                disabled={!translatorInput.trim() || isTranslating}
                className="w-full py-3 isa-lessons-cta rounded-xl font-bold text-sm cursor-pointer disabled:opacity-40 text-white"
              >
                {isTranslating ? "Переводим…" : "Перевести ⚡"}
              </button>
            </div>

            {/* Output */}
            {(translatorOutput || isTranslating) && (
              <div className="wellness-card p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-isa-muted uppercase tracking-wider">Перевод</span>
                  {translatorOutput && (
                    <button type="button" onClick={() => navigator.clipboard?.writeText(translatorOutput)} className="text-[10px] text-isa-gold font-bold cursor-pointer">Копировать</button>
                  )}
                </div>
                {isTranslating ? (
                  <p className="text-sm text-isa-muted animate-pulse">Переводим…</p>
                ) : (
                  <p className="text-sm text-isa-navy leading-relaxed whitespace-pre-wrap">{translatorOutput}</p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* PRONUNCIATION TRAINER LAYOUT */}
            <div className="wellness-card p-4 space-y-4">
              <div className="space-y-1">
                <h3 className="text-xs font-extrabold text-[#202124]">Изучаемое слово/фраза:</h3>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-slate-900 border-b border-dashed border-[#4285F4] pb-0.5">
                    {selectedWordToPractice.word}
                  </span>
                  <button
                    type="button"
                    onClick={() => speakTargetWord(selectedWordToPractice.word)}
                    className="p-1 px-2 rounded-lg bg-[#E8F0FE] hover:bg-slate-200 text-[#1967D2] font-black text-[9px] flex items-center gap-1 cursor-pointer transition"
                  >
                    🔊 Прослушать
                  </button>
                </div>
                <p className="text-[10.5px] text-slate-500">Значение: <span className="font-bold text-slate-700">{selectedWordToPractice.translation}</span></p>
              </div>

              {/* Dynamic Speech Indicator Card with RED or GREEN color change feedback */}
              <div 
                className={`p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center text-center gap-2 min-h-[140px] relative overflow-hidden ${
                  pronunciationResult === "success" 
                    ? "bg-[#E6F4EA] border-emerald-500 text-emerald-800" 
                    : pronunciationResult === "failure" 
                    ? "bg-[#FCE8E6] border-[#EA4335] text-red-800"
                    : isSpeechListening 
                    ? "bg-slate-50 border-blue-500 text-blue-700 animate-pulse" 
                    : "bg-white border-slate-200 text-slate-700"
                }`}
              >
                {pronunciationResult === "success" && (
                  <>
                    <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xl font-bold select-none shadow-sm animate-bounce">✓</div>
                    <span className="text-xs font-black tracking-wide">ПРАВИЛЬНОЕ ПРОИЗНОШЕНИЕ! 🎉</span>
                    <p className="text-[10.5px] font-mono text-emerald-700">Вы успешно раскодировали: "{speechRecognized}"</p>
                  </>
                )}

                {pronunciationResult === "failure" && (
                  <>
                    <div className="w-10 h-10 bg-[#EA4335] text-white rounded-full flex items-center justify-center text-xl font-bold select-none shadow-sm animate-shake">✗</div>
                    <span className="text-xs font-black tracking-wide">ПОЧТИ ПОЛУЧИЛОСЬ. ПОПРОБУЙТЕ СНОВА! ⚠️</span>
                    <p className="text-[11px] font-mono text-slate-500">Система распознала: <span className="font-black text-red-600">"{speechRecognized || "---"}"</span></p>
                  </>
                )}

                {pronunciationResult === "none" && !isSpeechListening && (
                  <>
                    <span className="text-2xl opacity-60">🎙️</span>
                    <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Готов к записи произношения</span>
                    <p className="text-[9.5px] text-slate-400 max-w-[210px]">Зажмите микрофон внизу, произнесите слово на английском и смотрите результат.</p>
                  </>
                )}

                {isSpeechListening && (
                  <>
                    <div className="flex gap-1 justify-center items-end h-6 select-none pb-1">
                      <div className="w-1 h-3 bg-blue-500 rounded animate-bounce shrink-0" style={{ animationDelay: '0.1s' }} />
                      <div className="w-1 h-5 bg-blue-500 rounded animate-bounce shrink-0" style={{ animationDelay: '0.3s' }} />
                      <div className="w-1 h-2 bg-blue-500 rounded animate-bounce shrink-0" style={{ animationDelay: '0.5s' }} />
                      <div className="w-1 h-5 bg-blue-500 rounded animate-bounce shrink-0" style={{ animationDelay: '0.2s' }} />
                    </div>
                    <span className="text-xs font-black text-blue-800">ГОЛОСОВОЙ ИИ СЛУШАЕТ ВАС...</span>
                    <p className="text-[10px] text-slate-500 font-bold">Говорите: "{selectedWordToPractice.word}" ...</p>
                  </>
                )}

                {/* Simulated error override */}
                {micErrorMsg && <p className="text-[8.5px] text-orange-600 block text-center absolute bottom-1 font-semibold">{micErrorMsg}</p>}
              </div>

              {/* MIC BUTTON & MANUAL TESTING FALLBACKS */}
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleSpeechListen}
                  disabled={isSpeechListening}
                  className={`w-full py-3 rounded-2xl text-[11px] font-black tracking-wider uppercase flex items-center justify-center gap-1.5 transition-all select-none cursor-pointer ${
                    isSpeechListening 
                      ? "bg-blue-600 text-white shadow-inner animate-pulse" 
                      : "bg-[#4285F4] hover:bg-blue-600 text-white shadow-md active:scale-95"
                  }`}
                >
                  🎤 {isSpeechListening ? "Слушаю... Говорите!" : "Начать запись голоса"}
                </button>

                {/* Simulated tests trigger buttons */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={runSimulatedCorrectPronunciation}
                    disabled={isSpeechListening}
                    className="flex-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 py-1 rounded-xl text-[9px] font-bold cursor-pointer"
                  >
                    💡 Симулировать Верно
                  </button>
                  <button
                    type="button"
                    onClick={runSimulatedIncorrectPronunciation}
                    disabled={isSpeechListening}
                    className="flex-1 bg-red-50 hover:bg-red-100 border border-slate-205 text-red-800 py-1 rounded-xl text-[9px] font-bold cursor-pointer"
                  >
                    🚨 Симулировать Ошибку
                  </button>
                </div>
              </div>
            </div>

            {/* CURATED STUDY LIST SELECTOR */}
            <div className="space-y-2 select-none">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase font-mono tracking-widest block">Каталог академических выражений (IELTS/SAT)</span>
              <div className="grid grid-cols-2 gap-1.5">
                {curatedVocabulary.map((vocab, vIdx) => {
                  const isCurrent = vocab.word === selectedWordToPractice.word;
                  return (
                    <button
                      key={vIdx}
                      type="button"
                      onClick={() => {
                        setSelectedWordToPractice(vocab);
                        setSpeechRecognized("");
                        setPronunciationResult("none");
                        setMicErrorMsg("");
                      }}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition flex flex-col justify-between h-[64px] ${
                        isCurrent 
                          ? "bg-slate-900 text-white border-slate-900" 
                          : "bg-white text-slate-800 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <span className="text-[11.5px] font-black block leading-tight truncate">{vocab.word}</span>
                      <span className={`text-[9px] block ${isCurrent ? "text-slate-300" : "text-slate-400"}`}>{vocab.translation}</span>
                    </button>
                  );
                })}
              </div>

              {/* Add Custom Word practice box */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 mt-1">
                <span className="text-[9.5px] font-bold text-slate-500 uppercase tracking-widest block">Добавить своё слово для тренировки:</span>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={customWordInput}
                    onChange={(e) => setCustomWordInput(e.target.value)}
                    placeholder="E.g., Perseverance, Equilibrium..."
                    className="flex-1 p-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!customWordInput.trim()) return;
                      setSelectedWordToPractice({
                        word: customWordInput,
                        translation: "Своё тренировочное слово"
                      });
                      setSpeechRecognized("");
                      setPronunciationResult("none");
                      setMicErrorMsg("");
                      setCustomWordInput("");
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-[10px] p-2 px-3 rounded-lg cursor-pointer"
                  >
                    Учить!
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    );
  };

  // UNIVERSITIES TAB
  const renderUniversitiesTab = () => {
    const universities = [
      {
        name: "Вестминстерский университет в Ташкенте",
        short: "WUT",
        emoji: "🏛️",
        color: "#003478",
        programs: ["Бизнес", "IT", "Медиа", "Право"],
        desc: "Британский диплом в сердце Ташкента. Один из самых престижных международных университетов Узбекистана.",
        website: "https://westminster.uz",
        location: "ул. Истиклол, 12",
        rating: "★★★★★",
        image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80",
      },
      {
        name: "Университет Инха в Ташкенте",
        short: "IUT",
        emoji: "🔬",
        color: "#0066CC",
        programs: ["IT", "Инженерия", "Электроника"],
        desc: "Корейский технический университет — лидер в области инженерии и информационных технологий.",
        website: "https://inha.uz",
        location: "ул. Зарафшон, 9",
        rating: "★★★★★",
        image: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=600&q=80",
      },
      {
        name: "Туринский политехнический университет",
        short: "Turin Poly",
        emoji: "⚙️",
        color: "#003DA5",
        programs: ["Архитектура", "Инженерия", "Дизайн"],
        desc: "Итальянский университет с более чем 200-летней историей. Выдаёт двойной диплом.",
        website: "https://polito.uz",
        location: "ул. Малая Кольцевая, 17",
        rating: "★★★★☆",
        image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80",
      },
      {
        name: "Российский экономический университет им. Плеханова",
        short: "РЭУ Ташкент",
        emoji: "📊",
        color: "#C41E3A",
        programs: ["Экономика", "Менеджмент", "Финансы"],
        desc: "Российский диплом государственного образца. Сильная экономическая и управленческая база.",
        website: "https://reu.uz",
        location: "пр. Амира Тимура, 107Б",
        rating: "★★★★☆",
        image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=600&q=80",
      },
      {
        name: "Университет Акфа",
        short: "AKFA",
        emoji: "💡",
        color: "#FF6B00",
        programs: ["Медицина", "IT", "Право", "Бизнес"],
        desc: "Современный частный университет с широким спектром направлений и инновационной средой.",
        website: "https://akfauniversity.uz",
        location: "ул. Бунёдкор, 43",
        rating: "★★★★☆",
        image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80",
      },
      {
        name: "МГИМО — Ташкент",
        short: "МГИМО",
        emoji: "🌍",
        color: "#1A1A6C",
        programs: ["Международные отношения", "Право", "Журналистика"],
        desc: "Филиал легендарного московского вуза. Подготовка специалистов в области дипломатии.",
        website: "https://mgimo.uz",
        location: "ул. Мустакиллик, 54",
        rating: "★★★★★",
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
      },
    ];

    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center gap-3 px-1">
          <button type="button" onClick={() => setCurrentTab("home")} className="p-2 rounded-xl bg-white border border-isa-border text-isa-navy cursor-pointer">←</button>
          <div>
            <h2 className="text-base font-extrabold text-isa-navy">Университеты Ташкента</h2>
            <p className="text-[10px] text-isa-muted">Лучшие вузы города — обзор и контакты</p>
          </div>
        </div>

        <div className="space-y-3">
          {universities.map((uni) => (
            <div key={uni.short} className="wellness-card p-0 overflow-hidden pb-4">
              {uni.image && (
                <div className="h-32 w-full overflow-hidden relative">
                  <img 
                    src={uni.image} 
                    alt={uni.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                  <span className="absolute bottom-2.5 left-3.5 bg-white/95 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-extrabold text-isa-navy">
                    {uni.short}
                  </span>
                </div>
              )}
              {/* Padding-covered card content */}
              <div className="px-4 pt-3.5 space-y-2">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: uni.color + "18" }}>
                    {uni.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-[12px] font-extrabold text-isa-navy leading-snug">{uni.name}</h3>
                      <span className="text-[10px] shrink-0 font-extrabold text-amber-500">{uni.rating}</span>
                    </div>
                    <p className="text-[10px] text-isa-muted mt-0.5">📍 {uni.location}</p>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">{uni.desc}</p>

                <div className="flex flex-wrap gap-1">
                  {uni.programs.map(p => (
                    <span key={p} className="text-[9px] font-bold px-2 py-0.5 rounded-full border" style={{ color: uni.color, borderColor: uni.color + "40", background: uni.color + "10" }}>{p}</span>
                  ))}
                </div>

                <a
                  href={uni.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] font-bold cursor-pointer"
                  style={{ color: uni.color }}
                >
                  🔗 {uni.website.replace("https://", "")} →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // EXAM HUB TAB
  const renderExamHubTab = () => {
    // Calculators
    const calculateRemainingDays = (dateStr: string) => {
      if (!dateStr) return null;
      const examDate = new Date(dateStr);
      const today = new Date();
      // Set to midnight to avoid hour differences
      examDate.setHours(0,0,0,0);
      today.setHours(0,0,0,0);
      const diffTime = examDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    };

    const handleAddExam = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newExamDate || !newExamScore) {
        alert("Пожалуйста, укажите дату и желаемый балл.");
        return;
      }
      const newExam = {
        id: Date.now().toString(),
        subject: newExamSubject,
        targetDate: newExamDate,
        targetScore: newExamScore,
        registered: false,
      };
      setExamGoals([...examGoals, newExam]);
      setNewExamDate("");
      setNewExamScore("");
    };

    const handleDeleteExam = (id: string) => {
      setExamGoals(examGoals.filter(goal => goal.id !== id));
    };

    const toggleRegisteredState = (id: string) => {
      setExamGoals(examGoals.map(goal => goal.id === id ? { ...goal, registered: !goal.registered } : goal));
    };

    // Prep courses data
    const prepCourses = [
      {
        name: "REAL SCIENCE",
        rating: "4.9",
        reviews: "450+",
        color: "#ff7a1a",
        tag: "Премиум Физика & Математика",
        address: "Мирабадский р-н, Бизнес-центр Poytaxt, 3 этаж",
        phone: "+998 (71) 205-08-80",
        programs: ["Подготовка в Вестминстер (WIUT)", "Подготовка в Инха (IUT)", "SAT Math & Writing", "IELTS Intensive"],
        price: "от 900,000 UZS / месяц",
        desc: "Лидирующий центр подготовки в топовые международные ВУЗы Ташкента. 92% выпускников успешно поступают на бюджет."
      },
      {
        name: "THOMPSON SCHOOL",
        rating: "4.8",
        reviews: "600+",
        color: "#1a73e8",
        tag: "Разговорный & IELTS",
        address: "Чиланзар-1, ст. метро Новза",
        phone: "+998 (78) 122-49-99",
        programs: ["IELTS 7.5+ Rocket", "General English (All Levels)", "CEFR B2/C1 Prep", "English for Kids"],
        price: "от 750,000 UZS / месяц",
        desc: "Школа инновационного изучения английского языка с сильным уклоном в говорение и сдачу IELTS."
      },
      {
        name: "EVERBEST ACADEMY",
        rating: "4.9",
        reviews: "320+",
        color: "#10b981",
        tag: "Высокие Результаты",
        address: "Юнусабадский р-н, ориентир ст. метро Шахристан",
        phone: "+998 (90) 900-50-60",
        programs: ["Mock IELTS Weekly", "IELTS Standard (4 months)", "Pre-IELTS", "Academic Writing masterclass"],
        price: "от 800,000 UZS / месяц",
        desc: "Известны своими еженедельными реалистичными Mock IELTS тестами и сильным преподавательским составом (IELTS 8.5/9.0)."
      },
      {
        name: "ALPHA EDUCATION",
        rating: "4.7",
        reviews: "180+",
        color: "#8b5cf6",
        tag: "Бизнес & Логика",
        address: "Яккасарайский р-н, ул. Кичик халка йули, 2",
        phone: "+998 (71) 230-00-10",
        programs: ["Академическая Математика", "Бизнес Английский", "Курсы логического мышления"],
        price: "от 1,100,000 UZS / месяц",
        desc: "Качественная математическая база и курсы аналитического мышления для будущих экономистов и финансистов."
      }
    ];

    const triggerEnrollConsult = (courseName: string) => {
      setEnrollSuccessMessage(`Вы успешно оставили заявку на бесплатный пробный урок в ${courseName}! Академический консультант свяжется с вами по номеру телефона в вашем профиле.`);
      setTimeout(() => setEnrollSuccessMessage(null), 6000);
    };

    return (
      <div className="space-y-4 animate-fade-in shadow-xs">
        {/* Header */}
        <div className="flex items-center gap-3 px-1">
          <button type="button" onClick={() => setCurrentTab("home")} className="p-2 rounded-xl bg-white border border-isa-border text-isa-navy cursor-pointer">←</button>
          <div>
            <h2 className="text-base font-extrabold text-isa-navy">Академический центр подготовки</h2>
            <p className="text-[10px] text-isa-muted">Экзаменационные цели, подготовительные курсы и инструкции</p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="bg-isa-navy-soft rounded-xl p-1 grid grid-cols-2 md:grid-cols-4 gap-1">
          <button
            type="button"
            onClick={() => setExamHubActiveTab("my-exams")}
            className={`py-2 text-[10px] sm:text-[10.5px] font-black rounded-lg transition text-center cursor-pointer ${examHubActiveTab === "my-exams" ? "bg-white text-isa-navy shadow-sm" : "text-isa-navy-mid hover:text-isa-navy"}`}
          >
            🎯 Мои Цели
          </button>
          <button
            type="button"
            onClick={() => setExamHubActiveTab("prep-courses")}
            className={`py-2 text-[10px] sm:text-[10.5px] font-black rounded-lg transition text-center cursor-pointer ${examHubActiveTab === "prep-courses" ? "bg-white text-isa-navy shadow-sm" : "text-isa-navy-mid hover:text-isa-navy"}`}
          >
            🏫 Курсы / Академии
          </button>
          <button
            type="button"
            onClick={() => setExamHubActiveTab("registration")}
            className={`py-2 text-[10px] sm:text-[10.5px] font-black rounded-lg transition text-center cursor-pointer ${examHubActiveTab === "registration" ? "bg-white text-isa-navy shadow-sm" : "text-isa-navy-mid hover:text-isa-navy"}`}
          >
            📝 Инструкции
          </button>
          <button
            type="button"
            onClick={() => setExamHubActiveTab("mock-calendar")}
            className={`py-2 text-[10px] sm:text-[10.5px] font-black rounded-lg transition text-center cursor-pointer ${examHubActiveTab === "mock-calendar" ? "bg-emerald-600 text-white shadow-sm" : "text-[#1b365d] hover:text-emerald-800"}`}
          >
            📅 Календарь Mock-тестов
          </button>
        </div>

        {enrollSuccessMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-[11px] leading-relaxed animate-fade-in flex items-start gap-2">
            <span className="text-sm">✅</span>
            <p>{enrollSuccessMessage}</p>
          </div>
        )}

        {/* TAB BODY 1: MY EXAMS (Goal Setting) */}
        {examHubActiveTab === "my-exams" && (
          <div className="space-y-4">
            {/* New exam form */}
            <form onSubmit={handleAddExam} className="wellness-card p-3.5 space-y-3">
              <span className="text-[10px] uppercase font-mono font-black text-slate-400 tracking-wider">🎯 Установить экзаменационную цель</span>
              <div className="grid grid-cols-1 gap-2.5">
                <div>
                  <label className="text-[10px] font-bold text-isa-navy block mb-1">Предмет / Экзамен</label>
                  <select
                    value={newExamSubject}
                    onChange={(e) => setNewExamSubject(e.target.value)}
                    className="w-full text-[11px] p-2 bg-white border border-isa-border rounded-xl font-medium cursor-pointer"
                  >
                    <option value="IELTS Academic">IELTS Academic (British Council / IDP)</option>
                    <option value="SAT Digital">SAT Digital (College Board)</option>
                    <option value="WIUT Entrance MATH">Вестминстер Математика (WIUT Entrance)</option>
                    <option value="IUT Entrance MATH/PHYS">Университет Инха Математика и Физика (IUT)</option>
                    <option value="CEFR / National English">CEFR Английский язык (Гостестцентр)</option>
                    <option value="Amity Entrance EXAM">Амити Вступительный Экзамен</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-isa-navy block mb-1">Дата сдачи</label>
                    <input
                      type="date"
                      value={newExamDate}
                      onChange={(e) => setNewExamDate(e.target.value)}
                      required
                      className="w-full text-[11px] p-2 bg-white border border-isa-border rounded-xl font-medium cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-isa-navy block mb-1">Желаемый балл</label>
                    <input
                      type="text"
                      value={newExamScore}
                      onChange={(e) => setNewExamScore(e.target.value)}
                      placeholder="например: 7.5 или 1450"
                      required
                      className="w-full text-[11px] p-2 bg-white border border-isa-border rounded-xl font-medium"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 text-[11px] font-black text-white bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl cursor-pointer hover:opacity-95 transition mt-2 shadow-sm"
              >
                + Добавить цель в календарь
              </button>
            </form>

            {/* List of goals */}
            <div className="space-y-2.5">
              <span className="text-[10px] uppercase font-mono font-black text-slate-400 tracking-wider block px-1">Мое расписание и дедлайны</span>
              {examGoals.length === 0 ? (
                <div className="text-center py-6 bg-slate-50 border border-slate-100 rounded-2xl">
                  <span className="text-2xl">📅</span>
                  <p className="text-[11px] text-isa-muted mt-1.5">У вас пока нет установленных экзаменов. Добавьте первую цель выше!</p>
                </div>
              ) : (
                examGoals.map((goal) => {
                  const daysLeft = calculateRemainingDays(goal.targetDate);
                  const isOverdue = daysLeft !== null && daysLeft < 0;

                  return (
                    <div key={goal.id} className="wellness-card p-3.5 space-y-3 relative-parent">
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="min-w-0">
                          <span className="bg-isa-navy-soft text-isa-navy font-bold text-[8.5px] px-2 py-0.5 rounded border border-isa-border/55">
                            {goal.subject}
                          </span>
                          <h4 className="text-[12px] font-extrabold text-isa-navy mt-1.5 leading-snug">Цель: {goal.targetScore}</h4>
                          <p className="text-[10px] text-isa-muted mt-0.5">📅 Дата: {new Date(goal.targetDate).toLocaleDateString('ru-RU')}</p>
                        </div>

                        {daysLeft !== null && (
                          <div className="text-right shrink-0">
                            {isOverdue ? (
                              <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Прошел</span>
                            ) : (
                              <span className={`text-[9.5px] font-black px-2.5 py-0.5 rounded-full border ${daysLeft <= 14 ? "bg-red-50 text-red-600 border-red-200 animate-pulse" : "bg-orange-50 text-orange-600 border-orange-200"}`}>
                                Осталось дней: {daysLeft}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={goal.registered}
                            onChange={() => toggleRegisteredState(goal.id)}
                            className="w-3.5 h-3.5 text-isa-gold border-isa-border rounded focus:ring-isa-gold bg-white cursor-pointer"
                          />
                          <span className="text-[10px] font-extrabold text-slate-600">Зарегистрировался на официальный экзамен</span>
                        </label>

                        <button
                          type="button"
                          onClick={() => handleDeleteExam(goal.id)}
                          className="text-[10px] font-bold text-red-500 hover:text-red-700 cursor-pointer p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB BODY 2: PREPARATORY COURSES */}
        {examHubActiveTab === "prep-courses" && (
          <div className="space-y-3">
            <span className="text-[10px] uppercase font-mono font-black text-slate-400 tracking-wider block px-1">Лучшие подготовительные центры Ташкента</span>
            {prepCourses.map((course) => (
              <div key={course.name} className="wellness-card p-4 space-y-3 border-t-4" style={{ borderTopColor: course.color }}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[9px] font-bold text-white px-2 py-0.5 rounded-full" style={{ background: course.color }}>
                      {course.tag}
                    </span>
                    <h3 className="text-[13px] font-black text-isa-navy mt-1">{course.name}</h3>
                    <p className="text-[10px] text-isa-muted mt-0.5">📍 {course.address}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-extrabold text-isa-navy">⭐ {course.rating}</span>
                    <p className="text-[8.5px] text-isa-muted">({course.reviews} отзывов)</p>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed font-normal">{course.desc}</p>

                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-isa-muted block uppercase tracking-wider">Программы обучения:</span>
                  <div className="flex flex-wrap gap-1">
                    {course.programs.map((prog) => (
                      <span key={prog} className="text-[9px] font-bold text-slate-700 bg-slate-100 border border-slate-200/50 px-2.5 py-0.5 rounded-full">
                        {prog}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-1.5">
                  <span className="text-[10px] font-extrabold text-indigo-900">{course.price}</span>
                  <button
                    type="button"
                    onClick={() => triggerEnrollConsult(course.name)}
                    className="px-3.5 py-1.5 bg-isa-navy hover:opacity-95 text-white font-extrabold text-[10px] rounded-lg cursor-pointer transition shadow-xs"
                  >
                    Заявка на урок ⚡
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB BODY 3: OFFIClAL EXAM REGISTRATION MANUAL */}
        {examHubActiveTab === "registration" && (
          <div className="space-y-3.5">
            <span className="text-[10px] uppercase font-mono font-black text-slate-400 tracking-wider block px-1">Официальные Инструкции по Регистрации</span>

            {/* IELTS Guide */}
            <div className="wellness-card p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🇬🇧</span>
                <h3 className="text-[12.5px] font-black text-isa-navy">Официальный IELTS (British Council / IDP)</h3>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                В Ташкенте сдать официальный IELTS можно через двух провайдеров. Сертификат полностью принимается во всех ВУЗах Узбекистана и мира.
              </p>
              
              <div className="bg-slate-50 rounded-xl p-3 space-y-2">
                <span className="text-[9.5px] uppercase font-bold text-isa-navy block">Пошаговый процесс:</span>
                <ul className="text-[10.5px] text-slate-600 space-y-1.5 list-decimal list-inside">
                  <li>Зайдите на сайт <a href="https://britishcouncil.uz" target="_blank" rel="noreferrer" className="text-sky-600 font-bold decoration-dotted underline">britishcouncil.uz</a> или <a href="https://idp.com" target="_blank" rel="noreferrer" className="text-sky-600 font-bold decoration-dotted underline">idp.com</a>.</li>
                  <li>Выберите формат экзамена: <strong>Computer-delivered IELTS</strong> (результаты за 3-5 дней) или <strong>Paper-based</strong>.</li>
                  <li>Заполните свои паспортные данные (требуется действующий загранпаспорт).</li>
                  <li>Оплатите сбор (ор. 2,200,000 UZS) картой или переводом в банке.</li>
                </ul>
              </div>

              <div className="flex items-center justify-between text-[10px] text-isa-muted leading-tight border-t border-slate-100 pt-2.5">
                <span>📍 Офисы в Ташкенте: WIUT, ТашГПУ, EduAction</span>
                <a href="https://britishcouncil.uz" target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 text-sky-600 font-bold text-[9.5px] cursor-pointer">britishcouncil.uz <ExternalLink className="w-2.5 h-2.5" /></a>
              </div>
            </div>

            {/* SAT Digital Guide */}
            <div className="wellness-card p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🇺🇸</span>
                <h3 className="text-[12.5px] font-black text-isa-navy">SAT Digital (College Board)</h3>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Необходим для большинства американских ВУЗов и освобождает от математического экзамена в WIUT (при балле Math &ge; 600).
              </p>

              <div className="bg-slate-50 rounded-xl p-3 space-y-2">
                <span className="text-[9.5px] uppercase font-bold text-isa-navy block">Пошаговый процесс:</span>
                <ul className="text-[10.5px] text-slate-600 space-y-1.5 list-decimal list-inside">
                  <li>Создайте аккаунт на официальном портале <strong>College Board</strong>.</li>
                  <li>Скачайте и установите приложение <strong>Bluebook</strong> на свой ноутбук или планшет (тестирование проходит в нем).</li>
                  <li>Зарегистрируйтесь на тест, выберите центр в Ташкенте (Президентская Школа, Школа Аль-Хорезми).</li>
                  <li>Оплатите пошлину с международной долларовой карты (Visa/Mastercard).</li>
                </ul>
              </div>

              <div className="flex items-center justify-between text-[10px] text-isa-muted leading-tight border-t border-slate-100 pt-2.5">
                <span>📍 Центры в Ташкенте: БЦ Пойтахт, Аль-Хорезми, WIUT school</span>
                <a href="https://collegeboard.org" target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 text-sky-600 font-bold text-[9.5px] cursor-pointer">collegeboard.org <ExternalLink className="w-2.5 h-2.5" /></a>
              </div>
            </div>

            {/* Westminster / West Entrance Guide */}
            <div className="wellness-card p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎓</span>
                <h3 className="text-[12.5px] font-black text-isa-navy">Вступительный экзамен WIUT (West MATH)</h3>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Собственный бумажный экзамен Вестминстерского университета по математике. Состоит из 20 задач повышенной сложности.
              </p>

              <div className="bg-slate-50 rounded-xl p-3 space-y-2">
                <span className="text-[9.5px] uppercase font-bold text-isa-navy block">Пошаговый процесс:</span>
                <ul className="text-[10.5px] text-slate-600 space-y-1.5 list-decimal list-inside">
                  <li>Подайте документы онлайн на официальном портале <strong>admission.wiut.uz</strong>.</li>
                  <li>Загрузите копию паспорта, фото и верифицируйте статус.</li>
                  <li>В личном кабинете выберите форму сдачи: "Внутренний экзамен по математике".</li>
                  <li>Скачайте пропуск на экзамен (Exam Ticket) с указанием точного времени и вашей парты.</li>
                </ul>
              </div>

              <div className="flex items-center justify-between text-[10px] text-isa-muted leading-tight border-t border-slate-100 pt-2.5">
                <span>📍 Место сдачи: Спорткомплекс WIUT, ул. Истиклол</span>
                <a href="https://wiut.uz" target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 text-sky-600 font-bold text-[9.5px] cursor-pointer">admission.wiut.uz <ExternalLink className="w-2.5 h-2.5" /></a>
              </div>
            </div>
          </div>
        )}

        {/* TAB BODY 4: MOCK CALENDAR */}
        {examHubActiveTab === "mock-calendar" && (
          <div className="space-y-4 animate-fade-in text-left">
            {/* Header and Month switches */}
            <div className="wellness-card p-4 space-y-4 bg-white border border-slate-100 shadow-sm rounded-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-[13px] font-black text-isa-navy">📅 Расписание Mock-тестов в Ташкенте</h3>
                  <p className="text-[10px] text-isa-muted leading-tight">Интерактивный календарь регистраций на симуляционные экзамены 2026</p>
                </div>
                {/* Month switch buttons */}
                <div className="flex gap-1.5 self-start">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCalendarMonth("May");
                      setSelectedCalendarDay("2026-05-24");
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[10.5px] font-black transition cursor-pointer select-none ${selectedCalendarMonth === "May" ? "bg-isa-navy text-white shadow-xs" : "bg-slate-100 hover:bg-slate-200 text-isa-navy"}`}
                  >
                    Май 2026
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCalendarMonth("June");
                      setSelectedCalendarDay("2026-06-07");
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[10.5px] font-black transition cursor-pointer select-none ${selectedCalendarMonth === "June" ? "bg-isa-navy text-white shadow-xs" : "bg-slate-100 hover:bg-slate-200 text-isa-navy"}`}
                  >
                    Июнь 2026
                  </button>
                </div>
              </div>

              {/* Grid representation */}
              <div className="space-y-2 font-sans select-none">
                {/* Mon-Sun header */}
                <div className="grid grid-cols-7 gap-1 text-center font-bold text-[9px] text-isa-muted py-1 border-b border-slate-50">
                  <span>ПН</span>
                  <span>ВТ</span>
                  <span>СР</span>
                  <span>ЧТ</span>
                  <span>ПТ</span>
                  <span className="text-[#34A853]">СБ</span>
                  <span className="text-[#34A853]">ВС</span>
                </div>

                {/* Grid cells */}
                <div className="grid grid-cols-7 gap-1.5">
                  {(() => {
                    const emptyDaysCount = selectedCalendarMonth === "May" ? 4 : 0;
                    const totalDaysInMonth = selectedCalendarMonth === "May" ? 31 : 30;

                    const cells = [];
                    // Previous month pad
                    for (let i = 0; i < emptyDaysCount; i++) {
                      cells.push(
                        <div key={`empty-${i}`} className="aspect-square bg-slate-50/20 rounded-lg" />
                      );
                    }
                    // Current month days
                    const mockExamsData = [
                      { id: "m1", date: "2026-05-24", title: "Mock IELTS Academic", provider: "REAL SCIENCE", type: "ielts" },
                      { id: "m2", date: "2026-05-30", title: "Mock WIUT Math", provider: "Everbest Academy", type: "math" },
                      { id: "m3", date: "2026-05-31", title: "Mock IELTS Academic", provider: "Thompson School", type: "ielts" },
                      { id: "m4", date: "2026-06-06", title: "Mock WIUT Math", provider: "REAL SCIENCE", type: "math" },
                      { id: "m5", date: "2026-06-07", title: "Mock IELTS Academic", provider: "REAL SCIENCE", type: "ielts" },
                      { id: "m6", date: "2026-06-13", title: "Mock SAT Digital", provider: "REAL SCIENCE", type: "sat" },
                      { id: "m7", date: "2026-06-14", title: "Mock IELTS Academic", provider: "Everbest Academy", type: "ielts" }
                    ];

                    for (let dayNum = 1; dayNum <= totalDaysInMonth; dayNum++) {
                      const dStr = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
                      const dateStr = selectedCalendarMonth === "May" ? `2026-05-${dStr}` : `2026-06-${dStr}`;
                      const examOnDay = mockExamsData.find(e => e.date === dateStr);
                      const isSelected = selectedCalendarDay === dateStr;
                      const isRegistered = examOnDay ? registeredMocks.includes(examOnDay.id) : false;

                      let dotColor = "transparent";
                      if (examOnDay) {
                        if (examOnDay.type === "ielts") dotColor = "bg-[#34A853]";
                        else if (examOnDay.type === "sat") dotColor = "bg-amber-500";
                        else if (examOnDay.type === "math") dotColor = "bg-violet-600";
                      }

                      cells.push(
                        <button
                          key={dateStr}
                          type="button"
                          onClick={() => setSelectedCalendarDay(dateStr)}
                          className={`aspect-square relative flex flex-col items-center justify-center p-1 rounded-xl font-bold transition cursor-pointer select-none text-[11px] ${
                            isSelected 
                              ? "bg-isa-navy text-white shadow-sm ring-2 ring-emerald-400" 
                              : examOnDay 
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-100 hover:bg-emerald-110/50" 
                                : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          <span>{dayNum}</span>
                          
                          {/* Event Dot */}
                          {examOnDay && !isRegistered && (
                            <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${dotColor}`} />
                          )}

                          {/* Registered Check */}
                          {isRegistered && (
                            <span className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[8.5px] border border-white font-sans font-black shadow-xs">✓</span>
                          )}
                        </button>
                      );
                    }
                    return cells;
                  })()}
                </div>
              </div>

              {/* Dot legend */}
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-2 select-none border-t border-slate-100 text-[9.5px] font-bold text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#34A853]" /> IELTS Mock
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-violet-600" /> WIUT Math Mock
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> SAT Digital Mock
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8px] font-bold">✓</span> Записан
                </span>
              </div>
            </div>

            {/* Selected day events detail action screen */}
            {(() => {
              const mockExamsDataFull = [
                {
                  id: "m1",
                  date: "2026-05-24",
                  title: "Mock IELTS Academic",
                  provider: "REAL SCIENCE",
                  time: "09:00 - 12:30",
                  price: "150,000 UZS",
                  type: "ielts",
                  slotsLeft: 3,
                  location: "ст. метро Мустакиллик, БЦ Пойтахт",
                  details: "Полная симуляция реального IELTS: секции Listening (в беспроводных наушниках!), Reading, Writing. Индивидуальный устный Speaking на следующий день."
                },
                {
                  id: "m2",
                  date: "2026-05-30",
                  title: "Mock WIUT Entrance Math",
                  provider: "Everbest Academy",
                  time: "14:00 - 16:00",
                  price: "120,000 UZS",
                  type: "math",
                  slotsLeft: 8,
                  location: "Юнусабадский филиал",
                  details: "Реалистичные 20 задач по программе Westminster Math. Разбор решений с сертифицированным топ-инструктором сразу после теста."
                },
                {
                  id: "m3",
                  date: "2026-05-31",
                  title: "Mock IELTS Academic",
                  provider: "Thompson School",
                  time: "10:00 - 13:30",
                  price: "150,000 UZS",
                  type: "ielts",
                  slotsLeft: 5,
                  location: "метро Новза",
                  details: "IELTS симуляция с профессиональными экзаменаторами. Фидбек-сессия с разбором сочинения Task 1 & Task 2."
                },
                {
                  id: "m4",
                  date: "2026-06-06",
                  title: "Mock WIUT Entrance Math",
                  provider: "REAL SCIENCE",
                  time: "10:00 - 12:00",
                  price: "130,000 UZS",
                  type: "math",
                  slotsLeft: 12,
                  location: "БЦ Пойтахт, 3 этаж, REAL SCIENCE",
                  details: "Официальный Mock Math. Ограничение по времени, оригинальные бланки ответов, проверка апелляционной комиссии."
                },
                {
                  id: "m5",
                  date: "2026-06-07",
                  title: "Mock IELTS Academic",
                  provider: "REAL SCIENCE",
                  time: "09:00 - 12:30",
                  price: "150,000 UZS",
                  type: "ielts",
                  slotsLeft: 2,
                  location: "БЦ Пойтахт, 3 этаж, REAL SCIENCE",
                  details: "Премиум Mock IELTS с беспроводными наушниками и моментальной оценкой Listening/Reading."
                },
                {
                  id: "m6",
                  date: "2026-06-13",
                  title: "Mock SAT Digital",
                  provider: "REAL SCIENCE",
                  time: "10:00 - 13:00",
                  price: "180,000 UZS",
                  type: "sat",
                  slotsLeft: 4,
                  location: "БЦ Пойтахт, 3 этаж, REAL SCIENCE",
                  details: "Тестирование на ваших смартфонах или ноутбуках в приложении-эмуляторе Bluebook по стандартам College Board."
                },
                {
                  id: "m7",
                  date: "2026-06-14",
                  title: "Mock IELTS Academic",
                  provider: "Everbest Academy",
                  time: "09:00 - 12:30",
                  price: "140,000 UZS",
                  type: "ielts",
                  slotsLeft: 9,
                  location: "Юнусабад, метро Шахристан",
                  details: "Сдайте экзамен в точной атмосфере реального тест-центра. Анализ ошибок от преподавателей со средним баллом 8.5+."
                }
              ];

              const currentDayEvent = mockExamsDataFull.find(e => e.date === selectedCalendarDay);
              const formattedSelectedDate = new Date(selectedCalendarDay).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });

              if (!currentDayEvent) {
                return (
                  <div className="wellness-card p-4.5 text-center space-y-2 bg-slate-50/50 rounded-2xl border border-slate-100">
                    <span className="text-2xl text-slate-400">📅</span>
                    <h4 className="text-[12px] font-extrabold text-[#111827]">{formattedSelectedDate}</h4>
                    <p className="text-[10.5px] text-slate-500 leading-tight">На выбранную дату нет активных Mock-тестов. Выберите дни в календаре, содержащие индикаторные точки!</p>
                  </div>
                );
              }

              const isUserRegistered = registeredMocks.includes(currentDayEvent.id);

              return (
                <div className="space-y-4 font-sans">
                  {/* Event card card info */}
                  <div className="wellness-card p-4.5 space-y-3 bg-white border-2 border-emerald-100 rounded-2xl relative overflow-hidden">
                    {/* Corner badge */}
                    <span className="absolute right-0 top-0 bg-emerald-500 text-white text-[8.5px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl shadow-xs">
                      {currentDayEvent.type === "ielts" ? "IELTS Mock" : currentDayEvent.type === "sat" ? "SAT Mock" : "WIUT Math"}
                    </span>

                    <div className="space-y-1">
                      <span className="text-[9.5px] font-mono font-black uppercase text-[#10B981]">{currentDayEvent.provider}</span>
                      <h4 className="text-13px font-extrabold text-isa-navy tracking-tight">{currentDayEvent.title}</h4>
                      <p className="text-[10px] text-slate-400 font-bold">{formattedSelectedDate} запуск в {currentDayEvent.time}</p>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed">{currentDayEvent.details}</p>

                    <div className="grid grid-cols-2 gap-3.5 pt-2 border-t border-slate-100 text-[10.5px]">
                      <div className="space-y-0.5">
                        <span className="text-slate-400 text-[9px] block">Филиал / Локация:</span>
                        <strong className="text-isa-navy leading-tight block">{currentDayEvent.location}</strong>
                      </div>
                      <div className="space-y-0.5 text-right">
                        <span className="text-slate-400 text-[9px] block">Стоимость участия:</span>
                        <strong className="text-emerald-700 text-[12px] block">{currentDayEvent.price}</strong>
                      </div>
                    </div>

                    {/* Book Action buttons */}
                    <div className="pt-2">
                      {isUserRegistered ? (
                        <div className="space-y-2">
                          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-[10.5px] font-bold leading-normal text-center select-none flex items-center justify-center gap-1.5 shadow-xs">
                            <span>✅</span> Вы успешно зарегистрированы на этот Mock-тест! Место забронировано.
                          </div>
                          
                          {/* Super high-fidelity ticket stub! */}
                          <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-3 space-y-2 relative overflow-hidden font-mono">
                            <div className="absolute top-0 bottom-0 left-2 w-0.5 border-r border-[#CBD5E1] border-dashed" />
                            <div className="flex items-center justify-between text-[10px] text-slate-500 pl-4">
                              <span>TICKET NUMBER:</span>
                              <strong>#MOCK-{currentDayEvent.id.toUpperCase()}-{Math.floor(Math.random() * 90000 + 10000)}</strong>
                            </div>
                            <div className="text-[10.5px] text-slate-700 space-y-1 pl-4 leading-normal">
                              <div><strong>ФИО:</strong> Михаил Студент</div>
                              <div><strong>Экзаменатор:</strong> {currentDayEvent.provider}</div>
                              <div><strong>Дата & Время:</strong> {formattedSelectedDate}, {currentDayEvent.time}</div>
                              <div><strong>Стол / Место:</strong> Ряды {currentDayEvent.type === "ielts" ? "A" : "B"}, Парта {Math.floor(Math.random() * 20 + 1)}</div>
                            </div>
                            <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-[8px] text-slate-400 pl-4 font-sans font-bold">
                              <span>📲 SMS-пропуск отправлен на ваш номер</span>
                              <span className="text-[#1967D2] uppercase hover:underline cursor-pointer select-none">Загрузить PDF</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold">
                            <span>🔥 Спешите занять места!</span>
                            <span className="text-red-500 blink uppercase tracking-wide">Регистрация закроется скоро!</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setRegisteredMocks(prev => [...prev, currentDayEvent.id]);
                            }}
                            className="w-full py-2.5 bg-[#10B981] hover:bg-emerald-600 active:scale-[0.99] text-white text-[11px] font-black rounded-xl transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
                          >
                            <span>📝</span> Зарегистрироваться на Mock-экзамен
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* General instructions block for mocks */}
            <div className="wellness-card p-4 space-y-3 bg-gradient-to-br from-[#1b365d]/5 to-slate-50 border border-slate-100 rounded-2xl">
              <span className="text-[10.5px] uppercase font-mono font-black text-[#1b365d] tracking-wider block">🗣️ Правила прохождения Mock-симуляций:</span>
              <ul className="text-[10.5px] text-slate-600 space-y-1.5 list-disc list-inside leading-relaxed font-sans font-medium">
                <li>Прибудьте в академический центр за <strong>30 минут</strong> до времени, указанного в билете.</li>
                <li>Обязательно имейте при себе оригинал паспорта/ID-карты и СМС-пропуск.</li>
                <li>Запрещено проносить в аудиторию умные часы, телефоны или шпаргалки.</li>
                <li>Результаты тестов с подробным разбором сочинений выдаются в течение <strong>72 часов</strong> в вашем личном кабинете.</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  };

  // CALCULATOR TAB
  const renderCalculatorTab = () => {
    // Calculators core logic
    const ieltsOverall = (() => {
      const avg = (ieltsL + ieltsR + ieltsW + ieltsS) / 4;
      const integerPart = Math.floor(avg);
      const decimalPart = avg - integerPart;
      if (decimalPart < 0.25) return integerPart;
      if (decimalPart < 0.75) return integerPart + 0.5;
      return integerPart + 1.0;
    })();

    const satPercentile = (() => {
      const total = satReading + satMath;
      if (total >= 1555) return "99%";
      if (total >= 1500) return "98%";
      if (total >= 1400) return "93%";
      if (total >= 1300) return "86%";
      if (total >= 1200) return "74%";
      if (total >= 1100) return "61%";
      if (total >= 1000) return "43%";
      return "меньше 30%";
    })();

    // GPA core calculation
    const gpaResult = (() => {
      if (gpaScores.length === 0) return { scale4: 0, percentage: 0, totalCredits: 0 };
      let weightedPoints4 = 0;
      let totalPercent = 0;
      let totalCredits = 0;

      gpaScores.forEach(item => {
        // Find 4.0 scale points
        let pts4 = 0;
        if (item.grade >= 90) pts4 = 4.0;
        else if (item.grade >= 80) pts4 = 3.5;
        else if (item.grade >= 70) pts4 = 3.0;
        else if (item.grade >= 60) pts4 = 2.0;
        else if (item.grade >= 50) pts4 = 1.0;

        weightedPoints4 += pts4 * item.credits;
        totalPercent += item.grade * item.credits;
        totalCredits += item.credits;
      });

      return {
        scale4: (weightedPoints4 / totalCredits).toFixed(2),
        percentage: (totalPercent / totalCredits).toFixed(1),
        totalCredits
      };
    })();

    const handleCalcPress = (btn: string) => {
      if (btn === "C") {
        setCalcInput("0");
        setCalcEquation("");
        setIsNewNumber(true);
      } else if (btn === "⌫") {
        if (calcInput.length > 1 && calcInput !== "Ошибка") {
          setCalcInput(calcInput.slice(0, -1));
        } else {
          setCalcInput("0");
          setIsNewNumber(true);
        }
      } else if (btn === "±") {
        if (calcInput !== "0" && calcInput !== "Ошибка") {
          if (calcInput.startsWith("-")) {
            setCalcInput(calcInput.substring(1));
          } else {
            setCalcInput("-" + calcInput);
          }
        }
      } else if (btn === "%") {
        const val = parseFloat(calcInput);
        if (!isNaN(val)) {
          setCalcInput((val / 100).toString());
          setIsNewNumber(true);
        }
      } else if (["+", "-", "*", "/"].includes(btn)) {
        setCalcEquation(calcInput + " " + btn + " ");
        setIsNewNumber(true);
      } else if (btn === "=") {
        if (!calcEquation) return;
        try {
          const fullExpr = calcEquation + calcInput;
          const cleanExpr = fullExpr.replace(/[^0-9+\-*/().]/g, "");
          const r = new Function(`return (${cleanExpr})`)();
          if (r !== undefined && !isNaN(r)) {
            const formattedResult = parseFloat(r.toFixed(8)).toString();
            setCalcInput(formattedResult);
            setCalcEquation("");
            setIsNewNumber(true);
          }
        } catch (err) {
          setCalcInput("Ошибка");
          setCalcEquation("");
          setIsNewNumber(true);
        }
      } else {
        if (btn === ".") {
          if (isNewNumber || calcInput === "Ошибка") {
            setCalcInput("0.");
            setIsNewNumber(false);
          } else if (!calcInput.includes(".")) {
            setCalcInput(calcInput + ".");
          }
        } else {
          if (isNewNumber || calcInput === "0" || calcInput === "Ошибка") {
            setCalcInput(btn);
            setIsNewNumber(false);
          } else {
            setCalcInput(calcInput + btn);
          }
        }
      }
    };

    const handleAddGpaSubject = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newGpaSubject || !newGpaGrade) return;
      const gradeVal = parseFloat(newGpaGrade);
      const creditsVal = parseFloat(newGpaCredits);
      if (isNaN(gradeVal) || gradeVal < 0 || gradeVal > 100) {
        alert("Оценка должна быть числом от 0 до 100.");
        return;
      }
      const newItem = {
        id: Date.now().toString(),
        subject: newGpaSubject,
        grade: gradeVal,
        credits: creditsVal,
      };
      setGpaScores([...gpaScores, newItem]);
      setNewGpaSubject("");
      setNewGpaGrade("");
    };

    const handleDeleteGpaSubject = (id: string) => {
      setGpaScores(gpaScores.filter(item => item.id !== id));
    };

    return (
      <div className="space-y-4 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-3 px-1">
          <button type="button" onClick={() => setCurrentTab("home")} className="p-2 rounded-xl bg-white border border-isa-border text-isa-navy cursor-pointer">←</button>
          <div>
            <h2 className="text-base font-extrabold text-isa-navy">Калькулятор Академических Баллов</h2>
            <p className="text-[10px] text-isa-muted">Мгновенный подсчет средних результатов IELTS, SAT и GPA шкал</p>
          </div>
        </div>

        {/* Mock Registration CTA Card */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs font-sans">
          <div className="space-y-1">
            <span className="text-[9.5px] uppercase font-mono font-black text-[#10B981] tracking-wider block">🎓 Подготовка к экзаменам 2026</span>
            <h4 className="text-[12px] font-black text-[#1F2937] leading-tight">Проверьте знания на пробной симуляции!</h4>
            <p className="text-[10px] text-slate-500 leading-normal">Запишитесь на Mock IELTS, WIUT Math или SAT в интерактивном календаре.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setCurrentTab("exam-hub");
              setExamHubActiveTab("mock-calendar");
            }}
            className="whitespace-nowrap bg-emerald-600 hover:bg-[#10B981] text-white text-[11px] font-black py-2 px-3.5 rounded-xl transition shadow-xs cursor-pointer select-none shrink-0"
          >
            📅 В Календарь
          </button>
        </div>

        {/* calcType selector */}
        <div className="bg-isa-navy-soft rounded-xl p-1 grid grid-cols-4 gap-1">
          <button
            type="button"
            onClick={() => setCalcType("standard")}
            className={`py-2 text-[10px] sm:text-[11px] font-black rounded-lg transition text-center cursor-pointer ${calcType === "standard" ? "bg-white text-isa-navy shadow-xs" : "text-isa-navy-mid hover:text-isa-navy"}`}
          >
            🧮 Обычный
          </button>
          <button
            type="button"
            onClick={() => setCalcType("ielts")}
            className={`py-2 text-[10px] sm:text-[11px] font-black rounded-lg transition text-center cursor-pointer ${calcType === "ielts" ? "bg-white text-isa-navy shadow-xs" : "text-isa-navy-mid hover:text-isa-navy"}`}
          >
            🇬🇧 IELTS
          </button>
          <button
            type="button"
            onClick={() => setCalcType("sat")}
            className={`py-2 text-[10px] sm:text-[11px] font-black rounded-lg transition text-center cursor-pointer ${calcType === "sat" ? "bg-white text-isa-navy shadow-xs" : "text-isa-navy-mid hover:text-isa-navy"}`}
          >
            🇺🇸 SAT
          </button>
          <button
            type="button"
            onClick={() => setCalcType("gpa")}
            className={`py-2 text-[10px] sm:text-[11px] font-black rounded-lg transition text-center cursor-pointer ${calcType === "gpa" ? "bg-white text-isa-navy shadow-xs" : "text-isa-navy-mid hover:text-isa-navy"}`}
          >
            📊 GPA
          </button>
        </div>

        {/* CALCULATOR 0: STANDARD MATH */}
        {calcType === "standard" && (
          <div className="mx-auto max-w-sm w-full bg-slate-900 text-white rounded-[2.5rem] p-5 shadow-2xl border border-slate-800 space-y-4">
            {/* Display screen */}
            <div className="bg-slate-950 rounded-3xl p-5 text-right font-mono min-h-[110px] flex flex-col justify-end space-y-1 relative overflow-hidden shadow-inner border border-slate-900">
              <div className="text-slate-500 text-xs h-4 overflow-hidden text-ellipsis whitespace-nowrap tracking-wide">
                {calcEquation.replace(/\*/g, "×").replace(/\//g, "÷")}
              </div>
              <div className="text-4xl font-extrabold tracking-tight text-white truncate max-w-full">
                {calcInput}
              </div>
            </div>

            {/* Buttons grid */}
            <div className="grid grid-cols-4 gap-3">
              {/* Row 1 */}
              <button
                type="button"
                onClick={() => handleCalcPress("C")}
                className="h-14 rounded-2xl bg-slate-800 hover:bg-slate-705 text-rose-400 font-black text-sm transition active:scale-95 cursor-pointer flex items-center justify-center border border-slate-700/50"
              >
                C
              </button>
              <button
                type="button"
                onClick={() => handleCalcPress("⌫")}
                className="h-14 rounded-2xl bg-slate-800 hover:bg-slate-705 text-amber-400 font-extrabold text-sm transition active:scale-95 cursor-pointer flex items-center justify-center border border-slate-700/50"
              >
                ⌫
              </button>
              <button
                type="button"
                onClick={() => handleCalcPress("±")}
                className="h-14 rounded-2xl bg-slate-800 hover:bg-slate-705 text-sky-400 font-extrabold text-sm transition active:scale-95 cursor-pointer flex items-center justify-center border border-slate-700/50"
              >
                ±
              </button>
              <button
                type="button"
                onClick={() => handleCalcPress("/")}
                className="h-14 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xl transition active:scale-95 cursor-pointer flex items-center justify-center shadow-lg shadow-amber-500/10"
              >
                ÷
              </button>

              {/* Row 2 */}
              <button
                type="button"
                onClick={() => handleCalcPress("7")}
                className="h-14 rounded-2xl bg-slate-800/40 hover:bg-slate-750 text-slate-100 font-extrabold text-lg transition active:scale-95 cursor-pointer flex items-center justify-center border border-slate-800/80"
              >
                7
              </button>
              <button
                type="button"
                onClick={() => handleCalcPress("8")}
                className="h-14 rounded-2xl bg-slate-800/40 hover:bg-slate-750 text-slate-100 font-extrabold text-lg transition active:scale-95 cursor-pointer flex items-center justify-center border border-slate-800/80"
              >
                8
              </button>
              <button
                type="button"
                onClick={() => handleCalcPress("9")}
                className="h-14 rounded-2xl bg-slate-800/40 hover:bg-slate-750 text-slate-100 font-extrabold text-lg transition active:scale-95 cursor-pointer flex items-center justify-center border border-slate-800/80"
              >
                9
              </button>
              <button
                type="button"
                onClick={() => handleCalcPress("*")}
                className="h-14 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xl transition active:scale-95 cursor-pointer flex items-center justify-center shadow-lg shadow-amber-500/10"
              >
                ×
              </button>

              {/* Row 3 */}
              <button
                type="button"
                onClick={() => handleCalcPress("4")}
                className="h-14 rounded-2xl bg-slate-800/40 hover:bg-slate-750 text-slate-100 font-extrabold text-lg transition active:scale-95 cursor-pointer flex items-center justify-center border border-slate-800/80"
              >
                4
              </button>
              <button
                type="button"
                onClick={() => handleCalcPress("5")}
                className="h-14 rounded-2xl bg-slate-800/40 hover:bg-slate-750 text-slate-100 font-extrabold text-lg transition active:scale-95 cursor-pointer flex items-center justify-center border border-slate-800/80"
              >
                5
              </button>
              <button
                type="button"
                onClick={() => handleCalcPress("6")}
                className="h-14 rounded-2xl bg-slate-800/40 hover:bg-slate-750 text-slate-100 font-extrabold text-lg transition active:scale-95 cursor-pointer flex items-center justify-center border border-slate-800/80"
              >
                6
              </button>
              <button
                type="button"
                onClick={() => handleCalcPress("-")}
                className="h-14 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xl transition active:scale-95 cursor-pointer flex items-center justify-center shadow-lg shadow-amber-500/10"
              >
                -
              </button>

              {/* Row 4 */}
              <button
                type="button"
                onClick={() => handleCalcPress("1")}
                className="h-14 rounded-2xl bg-slate-800/40 hover:bg-slate-750 text-slate-100 font-extrabold text-lg transition active:scale-95 cursor-pointer flex items-center justify-center border border-slate-800/80"
              >
                1
              </button>
              <button
                type="button"
                onClick={() => handleCalcPress("2")}
                className="h-14 rounded-2xl bg-slate-800/40 hover:bg-slate-750 text-slate-100 font-extrabold text-lg transition active:scale-95 cursor-pointer flex items-center justify-center border border-slate-800/80"
              >
                2
              </button>
              <button
                type="button"
                onClick={() => handleCalcPress("3")}
                className="h-14 rounded-2xl bg-slate-800/40 hover:bg-slate-750 text-slate-100 font-extrabold text-lg transition active:scale-95 cursor-pointer flex items-center justify-center border border-slate-800/80"
              >
                3
              </button>
              <button
                type="button"
                onClick={() => handleCalcPress("+")}
                className="h-14 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xl transition active:scale-95 cursor-pointer flex items-center justify-center shadow-lg shadow-amber-500/10"
              >
                +
              </button>

              {/* Row 5 */}
              <button
                type="button"
                onClick={() => handleCalcPress("0")}
                className="h-14 rounded-2xl col-span-2 bg-slate-800/40 hover:bg-slate-750 text-slate-100 font-extrabold text-lg transition active:scale-95 cursor-pointer flex items-center justify-center border border-slate-800/80"
              >
                0
              </button>
              <button
                type="button"
                onClick={() => handleCalcPress(".")}
                className="h-14 rounded-2xl bg-slate-800/40 hover:bg-slate-750 text-slate-100 font-extrabold text-lg transition active:scale-95 cursor-pointer flex items-center justify-center border border-slate-800/80"
              >
                .
              </button>
              <button
                type="button"
                onClick={() => handleCalcPress("=")}
                className="h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-black text-xl transition active:scale-95 cursor-pointer flex items-center justify-center shadow-lg shadow-emerald-500/10"
              >
                =
              </button>
            </div>
          </div>
        )}

        {/* CALCULATOR 1: IELTS */}
        {calcType === "ielts" && (
          <div className="space-y-4">
            <div className="wellness-card p-4 flex flex-col items-center justify-center text-center space-y-2 bg-gradient-to-br from-indigo-50/20 via-white to-sky-50/20">
              <span className="text-[10px] tracking-widest font-mono font-black uppercase text-slate-400">Общий Балл IELTS</span>
              <div className="w-20 h-20 rounded-full flex items-center justify-center bg-[#1a73e8] shadow-sm text-white font-black text-2xl border-4 border-white/80 shrink-0">
                {ieltsOverall.toFixed(1)}
              </div>
              <p className="text-[12px] font-extrabold text-isa-navy">
                {ieltsOverall >= 8.0 ? "Professional User (Мастер С2)" : ieltsOverall >= 7.0 ? "Good User (Продвинутый C1)" : ieltsOverall >= 6.0 ? "Competent User (Уверенный B2)" : "B1 / Средний уровень"}
              </p>
              <p className="text-[11px] text-slate-500 leading-relaxed font-normal max-w-sm">
                {ieltsOverall >= 8.0 
                  ? "Потрясающий результат! Превосходный уровень владения, открывающий двери в Лигу Плюща и дающий максимальное преимущество на грант в любом вузе Узбекистана." 
                  : ieltsOverall >= 7.0 
                  ? "Отличный сильный балл. Гарантированно освобождает вас от языкового экзамена во всех ВУЗах и дает проходной билет на большинство зарубежных стипендий!" 
                  : ieltsOverall >= 6.0 
                  ? "Достойный балл B2. Проходной порог для Вестминстера (не менее 6.0 с Writing 5.5+) и Инха полностью превзойден!" 
                  : "Хорошая база, на которой можно строить дальнейший успех. Продолжайте тренироваться ежедневно!"}
              </p>
            </div>

            {/* Алгоритм расчета и округления */}
            <div className="bg-slate-50 border border-slate-150 rounded-2xl p-3.5 space-y-2 font-sans">
              <span className="text-[9px] uppercase font-mono font-black text-[#1a73e8] tracking-wider block">ℹ️ Официальный алгоритм округления IELTS:</span>
              <p className="text-[10.5px] text-slate-500 leading-relaxed">
                Средний арифметический балл ваших четырех секций составляет: <strong className="text-isa-navy font-black">{((ieltsL + ieltsR + ieltsW + ieltsS) / 4).toFixed(3)}</strong>. 
                По стандартам Cambridge ESOL, среднее число округляется до ближайшего полубалла:
              </p>
              <div className="grid grid-cols-3 gap-2 text-center pt-0.5">
                <div className="p-1 px-1.5 rounded-lg bg-white border border-slate-200 text-[8px] font-semibold text-slate-500">
                  Остаток <strong className="text-slate-700 font-extrabold">&lt; 0.25</strong><br />округление вниз к .0
                </div>
                <div className="p-1 px-1.5 rounded-lg bg-white border border-slate-200 text-[8px] font-semibold text-slate-500">
                  Остаток <strong className="text-slate-700 font-extrabold">0.25 – 0.74</strong><br />округление к .5
                </div>
                <div className="p-1 px-1.5 rounded-lg bg-white border border-slate-200 text-[8px] font-semibold text-slate-500">
                  Остаток <strong className="text-slate-700 font-extrabold">&gt;= 0.75</strong><br />округление вверх к .0
                </div>
              </div>
            </div>

            {/* Form Sliders */}
            <div className="wellness-card p-4 space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <span className="text-[10px] tracking-wider uppercase font-mono font-black text-slate-400">Оценки по секциям (Sectional Scores)</span>
                
                {/* Preset target buttons for quick setup */}
                <div className="flex flex-wrap items-center gap-1">
                  {[6.0, 6.5, 7.0, 7.5, 8.0, 8.5].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        setIeltsL(val);
                        setIeltsR(val);
                        setIeltsW(val - 0.5 >= 3.0 ? val - 0.5 : 3.0);
                        setIeltsS(val);
                      }}
                      className="bg-sky-50 hover:bg-sky-100 border border-sky-100 text-[#1a73e8] text-[8.5px] font-black px-1.5 py-0.5 rounded cursor-pointer transition select-none leading-tight"
                    >
                      Цель {val}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-3">
                {/* Listening */}
                <div className="space-y-1.5 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/55">
                  <div className="flex items-center justify-between text-[11px] font-bold text-isa-navy">
                    <span className="flex items-center gap-1">🎧 Listening</span>
                    <span className="text-sky-600 font-black text-xs bg-sky-50 px-2 py-0.5 rounded border border-sky-100">{ieltsL.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIeltsL(prev => Math.max(3.0, prev - 0.5))}
                      className="w-10 h-10 rounded-full bg-white border border-slate-200 active:bg-slate-100 shadow-sm flex items-center justify-center text-sm font-black text-slate-700 select-none cursor-pointer shrink-0"
                    >
                      －
                    </button>
                    <input
                      type="range"
                      min="3.0"
                      max="9.0"
                      step="0.5"
                      value={ieltsL}
                      onChange={(e) => setIeltsL(parseFloat(e.target.value))}
                      className="flex-grow accent-emerald-500 h-2 bg-slate-100 rounded-lg cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => setIeltsL(prev => Math.min(9.0, prev + 0.5))}
                      className="w-10 h-10 rounded-full bg-white border border-slate-200 active:bg-slate-100 shadow-sm flex items-center justify-center text-sm font-black text-slate-700 select-none cursor-pointer shrink-0"
                    >
                      ＋
                    </button>
                  </div>
                </div>

                {/* Reading */}
                <div className="space-y-1.5 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/55">
                  <div className="flex items-center justify-between text-[11px] font-bold text-isa-navy">
                    <span className="flex items-center gap-1">📖 Reading</span>
                    <span className="text-sky-600 font-black text-xs bg-sky-50 px-2 py-0.5 rounded border border-sky-100">{ieltsR.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIeltsR(prev => Math.max(3.0, prev - 0.5))}
                      className="w-10 h-10 rounded-full bg-white border border-slate-200 active:bg-slate-100 shadow-sm flex items-center justify-center text-sm font-black text-slate-700 select-none cursor-pointer shrink-0"
                    >
                      －
                    </button>
                    <input
                      type="range"
                      min="3.0"
                      max="9.0"
                      step="0.5"
                      value={ieltsR}
                      onChange={(e) => setIeltsR(parseFloat(e.target.value))}
                      className="flex-grow accent-emerald-500 h-2 bg-slate-100 rounded-lg cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => setIeltsR(prev => Math.min(9.0, prev + 0.5))}
                      className="w-10 h-10 rounded-full bg-white border border-slate-200 active:bg-slate-100 shadow-sm flex items-center justify-center text-sm font-black text-slate-700 select-none cursor-pointer shrink-0"
                    >
                      ＋
                    </button>
                  </div>
                </div>

                {/* Writing */}
                <div className="space-y-1.5 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/55">
                  <div className="flex items-center justify-between text-[11px] font-bold text-isa-navy">
                    <span className="flex items-center gap-1">✍️ Writing</span>
                    <span className="text-sky-600 font-black text-xs bg-sky-50 px-2 py-0.5 rounded border border-sky-100">{ieltsW.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIeltsW(prev => Math.max(3.0, prev - 0.5))}
                      className="w-10 h-10 rounded-full bg-white border border-slate-200 active:bg-slate-100 shadow-sm flex items-center justify-center text-sm font-black text-slate-700 select-none cursor-pointer shrink-0"
                    >
                      －
                    </button>
                    <input
                      type="range"
                      min="3.0"
                      max="9.0"
                      step="0.5"
                      value={ieltsW}
                      onChange={(e) => setIeltsW(parseFloat(e.target.value))}
                      className="flex-grow accent-emerald-500 h-2 bg-slate-100 rounded-lg cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => setIeltsW(prev => Math.min(9.0, prev + 0.5))}
                      className="w-10 h-10 rounded-full bg-white border border-slate-200 active:bg-slate-100 shadow-sm flex items-center justify-center text-sm font-black text-slate-700 select-none cursor-pointer shrink-0"
                    >
                      ＋
                    </button>
                  </div>
                </div>

                {/* Speaking */}
                <div className="space-y-1.5 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/55">
                  <div className="flex items-center justify-between text-[11px] font-bold text-isa-navy">
                    <span className="flex items-center gap-1">💬 Speaking</span>
                    <span className="text-sky-600 font-black text-xs bg-sky-50 px-2 py-0.5 rounded border border-sky-100">{ieltsS.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIeltsS(prev => Math.max(3.0, prev - 0.5))}
                      className="w-10 h-10 rounded-full bg-white border border-slate-200 active:bg-slate-100 shadow-sm flex items-center justify-center text-sm font-black text-slate-700 select-none cursor-pointer shrink-0"
                    >
                      －
                    </button>
                    <input
                      type="range"
                      min="3.0"
                      max="9.0"
                      step="0.5"
                      value={ieltsS}
                      onChange={(e) => setIeltsS(parseFloat(e.target.value))}
                      className="flex-grow accent-emerald-500 h-2 bg-slate-100 rounded-lg cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => setIeltsS(prev => Math.min(9.0, prev + 0.5))}
                      className="w-10 h-10 rounded-full bg-white border border-slate-200 active:bg-slate-100 shadow-sm flex items-center justify-center text-sm font-black text-slate-700 select-none cursor-pointer shrink-0"
                    >
                      ＋
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CALCULATOR 2: SAT */}
        {calcType === "sat" && (
          <div className="space-y-4">
            <div className="wellness-card p-4 flex flex-col items-center justify-center text-center space-y-2.5 bg-gradient-to-br from-amber-50/20 via-white to-red-50/20">
              <span className="text-[10px] tracking-widest font-mono font-black uppercase text-slate-400">Общий результат SAT (Reading + Math)</span>
              <div className="text-4xl font-black text-amber-550 tracking-tight">
                {satReading + satMath}
              </div>
              <p className="text-[10.5px] font-extrabold text-[#1B365D] block">
                Ориентировочный процентиль в мире: <span className="text-[#1a73e8] font-black">{satPercentile}</span>
              </p>
              <div className="flex flex-wrap items-[#1b365d] justify-center gap-2 pt-1.5">
                {satReading + satMath >= 1500 ? (
                  <span className="bg-amber-50 text-amber-700 text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border border-amber-200">Elite Ivy League 🎓</span>
                ) : null}
                {satReading + satMath >= 1400 ? (
                  <span className="bg-emerald-50 text-emerald-700 text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border border-emerald-150">Top US Tier ✔</span>
                ) : null}
                {satMath >= 600 ? (
                  <span className="bg-indigo-50 text-indigo-700 text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border border-indigo-150">Освобождает от Математики WIUT 📐</span>
                ) : null}
              </div>
            </div>

            {/* Быстрые шаблоны целей SAT */}
            <div className="bg-slate-50 border border-slate-150 rounded-2xl p-3.5 space-y-2">
              <span className="text-[9px] uppercase font-mono font-black text-amber-600 tracking-wider block">🎯 Быстрые шаблоны целей SAT:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => { setSatReading(740); setSatMath(780); }}
                  className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-[8.5px] font-black py-1 px-2 rounded-lg transition text-left"
                >
                  Ivy League (1520)
                </button>
                <button
                  type="button"
                  onClick={() => { setSatReading(680); setSatMath(740); }}
                  className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-[8.5px] font-black py-1 px-2 rounded-lg transition text-left"
                >
                  Top Tier (1420)
                </button>
                <button
                  type="button"
                  onClick={() => { setSatReading(590); setSatMath(660); }}
                  className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-[8.5px] font-black py-1 px-2 rounded-lg transition text-left"
                >
                  Westminster (1250)
                </button>
                <button
                  type="button"
                  onClick={() => { setSatReading(500); setSatMath(520); }}
                  className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-[8.5px] font-black py-1 px-2 rounded-lg transition text-left"
                >
                  Average (1020)
                </button>
              </div>
            </div>

            <div className="wellness-card p-4 space-y-4">
              <span className="text-[10px] tracking-wider uppercase font-mono font-black text-slate-400">Настройки секций SAT Digital</span>

              <div className="space-y-4">
                {/* Math */}
                <div className="space-y-1.5 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/55">
                  <div className="flex items-center justify-between text-[11px] font-bold text-isa-navy">
                    <span>Math (Секция математики) 📐</span>
                    <span className="text-amber-500 font-extrabold bg-amber-50 px-2 py-0.5 rounded border border-amber-100">{satMath} / 800</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSatMath(prev => Math.max(200, prev - 10))}
                      className="w-10 h-10 rounded-full bg-white border border-slate-200 active:bg-slate-100 shadow-sm flex items-center justify-center text-sm font-black text-slate-700 select-none cursor-pointer shrink-0"
                    >
                      －
                    </button>
                    <input
                      type="range"
                      min="200"
                      max="800"
                      step="10"
                      value={satMath}
                      onChange={(e) => setSatMath(parseInt(e.target.value))}
                      className="flex-grow accent-amber-500 h-2 bg-slate-100 rounded-lg cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => setSatMath(prev => Math.min(800, prev + 10))}
                      className="w-10 h-10 rounded-full bg-white border border-slate-200 active:bg-slate-100 shadow-sm flex items-center justify-center text-sm font-black text-slate-700 select-none cursor-pointer shrink-0"
                    >
                      ＋
                    </button>
                  </div>
                  <p className="text-[8.5px] text-isa-muted leading-tight font-medium mt-1">
                    {satMath >= 750 ? "🎖️ Исключительная математическая база!" : satMath >= 600 ? "✅ Достаточно для приема во все ВУЗы Узбекистана без экзамена." : "ℹ️ Математику можно подтянуть на курсах REAL SCIENCE."}
                  </p>
                </div>

                {/* Reading & Writing */}
                <div className="space-y-1.5 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/55">
                  <div className="flex items-center justify-between text-[11px] font-bold text-isa-navy">
                    <span>Reading & Writing (Английский) ✍️</span>
                    <span className="text-amber-500 font-extrabold bg-amber-50 px-2 py-0.5 rounded border border-amber-100">{satReading} / 800</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSatReading(prev => Math.max(200, prev - 10))}
                      className="w-10 h-10 rounded-full bg-white border border-slate-200 active:bg-slate-100 shadow-sm flex items-center justify-center text-sm font-black text-slate-700 select-none cursor-pointer shrink-0"
                    >
                      －
                    </button>
                    <input
                      type="range"
                      min="200"
                      max="800"
                      step="10"
                      value={satReading}
                      onChange={(e) => setSatReading(parseInt(e.target.value))}
                      className="flex-grow accent-amber-500 h-2 bg-slate-100 rounded-lg cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => setSatReading(prev => Math.min(800, prev + 10))}
                      className="w-10 h-10 rounded-full bg-white border border-slate-200 active:bg-slate-100 shadow-sm flex items-center justify-center text-sm font-black text-slate-700 select-none cursor-pointer shrink-0"
                    >
                      ＋
                    </button>
                  </div>
                  <p className="text-[8.5px] text-isa-muted leading-tight font-medium mt-1">
                    {satReading >= 700 ? "🎖️ Превосходное владение академическим английским!" : "ℹ️ Фокусируйтесь на изучении сложных грамматических структур."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CALCULATOR 3: GPA */}
        {calcType === "gpa" && (
          <div className="space-y-4">
            <div className="wellness-card p-4 grid grid-cols-2 gap-3 divide-x divide-slate-100 text-center bg-gradient-to-br from-violet-50/20 via-white to-pink-50/20">
              <div className="flex flex-col items-center justify-center space-y-1">
                <span className="text-[9px] font-mono font-black uppercase text-slate-400">Шкала 4.0 GPA</span>
                <span className="text-3xl font-black text-violet-600">{gpaResult.scale4}</span>
                <span className="text-[9px] text-[#4285F4] font-bold">Оценка по Вестминстер</span>
              </div>
              <div className="flex flex-col items-center justify-center space-y-1">
                <span className="text-[9px] font-mono font-black uppercase text-slate-400">Средний балл %</span>
                <span className="text-3xl font-black text-rose-500">{gpaResult.percentage}%</span>
                <span className="text-[9px] text-slate-400 font-bold">Всего кредитов: {gpaResult.totalCredits}</span>
              </div>
            </div>

            {/* Westminster Degree Classification */}
            <div className="bg-gradient-to-r from-violet-50 to-fuchsia-50 border border-violet-100 rounded-2xl p-3.5 space-y-1 font-sans">
              <span className="text-[9px] uppercase font-mono font-black text-violet-600 tracking-wider block">🎓 Классификация степени Британских ВУЗов (WIUT):</span>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-600 font-medium">Ваш итоговый диплом:</span>
                <span className="text-[11px] font-black text-violet-800 bg-violet-100/50 px-2.5 py-0.5 rounded-full select-none">
                  {(() => {
                    const pct = typeof gpaResult.percentage === "number" ? gpaResult.percentage : parseFloat(gpaResult.percentage);
                    if (isNaN(pct) || pct === 0) return "Нет оценок";
                    if (pct >= 70) return "First Class (1st) 🥇";
                    if (pct >= 60) return "Upper Second (2:1) 🥈";
                    if (pct >= 50) return "Lower Second (2:2) 🥉";
                    if (pct >= 40) return "Third Class (3rd) 🎓";
                    return "Refer / Fail ❌";
                  })()}
                </span>
              </div>
              <p className="text-[9px] text-slate-400 font-medium leading-relaxed">
                WIUT использует традиционную британскую шкалу классификации. First Class (1st) означает наивысшую степень отличия.
              </p>
            </div>

            {/* Add Subject form */}
            <form onSubmit={handleAddGpaSubject} className="wellness-card p-3.5 space-y-3">
              <span className="text-[10px] uppercase font-mono font-black text-slate-400 tracking-wider">+ Добавить предмет для GPA</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Название предмета"
                  value={newGpaSubject}
                  onChange={(e) => setNewGpaSubject(e.target.value)}
                  required
                  className="text-[11px] p-2 bg-white border border-isa-border rounded-xl font-medium"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Оценка 0-100"
                    min="0"
                    max="100"
                    value={newGpaGrade}
                    onChange={(e) => setNewGpaGrade(e.target.value)}
                    required
                    className="text-[11px] p-2 bg-white border border-isa-border rounded-xl font-medium"
                  />
                  <select
                    value={newGpaCredits}
                    onChange={(e) => setNewGpaCredits(e.target.value)}
                    className="text-[11px] p-2 bg-white border border-isa-border rounded-xl font-medium cursor-pointer"
                  >
                    <option value="1">1 кредит</option>
                    <option value="2">2 кредита</option>
                    <option value="3">3 кредита</option>
                    <option value="4">4 кредита</option>
                    <option value="5">5 кредитов</option>
                    <option value="6">6 кредитов</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-isa-navy text-white text-[10.5px] font-black rounded-lg cursor-pointer hover:opacity-95 transition"
              >
                + Рассчитать по предмету
              </button>
            </form>

            {/* Subjects List */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-mono font-black text-slate-400 tracking-wider block px-1">Текущие оценки в семестре</span>
              {gpaScores.length === 0 ? (
                <div className="text-center py-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <p className="text-[10px] text-isa-muted">Список предметов пуст.</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {gpaScores.map((item) => (
                    <div key={item.id} className="wellness-card p-3 flex items-center justify-between gap-3 text-left">
                      <div>
                        <h4 className="text-[11px] font-extrabold text-isa-navy leading-normal">{item.subject}</h4>
                        <span className="text-[9px] text-slate-400 font-mono">
                          Кредитов: {item.credits} • Оценка: {item.grade}% ({item.grade >= 90 ? "A" : item.grade >= 85 ? "B+" : item.grade >= 80 ? "B" : item.grade >= 75 ? "C+" : item.grade >= 70 ? "C" : item.grade >= 60 ? "D" : "F"})
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-[11px] font-black text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-150">
                          {item.grade >= 90 ? "4.0" : item.grade >= 80 ? "3.5" : item.grade >= 70 ? "3.0" : item.grade >= 60 ? "2.0" : "1.0"}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteGpaSubject(item.id)}
                          className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // AI WORKER TAB
  const renderAiWorkerTab = () => {
    const handleSend = async (textToSend?: string) => {
      const msg = (textToSend || aiWorkerInput).trim();
      if (!msg || isAiWorking) return;
      
      const newMessages = [...aiWorkerMessages, { role: "user" as const, text: msg }];
      setAiWorkerMessages(newMessages);
      setAiWorkerInput("");
      setIsAiWorking(true);
      
      if (isVoiceSpeaking) {
        stopVoiceSpeaking();
      }

      try {
        const res = await fetch("/api/ai/worker", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: newMessages.map(m => ({ role: m.role, text: m.text }))
          })
        });
        const data = await res.json();
        const reply = data.content?.map((c: any) => c.text || "").join("") || "Ошибка ответа";
        setAiWorkerMessages([...newMessages, { role: "assistant", text: reply }]);
        
        if (autoSpeakResponse) {
          startVoiceSpeaking(reply);
        }
      } catch {
        setAiWorkerMessages([...newMessages, { role: "assistant", text: "Ошибка соединения. Попробуйте снова." }]);
      }
      setIsAiWorking(false);
      setTimeout(() => aiWorkerBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    };

    const toggleMic = () => {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Голосовой ввод не поддерживается вашим браузером. Пожалуйста, откройте приложение в новой вкладке Chrome или Safari.");
        return;
      }

      if (isAiVoiceListening) {
        if ((window as any).aiSpeechRecInstance) {
          (window as any).aiSpeechRecInstance.stop();
        }
        setIsAiVoiceListening(false);
        return;
      }

      if (isVoiceSpeaking) {
        stopVoiceSpeaking();
      }

      const recognition = new SpeechRecognition();
      recognition.lang = "ru-RU";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsAiVoiceListening(true);
      };

      recognition.onend = () => {
        setIsAiVoiceListening(false);
      };

      recognition.onerror = (e: any) => {
        console.error("Mic error:", e);
        setIsAiVoiceListening(false);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript || "";
        if (transcript.trim()) {
          handleSend(transcript);
        }
      };

      (window as any).aiSpeechRecInstance = recognition;
      recognition.start();
    };

    // Store a reference to the inner toggle function so our bottom FAB can invoke it from outside
    toggleMicRef.current = toggleMic;

    return (
      <div className="flex flex-col animate-fade-in" style={{ height: "calc(100vh - 180px)" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-1 pb-3 border-b border-slate-100 shrink-0 mb-3">
          <div className="flex items-center gap-2.5">
            <button 
              type="button" 
              onClick={() => {
                stopVoiceSpeaking();
                setIsAiVoiceListening(false);
                if ((window as any).aiSpeechRecInstance) {
                   try { (window as any).aiSpeechRecInstance.stop(); } catch(e){}
                }
                setCurrentTab("home");
              }} 
              className="p-2 rounded-xl bg-white border border-slate-200 text-isa-navy cursor-pointer hover:bg-slate-50 transition"
            >
              ←
            </button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-linear-to-tr from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center text-lg text-white shadow-xs">
                🤖
              </div>
              <div>
                <h2 className="text-xs font-black text-isa-navy uppercase tracking-tight">Rider AI Ассистент</h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-bold text-slate-400 font-mono">ONLINE</span>
                </div>
              </div>
            </div>
          </div>

          {/* Voice Auto-Speak Control */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setAutoSpeakResponse(!autoSpeakResponse)}
              className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase font-mono tracking-wider transition flex items-center gap-1 ${
                autoSpeakResponse 
                  ? "bg-violet-600 text-white shadow-xs" 
                  : "bg-white text-slate-500 hover:text-slate-700"
              }`}
            >
              {autoSpeakResponse ? (
                <>
                  <Volume2 className="w-3.5 h-3.5" /> Озвучка: ON
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5" /> Озвучка: OFF
                </>
              )}
            </button>
            
            {isVoiceSpeaking && (
              <button
                type="button"
                onClick={stopVoiceSpeaking}
                className="p-1 px-1.5 rounded-lg bg-rose-500 text-white text-[8px] font-bold animate-pulse hover:bg-rose-600 transition"
                title="Остановить речь"
              >
                ⏹ Стоп
              </button>
            )}
          </div>
        </div>

        {/* Messages list */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 pb-2">
          {aiWorkerMessages.length === 0 && (
            <div className="wellness-card p-6 text-center space-y-4 max-w-sm mx-auto my-6">
              <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center text-4xl mx-auto shadow-inner animate-bounce">
                🤖
              </div>
              <div className="space-y-1">
                <p className="text-sm font-black text-isa-navy">Я твой личный Rider AI</p>
                <p className="text-[11px] text-slate-550 leading-relaxed font-semibold">
                  Ты можешь общаться со мной голосом! Просто нажми на кнопку микрофона внизу, заговори, и я сам отвечу тебе голосом.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-1.5 pt-2">
                {[
                  "🤖 Будем готовиться к IELTS?",
                  "🧠 Какая формула у теоремы Пифагора?",
                  "⚡ Придумай тему для эссе по истории",
                  "🌍 Какое расстояние от Земли до Луны?"
                ].map(q => (
                  <button 
                    key={q} 
                    type="button" 
                    onClick={() => { setAiWorkerInput(q.replace(/[🤖🧠⚡🌍]\s*/, "")); }}
                    className="p-3 rounded-2xl border border-slate-200 bg-white text-[10px] font-black text-slate-700 text-left cursor-pointer hover:border-violet-500 hover:bg-violet-50/20 active:scale-98 transition duration-200"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {aiWorkerMessages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] p-3.5 rounded-2xl text-[12.5px] leading-relaxed shadow-2xs relative group transition-all ${
                m.role === "user"
                  ? "bg-slate-900 text-white rounded-br-none font-medium border border-slate-800"
                  : "bg-white border border-slate-200/80 text-slate-800 rounded-bl-none"
              }`}>
                {m.role === "assistant" && (
                  <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-100">
                    <span className="text-[9px] font-black text-violet-600 uppercase font-mono tracking-wider">RIDER AI ASSISTANT</span>
                    <button
                      type="button"
                      onClick={() => startVoiceSpeaking(m.text)}
                      className="p-1 rounded-md bg-slate-50 text-slate-500 hover:text-violet-600 hover:bg-violet-50 transition cursor-pointer"
                      title="Прослушать сообщение"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                <pre className="whitespace-pre-wrap font-sans font-medium text-slate-800 break-words leading-relaxed text-left">
                  {m.text}
                </pre>
              </div>
            </div>
          ))}

          {isAiWorking && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200/85 px-4.5 py-3 rounded-2xl rounded-bl-none flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                </span>
                <span className="text-[11px] font-bold text-violet-600 animate-pulse">Генерирую ответ...</span>
              </div>
            </div>
          )}
          
          <div ref={aiWorkerBottomRef} />
        </div>

        {/* Input & Record Panel */}
        <div className="shrink-0 pt-2 border-t border-slate-100">
          {/* Active Voice Waveform Indicator */}
          {isAiVoiceListening && (
            <div className="mb-3 p-3 bg-violet-50 border border-violet-100 rounded-2xl flex flex-col items-center justify-center space-y-2 animate-pulse">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span className="text-[10px] font-black uppercase text-violet-700 tracking-wider">Говорите, я вас слушаю...</span>
              </div>
              
              {/* Voice pulse indicator ripples */}
              <div className="flex items-center gap-1 h-5">
                <div className="w-1 bg-violet-505 rounded-full h-2 animate-[bounce_0.6s_infinite_100ms]" />
                <div className="w-1 bg-violet-600 rounded-full h-4 animate-[bounce_0.6s_infinite_200ms]" />
                <div className="w-1 bg-violet-505 rounded-full h-3 animate-[bounce_0.6s_infinite_300ms]" />
                <div className="w-1 bg-violet-600 rounded-full h-5 animate-[bounce_0.6s_infinite_400ms]" />
                <div className="w-1 bg-violet-505 rounded-full h-2 animate-[bounce_0.6s_infinite_500ms]" />
              </div>
            </div>
          )}

          <div className="wellness-card p-2 flex gap-2 items-center border border-slate-200/80 bg-white shadow-xs rounded-2xl">
            {/* Microphone Button */}
            <button
              type="button"
              onClick={toggleMic}
              className={`w-11 h-11 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 relative ${
                isAiVoiceListening 
                  ? "bg-rose-500 hover:bg-rose-600 text-white shadow-md animate-pulse scale-105" 
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
              title={isAiVoiceListening ? "Остановить запись" : "Говорить в микрофон"}
            >
              {isAiVoiceListening ? (
                <MicOff className="w-5 h-5 text-white" />
              ) : (
                <Mic className="w-5 h-5 text-slate-600" />
              )}
            </button>

            {/* Input Text Area */}
            <textarea
              value={aiWorkerInput}
              onChange={(e) => setAiWorkerInput(e.target.value)}
              onKeyDown={(e) => { 
                if (e.key === "Enter" && !e.shiftKey) { 
                  e.preventDefault(); 
                  handleSend(); 
                } 
              }}
              placeholder={isAiVoiceListening ? "Слушаю ваш голос..." : "Напишите или надиктуйте вопрос..."}
              rows={1}
              disabled={isAiVoiceListening}
              className="flex-1 text-[12.5px] leading-relaxed p-2.5 bg-transparent resize-none border-0 outline-none text-slate-800 disabled:opacity-50"
            />

            {/* Send Button */}
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!aiWorkerInput.trim() || isAiWorking || isAiVoiceListening}
              className="w-11 h-11 bg-slate-900 border border-slate-850 hover:bg-slate-800 rounded-xl flex items-center justify-center text-white font-bold cursor-pointer disabled:opacity-45 shrink-0 transition"
            >
              🚀
            </button>
          </div>
        </div>
      </div>
    );
  };

    // Switch dispatcher for tabs content
  const tabBodyContent = () => {
    switch (currentTab) {
      case "home":
        return renderHomeTab();
      case "lessons":
        return renderLessonsTab();
      case "search":
        return renderSearchTab();
      case "video":
        return renderVideoTab();
      case "profile":
        return renderProfileTab();
      case "market":
        return renderMarketTab();
      case "translator":
        return renderTranslatorTab();
      case "universities":
        return renderUniversitiesTab();
      case "ai-worker":
        return renderAiWorkerTab();
      case "exam-hub":
        return renderExamHubTab();
      case "calculator":
        return renderCalculatorTab();
      default:
        return renderHomeTab();
    }
  };

  // ================= MAIN RENDER =================

  const navTabs = [
    { id: "home" as const, label: t("nav_home"), icon: Home },
    { id: "lessons" as const, label: t("nav_lessons"), icon: BookOpen },
    { id: "ai-worker" as const, label: t("nav_ai"), icon: Mic, isFab: true },
    { id: "video" as const, label: t("nav_video"), icon: Video },
    { id: "profile" as const, label: t("nav_profile"), icon: User },
  ];

  return (
    <div className="pb-28 min-h-[520px]">
      {renderCampusProfileHeader()}
      {renderLeaderboardModal()}
      <div className="min-h-[480px]">{tabBodyContent()}</div>

      {/* Bottom nav — wellness app style with center FAB */}
      <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
        <div className="max-w-lg mx-auto px-4 pb-4 pointer-events-auto">
          <div className="bg-white rounded-[28px] border border-isa-border py-2 px-2 flex justify-around items-end isa-shadow">
            {navTabs.map((tab) => {
              if (tab.isFab) {
                const active = currentTab === "ai-worker";
                return (
                  <button
                    key="ai-worker-fab"
                    type="button"
                    onClick={() => {
                      if (currentTab !== "ai-worker") {
                        setCurrentTab("ai-worker");
                        setTimeout(() => {
                          if (toggleMicRef.current) {
                            try { toggleMicRef.current(); } catch (e) {}
                          }
                        }, 300);
                      } else {
                        if (toggleMicRef.current) {
                          try { toggleMicRef.current(); } catch (e) {}
                        }
                      }
                    }}
                    className={`isa-nav-fab cursor-pointer transition-all ${active ? "scale-115 ring-4 ring-violet-500/20" : "hover:scale-105"}`}
                    style={{
                      background: "linear-gradient(135deg, #0071e3 0%, #1d1d1f 100%)",
                      boxShadow: "0 8px 24px rgba(0, 113, 227, 0.3)",
                    }}
                    title="Rider Mic"
                  >
                    <Mic className="w-5.5 h-5.5 text-white" />
                  </button>
                );
              }
              const active = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setCurrentTab(tab.id);
                    if (tab.id !== "lessons") setActiveCourse(null);
                  }}
                  className={`flex flex-col items-center py-2 px-3 rounded-2xl transition cursor-pointer min-w-[56px] ${
                    active ? "isa-nav-item--active text-isa-navy font-bold" : "text-isa-muted"
                  }`}
                >
                  <tab.icon className={`w-5 h-5 ${active ? "stroke-[2.5px]" : ""}`} />
                  <span className={`text-[10px] font-semibold mt-0.5 ${active ? "font-bold" : ""}`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dynamic SSO overlay modal panel */}
      <AnimatePresence>
        {ssoModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none"
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className="bg-white rounded-3xl p-6 max-w-xs w-full text-center space-y-4 shadow-2xl relative"
            >
              <div className="flex justify-center items-center gap-1">
                <span className="text-[#4285F4] font-extrabold">G</span>
                <span className="text-[#EA4335] font-extrabold">o</span>
                <span className="text-[#FBBC05] font-extrabold">o</span>
                <span className="text-[#4285F4] font-extrabold">g</span>
                <span className="text-[#34A853] font-extrabold">l</span>
                <span className="text-[#EA4335] font-extrabold">e</span>
                <span className="text-slate-400 font-semibold text-xs ml-1 font-mono">Sign In</span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider leading-none">Выберите способ входа:</span>
                <p className="text-[9.5px] text-slate-500 pb-2">Авторизуйтесь моментально, выбрав аккаунт ученика в системе:</p>
              </div>

              <div className="relative flex py-1 items-center select-none">
                <div className="flex-grow border-t border-slate-100"></div>
                <span className="flex-shrink mx-2 text-slate-400 text-[10px] font-black uppercase tracking-widest leading-none">ТЕСТОВЫЙ АККАУНТ</span>
                <div className="flex-grow border-t border-slate-100"></div>
              </div>

              <div className="space-y-2">
                {[
                  { name: "Михаил Студент", email: "student.mikhail@gmail.com", avatar: "", streak: 5, tier: "Google Scholar Premium" },
                  { name: "Дарья Отличница", email: "dasha.expert@gmail.com", avatar: "", streak: 7, tier: "Google Scholar Premium" },
                  { name: "Владислав Гость", email: "guest.vlad.99@gmail.com", avatar: "", streak: 1, tier: "Бесплатный Ученик" }
                ].map((prof, pIdx) => (
                  <button
                    key={pIdx}
                    onClick={() => {
                      const parts = prof.name.split(" ");
                      setProfileFirstName(parts[0] || "");
                      setProfileLastName(parts[1] || "");
                      setUserProfile({
                        name: prof.name,
                        email: prof.email,
                        tier: prof.tier,
                        streak: prof.streak,
                        avatar: prof.avatar,
                        badgeCount: prof.streak
                      });
                      setSsoModalOpen(false);
                    }}
                    className="w-full text-left p-2.5 rounded-2xl bg-slate-50 hover:bg-[#E8F0FE] border border-slate-200 hover:border-[#4285F4] transition flex items-center gap-2.5 cursor-pointer font-sans"
                  >
                    <span className="text-xl bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center">{prof.avatar}</span>
                    <div className="space-y-0.1 overflow-hidden font-medium">
                      <span className="text-[11px] font-black text-slate-900 block leading-none">{prof.name}</span>
                      <span className="text-[8.5px] text-slate-400 block truncate">{prof.email}</span>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setSsoModalOpen(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 rounded-xl text-[10px] font-bold cursor-pointer transition select-none"
              >
                Отмена
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>



      {/* FLOATING COLLAPSED / EXPANDED AI TUTOR COMPANION PANEL (KAPUSTA AI) */}
      <div className="fixed bottom-5 right-5 z-40">
        <AnimatePresence>
          {chatOpen ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="w-[310px] md:w-[360px] h-[450px] bg-white rounded-2xl border border-slate-250 shadow-2xl overflow-hidden flex flex-col justify-between"
            >
              {/* Chat Panel Header - Google Accent with green dots */}
              <div className="bg-isa-navy p-3 text-isa-gold-light flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/25 rounded-full flex items-center justify-center text-sm">
                    🎙️
                  </div>
                  <div>
                    <h3 className="text-xs font-bold leading-none">Райдер AI</h3>
                    <span className="text-[10px] text-white/90 block mt-0.5">● Эксперт</span>
                  </div>
                </div>
                <button 
                  onClick={() => setChatOpen(false)}
                  className="p-1 rounded-full bg-white/20 hover:bg-white/30 cursor-pointer text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chat Messages flow scrolling viewport */}
              <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50">
                {chatMessages.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-[10.5px] space-y-1 select-none">
                    <span>Задайте вопрос Райдеру ИИ — получите только важнейшие факты без лишних слов!</span>
                  </div>
                )}

                {chatMessages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] rounded-xl p-2.5 text-[11px] leading-relaxed space-y-1 ${
                      msg.role === 'user'
                        ? 'bg-[#4285F4] text-white shadow-sm rounded-br-none'
                        : 'bg-white text-slate-800 border border-slate-200 shadow-sm rounded-bl-none'
                    }`}>
                      <p className="whitespace-pre-line break-words">{msg.content}</p>
                      <span className={`block text-[7.5px] font-mono text-right leading-none ${msg.role === 'user' ? 'text-blue-105' : 'text-slate-400'}`}>
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-205 rounded-xl p-2.5 text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                      <span className="animate-bounce">🤖</span>
                      <span>Выделение главного...</span>
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat inputs submission widget */}
              <div className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2">
                <input
                  ref={chatInputRef}
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendChatMessage();
                  }}
                  placeholder="Задать вопрос ИИ Райдеру (Rider AI)..."
                  className="flex-grow text-xs px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl focus:border-[#4285F4] focus:outline-none focus:ring-1 focus:ring-[#4285F4]"
                />
                
                <button
                  onClick={handleSendChatMessage}
                  disabled={!chatInput.trim() || isTyping}
                  className="p-2 bg-[#4285F4] hover:bg-blue-600 text-white rounded-xl shadow cursor-pointer disabled:bg-slate-300 transition shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.button
              key="collapsed-bubble"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setChatOpen(true);
                if (chatMessages.length === 0) {
                  setChatMessages([
                    {
                      id: "greet-" + Date.now(),
                      role: "model",
                      content: `Привет! Я твой Код-репетитор ИИ Райдер (Rider AI). Я готов помочь разобраться с программированием, формулами или теорией. Задай мне любой вопрос — я отвечу лаконично и строго по сути. 🎙️`,
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                  ]);
                }
                setTimeout(() => {
                  chatInputRef.current?.focus();
                }, 150);
              }}
              className="bg-isa-navy hover:bg-isa-navy-mid text-isa-gold-light p-3.5 rounded-full shadow-lg flex items-center gap-1.5 cursor-pointer border-2 border-isa-gold/50 font-sans select-none relative"
            >
              <span className="text-xl">🎙️</span>
              <span className="text-[11px] font-bold">Райдер AI</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
