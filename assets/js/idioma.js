const toggle = document.getElementById("langToggle");
const dropdown = document.getElementById("langDropdown");
const currentFlag = document.getElementById("currentFlag");
const currentLang = document.getElementById("currentLang");
let translations = {};

const langData = {
  pt: { label: "Português", flag: "https://flagcdn.com/w20/pt.png" },
  en: { label: "English", flag: "https://flagcdn.com/w20/gb.png" },
};

// Abrir/fechar dropdown
toggle.addEventListener("click", (e) => {
  e.stopPropagation();
  dropdown.classList.toggle("active");
});

// Fechar ao clicar fora
document.addEventListener("click", (e) => {
  if (!dropdown.contains(e.target) && !toggle.contains(e.target)) {
    dropdown.classList.remove("active");
  }
});

// Selecionar idioma
document.querySelectorAll(".lang-menu a").forEach((item) => {
  item.addEventListener("click", (e) => {
    e.preventDefault();
    const lang = item.getAttribute("data-lang");
    localStorage.setItem("lang", lang);
    updateLangUI(lang);
    setLanguage(lang);
    dropdown.classList.remove("active");
  });
});

// Atualizar botão (flag + texto + activo)
function updateLangUI(lang) {
  currentFlag.src = langData[lang].flag;
  currentLang.innerText = langData[lang].label;
  document
    .querySelectorAll(".lang-menu a")
    .forEach((el) => el.classList.remove("active"));
  document
    .querySelector(`.lang-menu a[data-lang="${lang}"]`)
    .classList.add("active");
}

// Aplicar traduções ao DOM
function setLanguage(lang) {
  const t = translations[lang];
  if (!t) return;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (t[key] !== undefined) el.innerHTML = t[key];
  });
}

fetch("assets/js/translations.json")
  .then((res) => res.json())
  .then((data) => {
    translations = data;
    const savedLang = localStorage.getItem("lang") || "pt";
    updateLangUI(savedLang);
    setLanguage(savedLang);
  })
  .catch((err) => console.error("Erro ao carregar lang.json:", err));
