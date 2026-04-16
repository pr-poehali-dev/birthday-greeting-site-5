const NAV_ITEMS = [
  { id: "home", label: "Главная" },
  { id: "greeting", label: "Поздравление" },
  { id: "music", label: "100 и 1 комплимент" },
  { id: "fireworks", label: "Фейерверк" },
];

export default function Nav({ active }: { active: string }) {
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