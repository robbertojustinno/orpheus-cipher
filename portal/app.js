(() => {
  const root = document.documentElement;
  const btn = document.getElementById("langSwitch");
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
})();