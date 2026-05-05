const authTitle = document.querySelector("#auth-title");
const modeButtons = document.querySelectorAll("[data-mode]");
const switchCopy = document.querySelector("#switch-copy");
const switchModeButton = document.querySelector("[data-switch-mode]");

const loginForm = document.querySelector("#login-form");
const loginEmail = document.querySelector("#login-email");
const loginPassword = document.querySelector("#login-password");
const loginMessage = document.querySelector("#login-message");

const registerForm = document.querySelector("#register-form");
const registerName = document.querySelector("#register-name");
const registerEmail = document.querySelector("#register-email");
const registerPassword = document.querySelector("#register-password");
const confirmPassword = document.querySelector("#confirm-password");
const registerMessage = document.querySelector("#register-message");

const secretModal = document.querySelector("#secret-modal");
const secretForm = document.querySelector("#secret-form");
const secretWord = document.querySelector("#secret-word");
const closeSecret = document.querySelector("#close-secret");

const storageKey = "loginDemoAccounts";
const sessionKey = "loginDemoSignedIn";
const adminSecret = "Ilchicco";

const getAccounts = () => JSON.parse(localStorage.getItem(storageKey) || "[]");

const saveAccounts = (accounts) => {
  localStorage.setItem(storageKey, JSON.stringify(accounts));
};

const setMessage = (element, text, type) => {
  element.textContent = text;
  element.className = `message ${type}`;
};

const redirectBySecret = (secret) => {
  if (sessionStorage.getItem(sessionKey) !== "true") {
    window.location.href = "cliente.html";
    return;
  }

  window.location.href = secret !== null && secret.trim() === adminSecret
    ? "admin.html"
    : "cliente.html";
};

const openSecretPopup = () => {
  if (sessionStorage.getItem(sessionKey) !== "true") {
    return;
  }

  secretWord.value = "";
  secretModal.classList.remove("is-hidden");
  secretWord.focus();
};

const setMode = (mode) => {
  const isLogin = mode === "login";

  authTitle.textContent = isLogin ? "Accedi al tuo account" : "Crea il tuo account";
  loginForm.classList.toggle("is-hidden", !isLogin);
  registerForm.classList.toggle("is-hidden", isLogin);

  modeButtons.forEach((button) => {
    const isActive = button.dataset.mode === mode;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  switchCopy.textContent = isLogin ? "Non hai un account?" : "Hai gia un account?";
  switchModeButton.textContent = isLogin ? "Registrati" : "Accedi";
  switchModeButton.dataset.switchMode = isLogin ? "register" : "login";

  loginMessage.textContent = "";
  registerMessage.textContent = "";
  (isLogin ? loginEmail : registerName).focus();
};

document.querySelectorAll("[data-toggle-password]").forEach((button) => {
  button.addEventListener("click", () => {
    const passwordInput = document.querySelector(`#${button.dataset.togglePassword}`);
    const isHidden = passwordInput.type === "password";
    passwordInput.type = isHidden ? "text" : "password";
    button.textContent = isHidden ? "Nascondi" : "Mostra";
    button.setAttribute(
      "aria-label",
      isHidden ? "Nascondi password" : "Mostra password"
    );
  });
});

modeButtons.forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});

switchModeButton.addEventListener("click", () => {
  setMode(switchModeButton.dataset.switchMode);
});

closeSecret.addEventListener("click", () => {
  redirectBySecret("");
});

secretForm.addEventListener("submit", (event) => {
  event.preventDefault();
  redirectBySecret(secretWord.value);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !secretModal.classList.contains("is-hidden")) {
    redirectBySecret("");
  }
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  loginMessage.className = "message";

  if (!loginEmail.validity.valid) {
    setMessage(loginMessage, "Inserisci un indirizzo email valido.", "error");
    loginEmail.focus();
    return;
  }

  if (loginPassword.value.trim().length < 6) {
    setMessage(loginMessage, "La password deve contenere almeno 6 caratteri.", "error");
    loginPassword.focus();
    return;
  }

  const account = getAccounts().find(
    (item) =>
      item.email === loginEmail.value.trim().toLowerCase() &&
      item.password === loginPassword.value
  );

  if (!account) {
    setMessage(loginMessage, "Account non trovato o password errata.", "error");
    return;
  }

  setMessage(loginMessage, `Bentornato, ${account.name}.`, "success");
  sessionStorage.setItem(sessionKey, "true");
  openSecretPopup();
});

registerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  registerMessage.className = "message";

  if (registerName.value.trim().length < 2) {
    setMessage(registerMessage, "Inserisci il tuo nome.", "error");
    registerName.focus();
    return;
  }

  if (!registerEmail.validity.valid) {
    setMessage(registerMessage, "Inserisci un indirizzo email valido.", "error");
    registerEmail.focus();
    return;
  }

  if (registerPassword.value.trim().length < 6) {
    setMessage(registerMessage, "La password deve contenere almeno 6 caratteri.", "error");
    registerPassword.focus();
    return;
  }

  if (registerPassword.value !== confirmPassword.value) {
    setMessage(registerMessage, "Le password non coincidono.", "error");
    confirmPassword.focus();
    return;
  }

  const accounts = getAccounts();
  const normalizedEmail = registerEmail.value.trim().toLowerCase();

  if (accounts.some((account) => account.email === normalizedEmail)) {
    setMessage(registerMessage, "Esiste gia un account con questa email.", "error");
    registerEmail.focus();
    return;
  }

  accounts.push({
    name: registerName.value.trim(),
    email: normalizedEmail,
    password: registerPassword.value,
  });
  saveAccounts(accounts);

  loginEmail.value = normalizedEmail;
  loginPassword.value = "";
  registerForm.reset();
  setMode("login");
  setMessage(loginMessage, "Account creato. Ora puoi accedere.", "success");
});
