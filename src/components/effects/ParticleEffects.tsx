import { useEffect, useRef, useCallback } from "react";

export interface Particle {
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

export interface FireworkShell {
  x: number; y: number;
  vy: number;
  color: string;
  exploded: boolean;
  trail: { x: number; y: number }[];
}

export const FIREWORK_COLORS = [
  "#f5c842", "#a855f7", "#ec4899", "#22d3ee", "#4ade80",
  "#fb923c", "#f43f5e", "#818cf8", "#34d399", "#fbbf24"
];

export const CONFETTI_COLORS = [
  "#f5c842", "#a855f7", "#ec4899", "#22d3ee", "#4ade80",
  "#fb923c", "#f43f5e", "#c084fc", "#86efac"
];

export function FireworksCanvas({ active }: { active: boolean }) {
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

export function ConfettiCanvas({ active }: { active: boolean }) {
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
