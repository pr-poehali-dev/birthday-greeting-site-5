import { useEffect, useRef, useState, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  shape: "rect" | "circle" | "star";
  rotation: number;
  rotSpeed: number;
}

interface FireworkShell {
  x: number; y: number;
  vy: number;
  color: string;
  exploded: boolean;
  trail: { x: number; y: number }[];
}

interface Star {
  x: number; y: number;
  size: number;
  delay: number;
  duration: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const FIREWORK_COLORS = [
  "#f5c842", "#a855f7", "#ec4899", "#22d3ee", "#4ade80",
  "#fb923c", "#f43f5e", "#818cf8", "#34d399", "#fbbf24"
];

const CONFETTI_COLORS = [
  "#f5c842", "#a855f7", "#ec4899", "#22d3ee", "#4ade80",
  "#fb923c", "#f43f5e", "#c084fc", "#86efac"
];

// ─── Fireworks Canvas ─────────────────────────────────────────────────────────
function FireworksCanvas({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<{
    particles: Particle[];
    shells: FireworkShell[];
    raf: number;
    running: boolean;
  }>({ particles: [], shells: [], raf: 0, running: false });

  const launchShell = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const x = canvas.width * (0.2 + Math.random() * 0.6);
    const color = FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)];
    stateRef.current.shells.push({
      x, y: canvas.height,
      vy: -(canvas.height * 0.012 + Math.random() * canvas.height * 0.006),
      color, exploded: false, trail: []
    });
  }, []);

  const explode = useCallback((shell: FireworkShell) => {
    const count = 80 + Math.floor(Math.random() * 60);
    const shapes: ("rect" | "circle" | "star")[] = ["rect", "circle", "star"];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.2;
      const speed = 2 + Math.random() * 5;
      stateRef.current.particles.push({
        x: shell.x, y: shell.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: Math.random() > 0.3 ? shell.color : FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)],
        size: 2 + Math.random() * 4,
        life: 1, maxLife: 1,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.2,
      });
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    let launchTimer = 0;

    const loop = () => {
      if (!stateRef.current.running) return;
      ctx.fillStyle = "rgba(10,8,20,0.18)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      launchTimer++;
      if (launchTimer % 50 === 0) launchShell();

      stateRef.current.shells = stateRef.current.shells.filter(shell => {
        shell.y += shell.vy;
        shell.vy += 0.15;
        shell.trail.push({ x: shell.x, y: shell.y });
        if (shell.trail.length > 12) shell.trail.shift();

        shell.trail.forEach((pt, i) => {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 2 * (i / shell.trail.length), 0, Math.PI * 2);
          ctx.fillStyle = shell.color + Math.floor((i / shell.trail.length) * 200).toString(16).padStart(2, "0");
          ctx.fill();
        });

        if (!shell.exploded && shell.vy >= -1) {
          shell.exploded = true;
          explode(shell);
          return false;
        }
        return !shell.exploded;
      });

      stateRef.current.particles = stateRef.current.particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08;
        p.vx *= 0.98;
        p.life -= 0.016;
        p.rotation += p.rotSpeed;

        const alpha = Math.max(0, p.life);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === "rect") {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.5);
        } else {
          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            const a = (Math.PI * 2 * i) / 5 - Math.PI / 2;
            const r = p.size;
            const ir = p.size * 0.4;
            const ao = a + Math.PI / 5;
            if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
            else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
            ctx.lineTo(Math.cos(ao) * ir, Math.sin(ao) * ir);
          }
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
        return p.life > 0;
      });

      stateRef.current.raf = requestAnimationFrame(loop);
    };

    if (active) {
      stateRef.current.running = true;
      launchShell();
      setTimeout(launchShell, 300);
      setTimeout(launchShell, 600);
      loop();
    }

    return () => {
      window.removeEventListener("resize", resize);
      stateRef.current.running = false;
      cancelAnimationFrame(stateRef.current.raf);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [active, launchShell, explode]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}

