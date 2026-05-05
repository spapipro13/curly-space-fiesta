const menuToggle = document.querySelector("#menu-toggle");
const siteMenu = document.querySelector("#site-menu");
const sectionLinks = document.querySelectorAll("[data-section]");
const adminSectionTitle = document.querySelector("#admin-section-title");
const addArticleButton = document.querySelector("#add-article");
const adminEmpty = document.querySelector("#admin-empty");
const adminArticles = document.querySelector("#admin-articles");
const editorModal = document.querySelector("#editor-modal");
const editorTitle = document.querySelector("#editor-title");
const closeEditor = document.querySelector("#close-editor");
const cancelEditor = document.querySelector("#cancel-editor");
const articleForm = document.querySelector("#article-form");
const articleTitle = document.querySelector("#article-title");
const articleSection = document.querySelector("#article-section");
const articleAuthor = document.querySelector("#article-author");
const articleSummary = document.querySelector("#article-summary");
const articleBody = document.querySelector("#article-body");
const toolbarButtons = document.querySelectorAll("[data-command], [data-format]");

const articlesKey = "ilChiccoArticles";
let currentSection = "Tutte le sezioni";
let editingId = null;

const isSmallScreen = () => window.matchMedia("(max-width: 640px)").matches;

const getArticles = () => JSON.parse(localStorage.getItem(articlesKey) || "[]");

const saveArticles = (articles) => {
  localStorage.setItem(articlesKey, JSON.stringify(articles));
};

const stripHtml = (html) => {
  const element = document.createElement("div");
  element.innerHTML = html;
  return element.textContent || "";
};

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

const visibleArticles = () => {
  const articles = getArticles();
  if (currentSection === "Tutte le sezioni") {
    return articles;
  }

  return articles.filter((article) => article.section === currentSection);
};

const deleteArticle = (article) => {
  const canDelete = window.confirm(`Vuoi eliminare "${article.title}"?`);

  if (!canDelete) {
    return;
  }

  saveArticles(getArticles().filter((item) => item.id !== article.id));
  renderArticles();
};

const renderArticles = () => {
  const articles = visibleArticles();
  adminArticles.innerHTML = "";
  adminEmpty.classList.toggle("is-hidden", articles.length > 0);

  articles.forEach((article) => {
    const card = document.createElement("article");
    card.className = "admin-article-card";

    const meta = document.createElement("div");
    meta.className = "news-meta";
    meta.textContent = `${article.section} - ${article.author}`;

    const title = document.createElement("h3");
    title.textContent = article.title;

    const summary = document.createElement("p");
    summary.textContent = article.summary || stripHtml(article.body).slice(0, 150);

    const actions = document.createElement("div");
    actions.className = "article-actions";

    const editButton = document.createElement("button");
    editButton.className = "card-action-button edit-article-button";
    editButton.type = "button";
    editButton.innerHTML = "&#9998;";
    editButton.setAttribute("aria-label", `Modifica ${article.title}`);
    editButton.addEventListener("click", () => openEditor(article));

    const deleteButton = document.createElement("button");
    deleteButton.className = "card-action-button delete-article-button";
    deleteButton.type = "button";
    deleteButton.textContent = "Elimina";
    deleteButton.setAttribute("aria-label", `Elimina ${article.title}`);
    deleteButton.addEventListener("click", () => deleteArticle(article));

    actions.append(editButton, deleteButton);
    card.append(meta, title, summary, actions);
    adminArticles.append(card);
  });
};

const setSection = (name) => {
  currentSection = name;
  adminSectionTitle.textContent = name;

  sectionLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.section === name);
  });

  renderArticles();
};

const openEditor = (article = null) => {
  editingId = article ? article.id : null;
  editorTitle.textContent = article ? "Modifica articolo" : "Nuovo articolo";
  articleTitle.value = article ? article.title : "";
  articleSection.value = article ? article.section : "Politica";
  articleAuthor.value = article ? article.author : "";
  articleSummary.value = article ? article.summary : "";
  articleBody.innerHTML = article ? article.body : "";
  editorModal.classList.remove("is-hidden");
  articleTitle.focus();
};

const closeEditorModal = () => {
  editorModal.classList.add("is-hidden");
  editingId = null;
  articleForm.reset();
  articleBody.innerHTML = "";
  addArticleButton.focus();
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

addArticleButton.addEventListener("click", () => openEditor());
closeEditor.addEventListener("click", closeEditorModal);
cancelEditor.addEventListener("click", closeEditorModal);

toolbarButtons.forEach((button) => {
  button.addEventListener("click", () => {
    articleBody.focus();

    if (button.dataset.command) {
      document.execCommand(button.dataset.command, false, null);
      return;
    }

    document.execCommand("formatBlock", false, button.dataset.format);
  });
});

articleForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!articleTitle.value.trim() || !articleAuthor.value.trim() || !stripHtml(articleBody.innerHTML).trim()) {
    return;
  }

  const articles = getArticles();
  const nextArticle = {
    id: editingId || String(Date.now()),
    title: articleTitle.value.trim(),
    section: articleSection.value,
    author: articleAuthor.value.trim(),
    summary: articleSummary.value.trim(),
    body: articleBody.innerHTML,
    updatedAt: new Date().toISOString(),
  };

  const nextArticles = editingId
    ? articles.map((article) => article.id === editingId ? nextArticle : article)
    : [nextArticle, ...articles];

  saveArticles(nextArticles);
  closeEditorModal();
  renderArticles();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !editorModal.classList.contains("is-hidden")) {
    closeEditorModal();
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
