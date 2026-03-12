const API_BASE_URL = "http://localhost:3000";

const valuesTableBody = document.getElementById("valuesTableBody");
const emptyState = document.getElementById("emptyState");
const messageBox = document.getElementById("messageBox");

const filterCategoria = document.getElementById("filterCategoria");
const searchPasseio = document.getElementById("searchPasseio");
const clearFiltersBtn = document.getElementById("clearFiltersBtn");

const metricTotal = document.getElementById("metricTotal");
const metricPreco = document.getElementById("metricPreco");
const metricMaior = document.getElementById("metricMaior");
const metricMenor = document.getElementById("metricMenor");

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

function parseCurrencyInput(value) {
  if (typeof value === "number") return value;
  if (!value) return 0;

  const normalized = String(value)
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const number = Number(normalized);
  return Number.isNaN(number) ? 0 : number;
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

function updateMetrics(data) {
  metricTotal.textContent = data.length;

  if (!data.length) {
    metricPreco.textContent = "R$ 0,00";
    metricMaior.textContent = "R$ 0,00";
    metricMenor.textContent = "R$ 0,00";
    return;
  }

  const valores = data.map(item => Number(item.valor_final || 0));
  const media = valores.reduce((acc, value) => acc + value, 0) / valores.length;
  const maior = Math.max(...valores);
  const menor = Math.min(...valores);

  metricPreco.textContent = formatCurrency(media);
  metricMaior.textContent = formatCurrency(maior);
  metricMenor.textContent = formatCurrency(menor);
}

function renderTable(data) {
  valuesTableBody.innerHTML = "";

  if (!data.length) {
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  data.forEach(passeio => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td class="passeio-cell">
        <strong>${passeio.local || "Passeio sem nome"}</strong>
        <span>${passeio.cidade || "--"} / ${passeio.estado || "--"}</span>
      </td>

      <td>${passeio.categoria || "--"}</td>

      <td>
        <input
          class="price-input"
          type="number"
          step="0.01"
          min="0"
          data-field="valor_adulto"
          data-id="${passeio.id}"
          value="${Number(passeio.valor_adulto || 0)}"
        />
      </td>

      <td>
        <input
          class="price-input"
          type="number"
          step="0.01"
          min="0"
          data-field="valor_estudante"
          data-id="${passeio.id}"
          value="${Number(passeio.valor_estudante || 0)}"
        />
      </td>

      <td>
        <input
          class="price-input"
          type="number"
          step="0.01"
          min="0"
          data-field="valor_crianca"
          data-id="${passeio.id}"
          value="${Number(passeio.valor_crianca || 0)}"
        />
      </td>

      <td>
        <input
          class="price-input"
          type="number"
          step="0.01"
          min="0"
          data-field="valor_final"
          data-id="${passeio.id}"
          value="${Number(passeio.valor_final || 0)}"
        />
      </td>

      <td>
        <button class="save-row-btn" type="button" data-action="save" data-id="${passeio.id}">
          Salvar
        </button>
      </td>
    `;

    valuesTableBody.appendChild(tr);
  });
}

function applyFilters() {
  const categoria = filterCategoria.value.trim().toLowerCase();
  const search = searchPasseio.value.trim().toLowerCase();

  filteredPasseios = allPasseios.filter(passeio => {
    const categoriaMatch = !categoria || (passeio.categoria || "").toLowerCase() === categoria;

    const searchBase = [
      passeio.local || "",
      passeio.cidade || "",
      passeio.descricao || "",
      passeio.categoria || ""
    ].join(" ").toLowerCase();

    const searchMatch = !search || searchBase.includes(search);

    return categoriaMatch && searchMatch;
  });

  updateMetrics(filteredPasseios);
  renderTable(filteredPasseios);
}

function clearFilters() {
  filterCategoria.value = "";
  searchPasseio.value = "";
  applyFilters();
}

async function loadPasseios() {
  clearMessage();

  try {
    const response = await fetch(`${API_BASE_URL}/passeios`);

    if (!response.ok) {
      throw new Error("Não foi possível carregar os valores dos passeios.");
    }

    const data = await response.json();
    allPasseios = Array.isArray(data) ? data : [];
    filteredPasseios = [...allPasseios];

    populateCategoryFilter(allPasseios);
    updateMetrics(filteredPasseios);
    renderTable(filteredPasseios);
  } catch (error) {
    showMessage("error", error.message);
  }
}

async function fetchPasseioDetalhes(id) {
  const response = await fetch(`${API_BASE_URL}/passeios/${id}`);

  if (!response.ok) {
    throw new Error("Não foi possível buscar os dados completos do passeio.");
  }

  return response.json();
}

async function savePasseioValores(id) {
  clearMessage();

  try {
    const passeioAtual = await fetchPasseioDetalhes(id);

    const valorAdultoInput = document.querySelector(`input[data-field="valor_adulto"][data-id="${id}"]`);
    const valorEstudanteInput = document.querySelector(`input[data-field="valor_estudante"][data-id="${id}"]`);
    const valorCriancaInput = document.querySelector(`input[data-field="valor_crianca"][data-id="${id}"]`);
    const valorFinalInput = document.querySelector(`input[data-field="valor_final"][data-id="${id}"]`);

    const payload = {
      categoria: passeioAtual.categoria,
      local: passeioAtual.local,
      cidade: passeioAtual.cidade,
      estado: passeioAtual.estado,
      descricao: passeioAtual.descricao,
      valor_adulto: parseCurrencyInput(valorAdultoInput.value),
      valor_estudante: parseCurrencyInput(valorEstudanteInput.value),
      valor_crianca: parseCurrencyInput(valorCriancaInput.value),
      valor_final: parseCurrencyInput(valorFinalInput.value),
      data_passeio: passeioAtual.data_passeio,
      roteiro: passeioAtual.roteiro,
      inclui: passeioAtual.inclui,
      locais_embarque: passeioAtual.locais_embarque,
      horarios: passeioAtual.horarios,
      frequencia: passeioAtual.frequencia,
      classificacao: passeioAtual.classificacao,
      informacoes_importantes: passeioAtual.informacoes_importantes
    };

    const response = await fetch(`${API_BASE_URL}/passeios/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || "Não foi possível atualizar os valores.");
    }

    showMessage("success", `Valores do passeio #${id} atualizados com sucesso.`);

    await loadPasseios();
  } catch (error) {
    showMessage("error", error.message);
  }
}

filterCategoria.addEventListener("change", applyFilters);
searchPasseio.addEventListener("input", applyFilters);
clearFiltersBtn.addEventListener("click", clearFilters);

valuesTableBody.addEventListener("click", (event) => {
  const button = event.target.closest('button[data-action="save"]');
  if (!button) return;

  const id = button.dataset.id;
  savePasseioValores(id);
});

window.addEventListener("DOMContentLoaded", loadPasseios);