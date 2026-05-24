import React, { useState, useRef } from "react";
import { Video, Upload, Link2, Trash2, Image as ImageIcon, CheckCircle, Plus } from "lucide-react";
import { PlatformVideo, PromoEvent, SiteContent } from "../types";

const MAX_FILE_MB = 25;

interface AdminMediaPanelProps {
  activeSection: "videos" | "events";
  siteContent: SiteContent;
  onRefreshSiteContent: () => void;
}

export default function AdminMediaPanel({ activeSection, siteContent, onRefreshSiteContent }: AdminMediaPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const eventImgInputRef = useRef<HTMLInputElement>(null);

  // Video form state
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDesc, setVideoDesc] = useState("");
  const [videoFileData, setVideoFileData] = useState<string | null>(null);
  const [videoFileName, setVideoFileName] = useState("");
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoSuccess, setVideoSuccess] = useState(false);

  // New Event form state
  const [newEventImage, setNewEventImage] = useState<string | null>(null);
  const [newEventFileName, setNewEventFileName] = useState("");
  const [newEventDesc, setNewEventDesc] = useState("");
  const [uploadingEvent, setUploadingEvent] = useState(false);
  const [eventError, setEventError] = useState<string | null>(null);
  const [eventSuccess, setEventSuccess] = useState(false);

  // Handle video files
  const handleVideoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setVideoError(`Файл слишком большой. Максимум ${MAX_FILE_MB} МБ.`);
      return;
    }
    setVideoError(null);
    setVideoFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setVideoFileData(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAddVideo = async () => {
    setVideoError(null);
    setVideoSuccess(false);
    if (!videoUrl.trim() && !videoFileData) { setVideoError("Укажите ссылку или загрузите файл"); return; }
    if (!videoTitle.trim()) { setVideoError("Укажите название видео"); return; }
    setUploadingVideo(true);
    try {
      const resp = await fetch("/api/site/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: videoTitle.trim(),
          description: videoDesc.trim(),
          url: videoUrl.trim(),
          fileData: videoFileData
        }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || "Ошибка сервера");
      }
      setVideoUrl("");
      setVideoTitle("");
      setVideoDesc("");
      setVideoFileData(null);
      setVideoFileName("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setVideoSuccess(true);
      onRefreshSiteContent();
      setTimeout(() => setVideoSuccess(false), 3000);
    } catch (err: any) {
      setVideoError(err.message);
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (!confirm("Удалить видео урок?")) return;
    try {
      const resp = await fetch(`/api/site/videos/${id}`, { method: "DELETE" });
      if (!resp.ok) throw new Error("Ошибка сервера при удалении");
      onRefreshSiteContent();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Handle Event cover image files
  const handleEventImgFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEventError(null);
    setNewEventFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setNewEventImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCreateEvent = async () => {
    setEventError(null);
    setEventSuccess(false);
    if (!newEventImage) { setEventError("Пожалуйста, загрузите изображение для события"); return; }
    if (!newEventDesc.trim()) { setEventError("Введите описание события"); return; }
    setUploadingEvent(true);
    try {
      const resp = await fetch("/api/site/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: newEventImage,
          description: newEventDesc.trim(),
        }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || "Ошибка сервера при добавлении события");
      }
      setNewEventDesc("");
      setNewEventImage(null);
      setNewEventFileName("");
      if (eventImgInputRef.current) eventImgInputRef.current.value = "";
      setEventSuccess(true);
      onRefreshSiteContent();
      setTimeout(() => setEventSuccess(false), 3000);
    } catch (err: any) {
      setEventError(err.message);
    } finally {
      setUploadingEvent(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Удалить это событие с главной страницы?")) return;
    try {
      const resp = await fetch(`/api/site/events/${id}`, { method: "DELETE" });
      if (!resp.ok) throw new Error("Ошибка при удалении события");
      onRefreshSiteContent();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (activeSection === "videos") {
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-isa-navy flex items-center gap-2">
          <Video className="w-5 h-5 text-isa-gold" /> Видеоуроки
        </h2>

        <div className="isa-card p-5 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-isa-navy">Ссылка YouTube или URL видео</label>
            <div className="flex gap-2">
              <Link2 className="w-4 h-4 text-isa-muted mt-2.5 shrink-0" />
              <input
                value={videoUrl}
                onChange={e => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="flex-1 text-xs p-3 border border-isa-border rounded-xl bg-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-isa-navy">Загрузить файл (MP4/WebM, до {MAX_FILE_MB} МБ)</label>
            <label className="flex items-center justify-center gap-2 border-2 border-dashed border-isa-border rounded-xl p-6 cursor-pointer hover:border-isa-gold hover:bg-isa-gold-pale/30 transition">
              <Upload className="w-5 h-5 text-isa-muted" />
              <span className="text-xs text-isa-muted">{videoFileName ? `✓ ${videoFileName}` : "Выбрать файл"}</span>
              <input ref={fileInputRef} type="file" accept="video/mp4,video/webm,video/*" className="hidden" onChange={handleVideoFile} />
            </label>
          </div>

          <input
            value={videoTitle}
            onChange={e => setVideoTitle(e.target.value)}
            placeholder="Название *"
            className="w-full text-xs p-3 border border-isa-border rounded-xl"
          />
          <textarea
            value={videoDesc}
            onChange={e => setVideoDesc(e.target.value)}
            placeholder="Описание"
            rows={2}
            className="w-full text-xs p-3 border border-isa-border rounded-xl"
          />

          {videoError && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">{videoError}</p>}
          {videoSuccess && (
            <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-2 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> Видео опубликовано!
            </p>
          )}

          <button
            type="button"
            onClick={handleAddVideo}
            disabled={uploadingVideo}
            className="w-full isa-btn-primary py-3 text-xs cursor-pointer disabled:opacity-40"
          >
            {uploadingVideo ? "Публикация…" : "Опубликовать видео"}
          </button>
        </div>

        <div className="grid gap-3">
          {siteContent.videos.length === 0 && <p className="text-sm text-isa-muted text-center py-8">Видео пока нет</p>}
          {siteContent.videos.map((v: PlatformVideo) => (
            <div key={v.id} className="flex justify-between items-center isa-card p-4">
              <div className="min-w-0">
                <p className="font-bold text-sm text-isa-navy truncate">{v.title}</p>
                <p className="text-[10px] text-isa-muted">
                  {v.sourceType === "youtube" ? `YouTube · ${v.youtubeId}` : v.sourceType === "upload" ? "Загружен со смартфона" : "Внешний URL"}
                  {v.description ? ` · ${v.description.slice(0, 40)}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteVideo(v.id)}
                className="text-red-500 p-2 hover:bg-red-50 rounded-lg cursor-pointer shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Events section
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-isa-navy flex items-center gap-2">
        <ImageIcon className="w-5 h-5 text-isa-gold" /> События на главной
      </h2>

      {/* Direct Add Event Form */}
      <div className="isa-card p-5 space-y-4">
        <h3 className="text-xs font-extrabold text-isa-navy uppercase tracking-wider">Опубликовать новое событие</h3>

        <div className="space-y-1">
          <label className="text-xs font-bold text-isa-navy">Фото события (Картинка)</label>
          <label className="flex items-center justify-center gap-2 border-2 border-dashed border-isa-border rounded-xl p-6 cursor-pointer hover:border-isa-gold hover:bg-isa-gold-pale/30 transition">
            <Upload className="w-5 h-5 text-isa-muted" />
            <span className="text-xs text-isa-muted">{newEventFileName ? `✓ ${newEventFileName}` : "Загрузить фото"}</span>
            <input ref={eventImgInputRef} type="file" accept="image/*" className="hidden" onChange={handleEventImgFile} />
          </label>
        </div>

        {newEventImage && (
          <div className="w-full aspect-video rounded-xl overflow-hidden bg-isa-cream border border-isa-border max-w-sm">
            <img src={newEventImage} alt="Превью" className="w-full h-full object-cover" />
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-bold text-isa-navy">Короткое описание события</label>
          <textarea
            value={newEventDesc}
            onChange={e => setNewEventDesc(e.target.value)}
            placeholder="Например: 'Встреча с выпускниками Колумбийского университета — 25 мая в актовом зале.'"
            rows={3}
            className="w-full text-xs p-3 border border-isa-border rounded-xl resize-none"
          />
        </div>

        {eventError && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">{eventError}</p>}
        {eventSuccess && (
          <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-2 flex items-center gap-1">
            <CheckCircle className="w-4 h-4" /> Событие добавлено на главную в реальном времени!
          </p>
        )}

        <button
          type="button"
          onClick={handleCreateEvent}
          disabled={uploadingEvent}
          className="w-full isa-btn-primary py-3 text-xs cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {uploadingEvent ? "Публикация…" : "Опубликовать событие"}
        </button>
      </div>

      {/* Grid listing events */}
      <div className="space-y-3">
        <h3 className="text-xs font-extrabold text-isa-navy uppercase tracking-wider">Текущие события на главной</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {siteContent.events.length === 0 && (
            <div className="col-span-2 text-center py-8 text-isa-muted text-xs">
              Событий пока нет. Создайте первое событие выше!
            </div>
          )}
          {siteContent.events.map((ev) => (
            <div key={ev.id} className="isa-card overflow-hidden space-y-3 p-3 flex flex-col justify-between">
              <div>
                <div className="w-full aspect-video rounded-xl overflow-hidden bg-isa-cream border border-isa-border relative">
                  {ev.imageUrl ? (
                    <img src={ev.imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-isa-muted text-xs">Нет фото</div>
                  )}
                </div>
                <p className="text-xs text-slate-700 leading-snug mt-2.5 whitespace-pre-wrap">{ev.description}</p>
              </div>

              <button
                type="button"
                onClick={() => handleDeleteEvent(ev.id)}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold text-red-500 border border-red-200 rounded-xl hover:bg-red-50 cursor-pointer transition mt-2"
              >
                <Trash2 className="w-3.5 h-3.5" /> Удалить событие
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
