import { useEffect, useState } from "react";
import { FireworksCanvas, ConfettiCanvas } from "@/components/effects/ParticleEffects";
import StarsBackground from "@/components/layout/StarsBackground";
import Nav from "@/components/layout/Nav";

export default function Index() {
  const [activeSection, setActiveSection] = useState("home");
  const [fireworksOn, setFireworksOn] = useState(false);
  const [confettiOn] = useState(true);
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
            С твоим днём!
          </h1>

          <p
            className="font-montserrat font-light uppercase text-white/50 mb-12"
            style={{ fontSize: "clamp(0.7rem, 2vw, 0.9rem)", letterSpacing: "0.4em" }}
          >
            Добро пожаловать на торжество
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
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
            <div className="text-5xl mb-6">💐</div>
            <h2
              className="font-cormorant font-semibold"
              style={{ fontSize: "clamp(2.5rem, 7vw, 5rem)", color: "#c084fc" }}
            >
              100 и 1 комплимент
            </h2>
            <p className="font-montserrat text-white/40 text-xs tracking-widest uppercase mt-3">
              Специально для тебя
            </p>
          </div>

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