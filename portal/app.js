(() => {
  const root = document.documentElement;
  const btn = document.getElementById("langSwitch");
  const progress = document.getElementById("scrollProgress");

  const setLang = (lang) => {
    root.dataset.lang = lang;
    root.lang = lang === "pt" ? "pt-BR" : "en";
    document.querySelectorAll("[data-pt][data-en]").forEach(el => {
      el.textContent = el.dataset[lang];
    });
    btn.textContent = lang === "pt" ? "EN" : "PT";
    document.title = lang === "pt"
      ? "CIPHER — Protocolo Orpheus | Portal Oficial"
      : "CIPHER — The Orpheus Protocol | Official Portal";
    localStorage.setItem("cipher-lang", lang);
  };

  btn.addEventListener("click", () => setLang(root.dataset.lang === "pt" ? "en" : "pt"));
  setLang(localStorage.getItem("cipher-lang") || "pt");

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach(el => io.observe(el));

  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const pct = max > 0 ? (scrollY / max) * 100 : 0;
    progress.style.width = pct + "%";
  };
  addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  const sigil = document.querySelector(".sigil");
  if (sigil && matchMedia("(pointer:fine)").matches) {
    addEventListener("mousemove", (e) => {
      const x = (e.clientX / innerWidth - .5) * 8;
      const y = (e.clientY / innerHeight - .5) * 8;
      sigil.style.transform = `translate(${x}px,${y}px)`;
    }, { passive: true });
  }

  const terminal = document.getElementById("terminalBody");
  if (terminal) {
    let blink = false;
    setInterval(() => {
      terminal.style.boxShadow = blink ? "inset 0 0 26px rgba(114,222,160,.015)" : "inset 0 0 42px rgba(214,64,56,.025)";
      blink = !blink;
    }, 1800);
  }
})();