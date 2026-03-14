const saveProfileBtn = document.getElementById("saveProfileBtn");
const messageBox = document.getElementById("messageBox");
const logoutBtn = document.getElementById("logoutBtn");

const nomeInput = document.getElementById("nome");
const emailInput = document.getElementById("email");
const tipoInput = document.getElementById("tipo");
const usuarioIdInput = document.getElementById("usuarioId");
const bioInput = document.getElementById("bio");

const profileAvatar = document.getElementById("profileAvatar");
const profileDisplayName = document.getElementById("profileDisplayName");
const profileDisplayEmail = document.getElementById("profileDisplayEmail");
const profileTipoBadge = document.getElementById("profileTipoBadge");
const sidebarPartnerEmail = document.getElementById("sidebarPartnerEmail");

const summaryNome = document.getElementById("summaryNome");
const summaryEmail = document.getElementById("summaryEmail");
const summaryTipo = document.getElementById("summaryTipo");
const summaryId = document.getElementById("summaryId");

function showMessage(type, text) {
  messageBox.className = `message-box ${type}`;
  messageBox.textContent = text;
}

function clearMessage() {
  messageBox.className = "message-box hidden";
  messageBox.textContent = "";
}

function getStoredUser() {
  const raw = localStorage.getItem("usuario");
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);

    if (typeof parsed === "string") {
      return JSON.parse(parsed);
    }

    return parsed;
  } catch {
    return null;
  }
}

function getStoredBio(userId) {
  return localStorage.getItem(`partner_bio_${userId}`) || "";
}

function setStoredBio(userId, value) {
  localStorage.setItem(`partner_bio_${userId}`, value);
}

function getInitial(name) {
  if (!name || !name.trim()) return "P";
  return name.trim().charAt(0).toUpperCase();
}

function fillProfile(user) {
  nomeInput.value = user.nome || "";
  emailInput.value = user.email || "";
  tipoInput.value = user.tipo || "usuario";
  usuarioIdInput.value = user.id || "";

  const bio = getStoredBio(user.id);
  bioInput.value = bio;

  profileAvatar.textContent = getInitial(user.nome);
  profileDisplayName.textContent = user.nome || "Usuário";
  profileDisplayEmail.textContent = user.email || "--";
  profileTipoBadge.textContent = user.tipo || "usuario";
  sidebarPartnerEmail.textContent = user.email || "--";

  summaryNome.textContent = user.nome || "--";
  summaryEmail.textContent = user.email || "--";
  summaryTipo.textContent = user.tipo || "--";
  summaryId.textContent = user.id || "--";
}

function saveProfileLocally() {
  clearMessage();

  const user = getStoredUser();

  if (!user) {
    showMessage("error", "Usuário não encontrado no armazenamento local.");
    return;
  }

  const updatedUser = {
    ...user,
    nome: nomeInput.value.trim(),
    email: emailInput.value.trim()
  };

  if (!updatedUser.nome || !updatedUser.email) {
    showMessage("error", "Preencha nome e e-mail.");
    return;
  }

  localStorage.setItem("usuario", JSON.stringify(updatedUser));
  setStoredBio(updatedUser.id, bioInput.value.trim());

  fillProfile(updatedUser);
  showMessage("success", "Perfil atualizado localmente com sucesso.");
}

function logout() {
  localStorage.removeItem("usuario");
  localStorage.removeItem("tipo");
  window.location.href = "/index.html";
}

window.addEventListener("DOMContentLoaded", () => {
  clearMessage();

  const user = getStoredUser();

  if (!user) {
    showMessage("error", "Nenhum usuário logado foi encontrado.");
    return;
  }

  fillProfile(user);
});

if (saveProfileBtn) {
  saveProfileBtn.addEventListener("click", saveProfileLocally);
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", logout);
}