// ─── Confetti Canvas ──────────────────────────────────────────────────────────
function ConfettiCanvas({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<{ particles: Particle[]; raf: number; running: boolean }>({
    particles: [], raf: 0, running: false
  });

  const spawnBurst = useCallback((canvas: HTMLCanvasElement) => {
    const cx = canvas.width * (0.1 + Math.random() * 0.8);
    const cy = -10;
    const shapes: ("rect" | "circle" | "star")[] = ["rect", "circle", "star"];
    for (let i = 0; i < 12; i++) {
      stateRef.current.particles.push({
        x: cx, y: cy,
        vx: (Math.random() - 0.5) * 8,
        vy: 2 + Math.random() * 4,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        size: 6 + Math.random() * 8,
        life: 1, maxLife: 1,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.15,
      });
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);

    let timer = 0;
    const loop = () => {
      if (!stateRef.current.running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      timer++;
      if (timer % 18 === 0) spawnBurst(canvas);

      stateRef.current.particles = stateRef.current.particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1;
        p.vx *= 0.99;
        p.life -= 0.007;
        p.rotation += p.rotSpeed;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === "rect") {
          ctx.fillRect(-p.size / 2, -p.size * 0.3, p.size, p.size * 0.5);
        } else {
          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            const a = (Math.PI * 2 * i) / 5 - Math.PI / 2;
            const ao = a + Math.PI / 5;
            ctx.lineTo(Math.cos(a) * p.size / 2, Math.sin(a) * p.size / 2);
            ctx.lineTo(Math.cos(ao) * p.size / 4, Math.sin(ao) * p.size / 4);
          }
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
        return p.life > 0 && p.y < canvas.height + 50;
      });

      stateRef.current.raf = requestAnimationFrame(loop);
    };

    if (active) {
      stateRef.current.running = true;
      for (let i = 0; i < 5; i++) {
        setTimeout(() => { if (canvas) spawnBurst(canvas); }, i * 200);
      }
      loop();
    }

    return () => {
      window.removeEventListener("resize", resize);
      stateRef.current.running = false;
      cancelAnimationFrame(stateRef.current.raf);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [active, spawnBurst]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 2 }}
    />
  );
}

