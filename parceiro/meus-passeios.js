const API_BASE_URL = "http://localhost:3000";

const passeiosGrid = document.getElementById("passeiosGrid");
const emptyState = document.getElementById("emptyState");
const messageBox = document.getElementById("messageBox");

const filterCategoria = document.getElementById("filterCategoria");
const filterCidade = document.getElementById("filterCidade");
const searchPasseio = document.getElementById("searchPasseio");
const clearFiltersBtn = document.getElementById("clearFiltersBtn");

const metricTotal = document.getElementById("metricTotal");
const metricCategorias = document.getElementById("metricCategorias");
const metricCidades = document.getElementById("metricCidades");
const metricPrecoMedio = document.getElementById("metricPrecoMedio");

let allPasseios = [];
let filteredPasseios = [];

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
  if (!imageName) {
    return "../../logo-matrip-oficial-01.png";
  }

  if (imageName.startsWith("http://") || imageName.startsWith("https://")) {
    return imageName;
  }

  if (imageName.startsWith("/uploads/")) {
    return `${API_BASE_URL}${imageName}`;
  }

  return `${API_BASE_URL}/uploads/${imageName}`;
}

function truncateText(text, maxLength = 130) {
  if (!text) return "Sem descrição disponível.";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
}

function updateMetrics(data) {
  metricTotal.textContent = data.length;

  const categorias = new Set(
    data.map(item => (item.categoria || "").trim().toLowerCase()).filter(Boolean)
  );

  const cidades = new Set(
    data.map(item => (item.cidade || "").trim().toLowerCase()).filter(Boolean)
  );

  const totalPrecos = data.reduce((acc, item) => acc + Number(item.valor_final || 0), 0);
  const precoMedio = data.length ? totalPrecos / data.length : 0;

  metricCategorias.textContent = categorias.size;
  metricCidades.textContent = cidades.size;
  metricPrecoMedio.textContent = formatCurrency(precoMedio);
}

function populateCategoryFilter(data) {
  const categories = [...new Set(
    data.map(item => item.categoria).filter(Boolean)
  )].sort((a, b) => a.localeCompare(b, "pt-BR"));

  filterCategoria.innerHTML = `<option value="">Todas</option>`;

  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    filterCategoria.appendChild(option);
  });
}

function renderPasseios(data) {
  passeiosGrid.innerHTML = "";

  if (!data.length) {
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  data.forEach(passeio => {
    const imageUrl = buildImageUrl(passeio.imagem);

    const card = document.createElement("article");
    card.className = "passeio-card";

    card.innerHTML = `
      <img
        src="${imageUrl}"
        alt="${passeio.local || "Passeio"}"
        class="passeio-image"
        onerror="this.src='../../logo-matrip-oficial-01.png'"
      />

      <div class="passeio-body">
        <div class="passeio-top">
          <h2 class="passeio-title">${passeio.local || "Passeio sem nome"}</h2>
          <span class="passeio-category">${passeio.categoria || "Sem categoria"}</span>
        </div>

        <p class="passeio-location">${passeio.cidade || "--"} / ${passeio.estado || "--"}</p>

        <p class="passeio-description">${truncateText(passeio.descricao)}</p>

        <div class="passeio-meta">
          <div class="meta-item">
            <span>Preço final</span>
            <strong>${formatCurrency(passeio.valor_final)}</strong>
          </div>

          <div class="meta-item">
            <span>ID do passeio</span>
            <strong>#${passeio.id}</strong>
          </div>
        </div>

        <div class="passeio-actions">
          <button class="card-btn secondary" type="button" data-action="details" data-id="${passeio.id}">
            Ver detalhes
          </button>
          <button class="card-btn primary" type="button" data-action="edit" data-id="${passeio.id}">
            Editar
          </button>
        </div>
      </div>
    `;

    passeiosGrid.appendChild(card);
  });
}

function applyFilters() {
  const categoria = filterCategoria.value.trim().toLowerCase();
  const cidade = filterCidade.value.trim().toLowerCase();
  const search = searchPasseio.value.trim().toLowerCase();

  filteredPasseios = allPasseios.filter(passeio => {
    const categoriaMatch = !categoria || (passeio.categoria || "").toLowerCase() === categoria;
    const cidadeMatch = !cidade || (passeio.cidade || "").toLowerCase().includes(cidade);

    const searchBase = [
      passeio.local || "",
      passeio.descricao || "",
      passeio.cidade || "",
      passeio.categoria || ""
    ].join(" ").toLowerCase();

    const searchMatch = !search || searchBase.includes(search);

    return categoriaMatch && cidadeMatch && searchMatch;
  });

  updateMetrics(filteredPasseios);
  renderPasseios(filteredPasseios);
}

async function loadPasseios() {
  clearMessage();

  try {
    const response = await fetch(`${API_BASE_URL}/passeios`);

    if (!response.ok) {
      throw new Error("Não foi possível carregar os passeios.");
    }

    const data = await response.json();
    allPasseios = Array.isArray(data) ? data : [];
    filteredPasseios = [...allPasseios];

    populateCategoryFilter(allPasseios);
    updateMetrics(filteredPasseios);
    renderPasseios(filteredPasseios);
  } catch (error) {
    showMessage("error", error.message);
  }
}

function clearFilters() {
  filterCategoria.value = "";
  filterCidade.value = "";
  searchPasseio.value = "";
  applyFilters();
}

filterCategoria.addEventListener("change", applyFilters);
filterCidade.addEventListener("input", applyFilters);
searchPasseio.addEventListener("input", applyFilters);
clearFiltersBtn.addEventListener("click", clearFilters);

passeiosGrid.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const action = button.dataset.action;
  const passeioId = button.dataset.id;

  if (action === "details") {
    window.location.href = `../../paginas/detalhes.html?id=${passeioId}`;
    return;
  }

  if (action === "edit") {
    alert(`Próximo passo: abrir a tela de edição do passeio #${passeioId}.`);
  }
});

window.addEventListener("DOMContentLoaded", loadPasseios);