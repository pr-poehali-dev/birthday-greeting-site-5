interface Star {
  x: number; y: number;
  size: number;
  delay: number;
  duration: number;
}

export default function StarsBackground() {
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
