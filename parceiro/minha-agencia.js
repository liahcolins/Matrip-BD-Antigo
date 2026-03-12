const agencyForm = document.getElementById("agencyForm");
const saveAgencyBtn = document.getElementById("saveAgencyBtn");
const messageBox = document.getElementById("messageBox");

const logoInput = document.getElementById("logo");
const logoPreview = document.getElementById("logoPreview");

const agencyDisplayName = document.getElementById("agencyDisplayName");
const agencyDisplayEmail = document.getElementById("agencyDisplayEmail");
const agencyStatusBadge = document.getElementById("agencyStatusBadge");
const sidebarPartnerEmail = document.getElementById("sidebarPartnerEmail");

const summaryNomeFantasia = document.getElementById("summaryNomeFantasia");
const summaryCelular = document.getElementById("summaryCelular");
const summaryHomepage = document.getElementById("summaryHomepage");
const summaryCnpj = document.getElementById("summaryCnpj");

const API_BASE_URL = "http://localhost:3000";
const urlParams = new URLSearchParams(window.location.search);
const agencyId = urlParams.get("id") || "4";

function showMessage(type, text) {
  messageBox.className = `message-box ${type}`;
  messageBox.textContent = text;
}

function clearMessage() {
  messageBox.className = "message-box hidden";
  messageBox.textContent = "";
}

function formatCnpj(value) {
  const numbers = value.replace(/\D/g, "").slice(0, 14);
  return numbers
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

function formatPhone(value) {
  const numbers = value.replace(/\D/g, "").slice(0, 11);

  if (numbers.length <= 10) {
    return numbers
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  return numbers
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

function updateStatusBadge(status) {
  const normalized = (status || "").toLowerCase();

  if (normalized === "inativa") {
    agencyStatusBadge.textContent = "Inativa";
    agencyStatusBadge.className = "status-badge inactive";
    return;
  }

  agencyStatusBadge.textContent = "Ativa";
  agencyStatusBadge.className = "status-badge active";
}





function fillAgencyForm(data) {
  document.getElementById("nome_fantasia").value = data.nome_fantasia || "";
  document.getElementById("razao_social").value = data.razao_social || "";
  document.getElementById("cnpj").value = data.cnpj || "";
  document.getElementById("email").value = data.email || "";
  document.getElementById("homepage").value = data.homepage || "";
  document.getElementById("endereco").value = data.endereco || "";
  document.getElementById("bairro").value = data.bairro || "";
  document.getElementById("telefone").value = data.telefone || "";
  document.getElementById("celular").value = data.celular || "";
  document.getElementById("status").value = data.status || "ativa";
  document.getElementById("logo").value = data.logo || "";

  if (data.logo) {
    if (data.logo.startsWith("http://") || data.logo.startsWith("https://")) {
      logoPreview.src = data.logo;
    } else if (data.logo.startsWith("/uploads/")) {
      logoPreview.src = `${API_BASE_URL}${data.logo}`;
    } else {
      logoPreview.src = `${API_BASE_URL}/uploads/${data.logo}`;
    }
  } else {
    logoPreview.src = "../../logo-matrip-oficial-01.png";
  }

  agencyDisplayName.textContent = data.nome_fantasia || "Agência sem nome";
  agencyDisplayEmail.textContent = data.email || "--";
  sidebarPartnerEmail.textContent = data.email || "--";

  updateStatusBadge(data.status);

  summaryNomeFantasia.textContent = data.nome_fantasia || "--";
  summaryCelular.textContent = data.celular || data.telefone || "--";
  summaryHomepage.textContent = data.homepage || "--";
  summaryCnpj.textContent = data.cnpj || "--";
}






function getAgencyPayload() {
  return {
    nome_fantasia: document.getElementById("nome_fantasia").value.trim(),
    razao_social: document.getElementById("razao_social").value.trim(),
    cnpj: document.getElementById("cnpj").value.trim(),
    email: document.getElementById("email").value.trim(),
    homepage: document.getElementById("homepage").value.trim(),
    endereco: document.getElementById("endereco").value.trim(),
    bairro: document.getElementById("bairro").value.trim(),
    telefone: document.getElementById("telefone").value.trim(),
    celular: document.getElementById("celular").value.trim(),
    status: document.getElementById("status").value,
    logo: document.getElementById("logo").value.trim()
  };
}

async function loadAgency() {
  clearMessage();

  try {
    const response = await fetch(`${API_BASE_URL}/api/agencias/${agencyId}`);

    if (!response.ok) {
      throw new Error("Não foi possível carregar os dados da agência.");
    }

    const data = await response.json();
    fillAgencyForm(data);
  } catch (error) {
    showMessage("error", error.message);
  }
}

async function saveAgency() {
  clearMessage();

  const payload = getAgencyPayload();

  try {
    const response = await fetch(`${API_BASE_URL}/api/agencias/${agencyId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || "Não foi possível salvar os dados da agência.");
    }

    const updatedData = await response.json();
    fillAgencyForm(updatedData);

    showMessage("success", "Dados da agência atualizados com sucesso.");
  } catch (error) {
    showMessage("error", error.message);
  }
}








if (logoInput) {
  logoInput.addEventListener("input", () => {
    const value = logoInput.value.trim();

    if (!value) {
      logoPreview.src = "../../logo-matrip-oficial-01.png";
      return;
    }

    if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/uploads/")) {
      logoPreview.src = value.startsWith("/uploads/")
        ? `${API_BASE_URL}${value}`
        : value;
      return;
    }

    logoPreview.src = `${API_BASE_URL}/uploads/${value}`;
  });
}







const cnpjInput = document.getElementById("cnpj");
if (cnpjInput) {
  cnpjInput.addEventListener("input", (e) => {
    e.target.value = formatCnpj(e.target.value);
  });
}

const telefoneInput = document.getElementById("telefone");
const celularInput = document.getElementById("celular");

if (telefoneInput) {
  telefoneInput.addEventListener("input", (e) => {
    e.target.value = formatPhone(e.target.value);
  });
}

if (celularInput) {
  celularInput.addEventListener("input", (e) => {
    e.target.value = formatPhone(e.target.value);
  });
}

if (saveAgencyBtn) {
  saveAgencyBtn.addEventListener("click", saveAgency);
}

window.addEventListener("DOMContentLoaded", loadAgency);