const API_BASE_URL = "http://localhost:3000";

const servicesTableBody = document.getElementById("servicesTableBody");
const emptyState = document.getElementById("emptyState");
const messageBox = document.getElementById("messageBox");

const filterPasseio = document.getElementById("filterPasseio");
const filterStatus = document.getElementById("filterStatus");
const searchServico = document.getElementById("searchServico");
const clearFiltersBtn = document.getElementById("clearFiltersBtn");

const serviceForm = document.getElementById("serviceForm");
const passeioIdInput = document.getElementById("passeio_id");
const guiaIdInput = document.getElementById("guia_id");
const nomeInput = document.getElementById("nome");
const descricaoInput = document.getElementById("descricao");
const valorInput = document.getElementById("valor");
const statusInput = document.getElementById("status");
const fotoInput = document.getElementById("foto");

const metricTotal = document.getElementById("metricTotal");
const metricAtivos = document.getElementById("metricAtivos");
const metricInativos = document.getElementById("metricInativos");
const metricMedia = document.getElementById("metricMedia");

let allServices = [];
let filteredServices = [];
let allPasseios = [];

function showMessage(type, text) {
  messageBox.className = `message-box ${type}`;
  messageBox.textContent = text;
}

function clearMessage() {
  messageBox.className = "message-box hidden";
  messageBox.textContent = "";
}

function formatCurrency(value) {
  const number = Number(value || 0);
  return number.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function buildImageUrl(imageName) {
  if (!imageName) return "../../logo-matrip-oficial-01.png";

  if (imageName.startsWith("http://") || imageName.startsWith("https://")) {
    return imageName;
  }

  if (imageName.startsWith("/uploads/")) {
    return `${API_BASE_URL}${imageName}`;
  }

  return `${API_BASE_URL}/uploads/${imageName}`;
}

function getPasseioNome(passeioId) {
  const passeio = allPasseios.find(item => String(item.id) === String(passeioId));
  return passeio ? (passeio.local || `Passeio #${passeioId}`) : `Passeio #${passeioId}`;
}

function populatePasseiosSelect(data) {
  const baseOption = `<option value="">Todos</option>`;
  filterPasseio.innerHTML = baseOption;
  passeioIdInput.innerHTML = `<option value="">Selecione</option>`;

  data.forEach((passeio) => {
    const label = `${passeio.local || "Passeio"} — ${passeio.cidade || "--"}/${passeio.estado || "--"}`;

    const optionFilter = document.createElement("option");
    optionFilter.value = passeio.id;
    optionFilter.textContent = label;
    filterPasseio.appendChild(optionFilter);

    const optionForm = document.createElement("option");
    optionForm.value = passeio.id;
    optionForm.textContent = label;
    passeioIdInput.appendChild(optionForm);
  });
}

function updateMetrics(data) {
  metricTotal.textContent = data.length;

  const ativos = data.filter(item => (item.status || "").toLowerCase() === "ativo").length;
  const inativos = data.filter(item => (item.status || "").toLowerCase() === "inativo").length;

  const totalValores = data.reduce((acc, item) => acc + Number(item.valor || 0), 0);
  const media = data.length ? totalValores / data.length : 0;

  metricAtivos.textContent = ativos;
  metricInativos.textContent = inativos;
  metricMedia.textContent = formatCurrency(media);
}

function renderTable(data) {
  servicesTableBody.innerHTML = "";

  if (!data.length) {
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  data.forEach((service) => {
    const tr = document.createElement("tr");
    const fotoUrl = buildImageUrl(service.foto || "");

    tr.innerHTML = `
      <td class="service-main">
        <strong>${service.nome || "Serviço sem nome"}</strong>
        <span>${service.descricao || "Sem descrição."}</span>
      </td>

      <td>${getPasseioNome(service.passeio_id)}</td>

      <td>#${service.guia_id || "--"}</td>

      <td>${formatCurrency(service.valor)}</td>

      <td>
        <span class="status-pill ${(service.status || "ativo").toLowerCase()}">
          ${service.status || "ativo"}
        </span>
      </td>

      <td>
        <img
          src="${fotoUrl}"
          alt="${service.nome || "Serviço"}"
          class="photo-thumb"
          onerror="this.src='../../logo-matrip-oficial-01.png'"
        />
      </td>
    `;

    servicesTableBody.appendChild(tr);
  });
}

function applyFilters() {
  const passeioId = filterPasseio.value.trim();
  const status = filterStatus.value.trim().toLowerCase();
  const search = searchServico.value.trim().toLowerCase();

  filteredServices = allServices.filter((service) => {
    const passeioMatch = !passeioId || String(service.passeio_id) === passeioId;
    const statusMatch = !status || (service.status || "").toLowerCase() === status;

    const searchBase = [
      service.nome || "",
      service.descricao || "",
      getPasseioNome(service.passeio_id)
    ].join(" ").toLowerCase();

    const searchMatch = !search || searchBase.includes(search);

    return passeioMatch && statusMatch && searchMatch;
  });

  updateMetrics(filteredServices);
  renderTable(filteredServices);
}

function clearFilters() {
  filterPasseio.value = "";
  filterStatus.value = "";
  searchServico.value = "";
  applyFilters();
}

async function loadPasseios() {
  const response = await fetch(`${API_BASE_URL}/passeios`);
  if (!response.ok) {
    throw new Error("Não foi possível carregar os passeios.");
  }

  const data = await response.json();
  allPasseios = Array.isArray(data) ? data : [];
  populatePasseiosSelect(allPasseios);
}

async function loadServices() {
  clearMessage();

  try {
    const response = await fetch(`${API_BASE_URL}/servicos`);

    if (!response.ok) {
      throw new Error("Não foi possível carregar os serviços.");
    }

    const data = await response.json();
    allServices = Array.isArray(data) ? data : [];
    filteredServices = [...allServices];

    updateMetrics(filteredServices);
    renderTable(filteredServices);
  } catch (error) {
    showMessage("error", error.message);
  }
}

async function createService(event) {
  event.preventDefault();
  clearMessage();

  const payload = {
    passeio_id: Number(passeioIdInput.value),
    guia_id: Number(guiaIdInput.value),
    nome: nomeInput.value.trim(),
    descricao: descricaoInput.value.trim(),
    valor: Number(valorInput.value),
    status: statusInput.value,
    foto: fotoInput.value.trim()
  };

  if (!payload.passeio_id || !payload.guia_id || !payload.nome || !payload.descricao || Number.isNaN(payload.valor)) {
    showMessage("error", "Preencha corretamente os campos obrigatórios.");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/servicos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || "Não foi possível cadastrar o serviço.");
    }

    showMessage("success", "Serviço cadastrado com sucesso.");
    serviceForm.reset();
    await loadServices();
  } catch (error) {
    showMessage("error", error.message);
  }
}

filterPasseio.addEventListener("change", applyFilters);
filterStatus.addEventListener("change", applyFilters);
searchServico.addEventListener("input", applyFilters);
clearFiltersBtn.addEventListener("click", clearFilters);
serviceForm.addEventListener("submit", createService);

window.addEventListener("DOMContentLoaded", async () => {
  try {
    await loadPasseios();
    await loadServices();
  } catch (error) {
    showMessage("error", error.message);
  }
});