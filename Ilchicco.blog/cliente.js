const menuToggle = document.querySelector("#menu-toggle");
const siteMenu = document.querySelector("#site-menu");
const sectionLinks = document.querySelectorAll("[data-section]");
const sectionTitle = document.querySelector("#section-title");
const sectionMessage = document.querySelector("#section-message");
const emptyState = document.querySelector(".empty-state");
const articleList = document.querySelector("#article-list");
const subscribeButton = document.querySelector("#subscribe-button");
const subscribeModal = document.querySelector("#subscribe-modal");
const closeSubscribe = document.querySelector("#close-subscribe");
const articlesKey = "ilChiccoArticles";

let currentSection = "Home";

const isSmallScreen = () => window.matchMedia("(max-width: 640px)").matches;

const setMenuOpen = (isOpen) => {
  menuToggle.classList.toggle("is-active", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));

  if (isSmallScreen()) {
    siteMenu.classList.toggle("is-open", isOpen);
    siteMenu.classList.remove("is-hidden");
    return;
  }

  siteMenu.classList.toggle("is-hidden", !isOpen);
  siteMenu.classList.remove("is-open");
};

const setSection = (name) => {
  currentSection = name;
  sectionTitle.textContent = name;
  sectionMessage.textContent = `La sezione ${name} e pronta, ma non contiene ancora articoli.`;

  sectionLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.section === name);
  });

  renderArticles();
};

const getArticles = () => JSON.parse(localStorage.getItem(articlesKey) || "[]");

const stripHtml = (html) => {
  const element = document.createElement("div");
  element.innerHTML = html;
  return element.textContent || "";
};

const renderArticles = () => {
  const articles = getArticles().filter((article) => {
    return currentSection === "Home" || article.section === currentSection;
  });

  articleList.innerHTML = "";
  emptyState.classList.toggle("is-hidden", articles.length > 0);

  articles.forEach((article) => {
    const card = document.createElement("article");
    card.className = "news-card";

    const meta = document.createElement("div");
    meta.className = "news-meta";
    meta.textContent = `${article.section} - ${article.author}`;

    const title = document.createElement("h3");
    title.textContent = article.title;

    const summary = document.createElement("p");
    summary.textContent = article.summary || stripHtml(article.body).slice(0, 150);

    card.append(meta, title, summary);
    articleList.append(card);
  });
};

const openSubscribe = () => {
  subscribeModal.classList.remove("is-hidden");
  closeSubscribe.focus();
};

const closeSubscribeModal = () => {
  subscribeModal.classList.add("is-hidden");
  subscribeButton.focus();
};

menuToggle.addEventListener("click", () => {
  const isOpen = isSmallScreen()
    ? siteMenu.classList.contains("is-open")
    : !siteMenu.classList.contains("is-hidden");

  setMenuOpen(!isOpen);
});

sectionLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    setSection(link.dataset.section);
    window.location.hash = link.getAttribute("href");

    if (isSmallScreen()) {
      setMenuOpen(false);
    }
  });
});

subscribeButton.addEventListener("click", (event) => {
  event.preventDefault();
  openSubscribe();
});

closeSubscribe.addEventListener("click", closeSubscribeModal);

subscribeModal.addEventListener("click", (event) => {
  if (event.target === subscribeModal) {
    closeSubscribeModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !subscribeModal.classList.contains("is-hidden")) {
    closeSubscribeModal();
  }
});

window.addEventListener("resize", () => {
  setMenuOpen(!isSmallScreen());
});

const sectionFromHash = Array.from(sectionLinks).find(
  (link) => link.getAttribute("href") === window.location.hash
);

setMenuOpen(!isSmallScreen());

if (sectionFromHash) {
  setSection(sectionFromHash.dataset.section);
} else {
  renderArticles();
}
