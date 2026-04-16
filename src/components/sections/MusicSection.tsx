import { useEffect, useState } from "react";

const TRACKS = [
  { title: "Праздничный вечер", artist: "Оркестр радости", duration: "3:42", emoji: "🎺" },
  { title: "Танцуй со мной", artist: "Блестящие ноты", duration: "4:10", emoji: "💃" },
  { title: "Фейерверк в душе", artist: "Звёздный квартет", duration: "3:28", emoji: "✨" },
];

export default function MusicSection() {
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(27);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setProgress(p => p >= 100 ? 0 : p + 0.4), 300);
    return () => clearInterval(id);
  }, [playing]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="space-y-3 mb-10">
        {TRACKS.map((track, i) => (
          <div
            key={i}
            onClick={() => { setCurrent(i); setProgress(0); }}
            className="flex items-center gap-5 p-5 rounded-2xl cursor-pointer transition-all duration-300"
            style={{
              background: current === i
                ? "linear-gradient(135deg, rgba(168,85,247,0.2), rgba(236,72,153,0.15))"
                : "rgba(255,255,255,0.04)",
              border: `1px solid ${current === i ? "rgba(168,85,247,0.4)" : "rgba(255,255,255,0.06)"}`,
              transform: current === i ? "scale(1.02)" : "scale(1)",
            }}
          >
            <div
              className="text-3xl w-14 h-14 flex items-center justify-center rounded-xl flex-shrink-0"
              style={{
                background: current === i
                  ? "linear-gradient(135deg, #a855f7, #ec4899)"
                  : "rgba(255,255,255,0.06)",
              }}
            >
              {track.emoji}
            </div>

            {current === i && (
              <div className={`flex items-end gap-0.5 h-8 flex-shrink-0 ${!playing ? "music-bars-paused" : ""}`}>
                {[...Array(7)].map((_, j) => (
                  <div
                    key={j}
                    className="music-bar w-1.5 rounded-full"
                    style={{ background: "linear-gradient(180deg, #a855f7, #ec4899)", minHeight: 8 }}
                  />
                ))}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="font-montserrat font-semibold text-white truncate">{track.title}</div>
              <div className="font-montserrat text-sm text-white/50 mt-0.5">{track.artist}</div>
            </div>
            <div className="font-montserrat text-sm text-white/30 flex-shrink-0">{track.duration}</div>
          </div>
        ))}
      </div>

      <div
        className="p-6 rounded-2xl"
        style={{
          background: "linear-gradient(135deg, rgba(168,85,247,0.1), rgba(236,72,153,0.08))",
          border: "1px solid rgba(168,85,247,0.2)",
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="font-montserrat text-xs text-white/40">
            {Math.floor(progress / 100 * 222 / 60).toString()}:{Math.floor(progress / 100 * 222 % 60).toString().padStart(2, "0")}
          </span>
          <span className="font-montserrat text-xs text-white/40">{TRACKS[current].duration}</span>
        </div>

        <div
          className="w-full h-1.5 rounded-full mb-6 cursor-pointer relative"
          style={{ background: "rgba(255,255,255,0.1)" }}
          onClick={e => {
            const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
            setProgress(((e.clientX - rect.left) / rect.width) * 100);
          }}
        >
          <div
            className="h-full rounded-full relative transition-all"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #a855f7, #ec4899)",
            }}
          >
            <div
              className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white"
              style={{ boxShadow: "0 0 8px rgba(168,85,247,0.8)" }}
            />
          </div>
        </div>

        <div className="flex items-center justify-center gap-6">
          <button
            onClick={() => setCurrent(c => (c - 1 + TRACKS.length) % TRACKS.length)}
            className="text-white/40 hover:text-white/80 transition-colors text-xl"
          >⏮</button>
          <button
            onClick={() => setPlaying(p => !p)}
            className="w-14 h-14 rounded-full flex items-center justify-center text-xl transition-all duration-300 hover:scale-110"
            style={{
              background: "linear-gradient(135deg, #a855f7, #ec4899)",
              boxShadow: playing ? "0 0 30px rgba(168,85,247,0.6)" : "none",
            }}
          >
            {playing ? "⏸" : "▶"}
          </button>
          <button
            onClick={() => setCurrent(c => (c + 1) % TRACKS.length)}
            className="text-white/40 hover:text-white/80 transition-colors text-xl"
          >⏭</button>
        </div>
      </div>
    </div>
  );
}