// ─── Stars Background ─────────────────────────────────────────────────────────
function StarsBackground() {
  const stars: Star[] = Array.from({ length: 80 }, (_, i) => ({
    x: ((i * 137.5) % 100),
    y: ((i * 97.3) % 100),
    size: 0.5 + (i % 3) * 0.7,
    delay: (i % 40) * 0.1,
    duration: 2 + (i % 3),
  }));

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {stars.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            animation: `twinkle ${s.duration}s ease-in-out infinite ${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Navigation ───────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "home", label: "Главная" },
  { id: "greeting", label: "Поздравление" },
  { id: "music", label: "Музыка" },
  { id: "fireworks", label: "Фейерверк" },
];

function Nav({ active }: { active: string }) {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-5">
      <div
        className="flex gap-6 px-7 py-3 rounded-full"
        style={{
          background: "rgba(10,8,20,0.75)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(245,200,66,0.2)",
        }}
      >
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => scrollTo(item.id)}
            className="nav-link font-montserrat text-xs font-semibold tracking-widest uppercase transition-colors duration-300"
            style={{ color: active === item.id ? "var(--gold)" : "rgba(255,255,255,0.5)" }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

// ─── Music Player ─────────────────────────────────────────────────────────────
const TRACKS = [
  { title: "Праздничный вечер", artist: "Оркестр радости", duration: "3:42", emoji: "🎺" },
  { title: "Танцуй со мной", artist: "Блестящие ноты", duration: "4:10", emoji: "💃" },
  { title: "Фейерверк в душе", artist: "Звёздный квартет", duration: "3:28", emoji: "✨" },
];

function MusicSection() {
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

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Index() {
  const [activeSection, setActiveSection] = useState("home");
  const [fireworksOn, setFireworksOn] = useState(false);
  const [confettiOn, setConfettiOn] = useState(false);
  const [greetingRevealed, setGreetingRevealed] = useState(false);

  useEffect(() => {
    const sections = document.querySelectorAll("section[id]");
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); }),
      { threshold: 0.4 }
    );
    sections.forEach(s => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const els = document.querySelectorAll(".section-fade");
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.15 }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #0a0814 0%, #0d0a1e 50%, #060a14 100%)" }}>
      <StarsBackground />
      <Nav active={activeSection} />

      {/* ═══ HOME ═══════════════════════════════════════════════════════════ */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <ConfettiCanvas active={confettiOn} />

        <div className="relative text-center px-6" style={{ zIndex: 10 }}>
          <div className="animate-float mb-6 text-7xl select-none">🎉</div>

          <h1
            className="font-cormorant font-bold glow-gold mb-4 leading-none"
            style={{ fontSize: "clamp(4rem, 12vw, 9rem)", color: "var(--gold)" }}
          >
            Праздник!
          </h1>

          <p
            className="font-montserrat font-light uppercase text-white/50 mb-12"
            style={{ fontSize: "clamp(0.7rem, 2vw, 0.9rem)", letterSpacing: "0.4em" }}
          >
            Добро пожаловать на торжество
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => setConfettiOn(v => !v)}
              className="px-8 py-3 rounded-full font-montserrat font-semibold text-sm tracking-wider uppercase transition-all duration-300 hover:scale-105"
              style={{
                background: confettiOn ? "linear-gradient(135deg, #f5c842, #fb923c)" : "rgba(245,200,66,0.1)",
                color: confettiOn ? "#0a0814" : "var(--gold)",
                border: "1px solid rgba(245,200,66,0.4)",
                boxShadow: confettiOn ? "0 0 30px rgba(245,200,66,0.4)" : "none",
              }}
            >
              {confettiOn ? "🎊 Конфетти летит!" : "🎊 Запустить конфетти"}
            </button>

            <button
              onClick={() => document.getElementById("fireworks")?.scrollIntoView({ behavior: "smooth" })}
              className="px-8 py-3 rounded-full font-montserrat font-semibold text-sm tracking-wider uppercase transition-all duration-300 hover:scale-105"
              style={{
                background: "rgba(168,85,247,0.1)",
                color: "#c084fc",
                border: "1px solid rgba(168,85,247,0.4)",
              }}
            >
              🎆 К салюту
            </button>
          </div>
        </div>

        <div
          className="absolute rounded-full pointer-events-none"
          style={{ width: 400, height: 400, background: "radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)", left: "-5%", top: "20%" }}
        />
        <div
          className="absolute rounded-full pointer-events-none"
          style={{ width: 300, height: 300, background: "radial-gradient(circle, rgba(245,200,66,0.08) 0%, transparent 70%)", right: "5%", bottom: "20%" }}
        />
      </section>

      {/* ═══ GREETING ════════════════════════════════════════════════════════ */}
      <section id="greeting" className="relative min-h-screen flex items-center justify-center py-24 px-6">
        <div className="max-w-3xl mx-auto text-center section-fade">
          <div className="text-5xl mb-6">💌</div>
          <h2
            className="font-cormorant font-semibold mb-10"
            style={{ fontSize: "clamp(2.5rem, 7vw, 5rem)", color: "var(--gold)" }}
          >
            Поздравление
          </h2>

          {!greetingRevealed ? (
            <div>
              <p className="font-montserrat text-white/60 text-lg mb-10 leading-relaxed">
                Нажмите, чтобы раскрыть особое послание для вас
              </p>
              <button
                onClick={() => setGreetingRevealed(true)}
                className="relative px-12 py-5 rounded-full font-montserrat font-semibold text-sm tracking-widest uppercase overflow-hidden transition-all duration-500 hover:scale-105 animate-pulse-glow"
                style={{ background: "linear-gradient(135deg, #f5c842, #fb923c)", color: "#0a0814" }}
              >
                <span className="relative z-10">Открыть послание 🎁</span>
                <div className="shimmer absolute inset-0" />
              </button>
            </div>
          ) : (
            <div
              className="p-10 rounded-3xl"
              style={{
                background: "linear-gradient(135deg, rgba(245,200,66,0.08), rgba(251,146,60,0.06))",
                border: "1px solid rgba(245,200,66,0.2)",
                boxShadow: "0 0 80px rgba(245,200,66,0.08)",
              }}
            >
              <div className="text-4xl text-center mb-8">🌟</div>
              <p
                className="font-cormorant italic text-white/90 text-center mb-6 leading-relaxed"
                style={{ fontSize: "clamp(1.2rem, 2.5vw, 1.75rem)" }}
              >
                «Красота бывает разная. Есть броская, яркая, а есть — твоя: глубокая, как океан, и светлая, как утреннее небо. Желаю тебе, чтобы твоя внешность всегда была лишь отражением твоей счастливой души. Сияй ярче звёзд, люби себя каждой клеточкой и никогда не сомневайся в том, что ты — настоящее чудо.»
              </p>
              <p className="font-montserrat text-center text-white/40 text-sm tracking-widest uppercase">
                — С праздником, прекрасная! ✨
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ═══ MUSIC ═══════════════════════════════════════════════════════════ */}
      <section id="music" className="relative min-h-screen flex items-center justify-center py-24 px-6">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, rgba(168,85,247,0.07) 0%, transparent 70%)" }}
        />
        <div className="max-w-2xl mx-auto w-full section-fade">
          <div className="text-center mb-14">
            <div className="text-5xl mb-6">🎵</div>
            <h2
              className="font-cormorant font-semibold"
              style={{ fontSize: "clamp(2.5rem, 7vw, 5rem)", color: "#c084fc" }}
            >
              Музыка
            </h2>
            <p className="font-montserrat text-white/40 text-xs tracking-widest uppercase mt-3">
              Праздничный плейлист
            </p>
          </div>
          <MusicSection />
        </div>
      </section>

      {/* ═══ FIREWORKS ═══════════════════════════════════════════════════════ */}
      <section id="fireworks" className="relative min-h-screen flex items-center justify-center py-24 px-6 overflow-hidden">
        <FireworksCanvas active={fireworksOn} />

        <div className="relative text-center section-fade" style={{ zIndex: 10 }}>
          <div className="text-5xl mb-6">🎆</div>
          <h2
            className="font-cormorant font-semibold mb-6"
            style={{ fontSize: "clamp(2.5rem, 7vw, 5rem)", color: "#22d3ee" }}
          >
            Фейерверк
          </h2>
          <p className="font-montserrat text-white/50 mb-12 text-lg">
            Настоящий праздничный салют прямо в браузере
          </p>

          <button
            onClick={() => setFireworksOn(v => !v)}
            className="relative px-12 py-5 rounded-full font-montserrat font-semibold text-sm tracking-widest uppercase transition-all duration-500 hover:scale-105 overflow-hidden"
            style={{
              background: fireworksOn ? "linear-gradient(135deg, #22d3ee, #4ade80)" : "rgba(34,211,238,0.1)",
              color: fireworksOn ? "#0a0814" : "#22d3ee",
              border: "1px solid rgba(34,211,238,0.4)",
              boxShadow: fireworksOn ? "0 0 40px rgba(34,211,238,0.4)" : "none",
            }}
          >
            {fireworksOn ? "🎆 Остановить салют" : "🎆 Запустить салют!"}
            {fireworksOn && <div className="shimmer absolute inset-0" />}
          </button>

          {fireworksOn && (
            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              {["🔴", "🟡", "🟢", "🔵", "🟣", "🟠"].map((emoji, i) => (
                <span
                  key={i}
                  className="text-2xl"
                  style={{ animation: `twinkle ${0.5 + i * 0.15}s ease-in-out infinite` }}
                >
                  {emoji}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      <footer className="py-12 text-center" style={{ position: "relative", zIndex: 10 }}>
        <p className="font-montserrat text-white/20 text-xs tracking-widest uppercase">
          Создано с любовью ✨ {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}