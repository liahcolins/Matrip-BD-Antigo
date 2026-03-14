const API_BASE_URL = "http://localhost:3000";

// Elementos da Interface
const passeiosGrid = document.getElementById("passeiosGrid");
const emptyState = document.getElementById("emptyState");
const messageBox = document.getElementById("messageBox");

// Filtros
const filterCategoria = document.getElementById("filterCategoria");
const filterCidade = document.getElementById("filterCidade");
const searchPasseio = document.getElementById("searchPasseio");
const clearFiltersBtn = document.getElementById("clearFiltersBtn");

// Métricas
const metricTotal = document.getElementById("metricTotal");
const metricCategorias = document.getElementById("metricCategorias");
const metricCidades = document.getElementById("metricCidades");
const metricPrecoMedio = document.getElementById("metricPrecoMedio");

let allPasseios = [];
let filteredPasseios = [];

// --- FUNÇÕES DE AUXÍLIO ---

function showMessage(type, text) {
  if (!messageBox) return;
  messageBox.className = `message-box ${type}`;
  messageBox.textContent = text;
  setTimeout(() => messageBox.className = "message-box hidden", 5000);
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function buildImageUrl(imageName) {
  if (!imageName) return "../../logo-matrip-oficial-01.png";
  if (imageName.startsWith("http")) return imageName;
  return `${API_BASE_URL}/uploads/${imageName.replace('/uploads/', '')}`;
}

function truncateText(text, maxLength = 100) {
  if (!text) return "Sem descrição.";
  return text.length <= maxLength ? text : text.slice(0, maxLength) + "...";
}

// --- LÓGICA DE DADOS ---

function updateMetrics(data) {
  if (!metricTotal) return;
  
  metricTotal.textContent = data.length;

  const categorias = new Set(data.map(p => (p.categoria || "").trim()).filter(Boolean));
  const cidades = new Set(data.map(p => (p.cidade || "").trim()).filter(Boolean));
  const totalValores = data.reduce((acc, p) => acc + Number(p.valor_final || 0), 0);
  const media = data.length ? totalValores / data.length : 0;

  if (metricCategorias) metricCategorias.textContent = categorias.size;
  if (metricCidades) metricCidades.textContent = cidades.size;
  if (metricPrecoMedio) metricPrecoMedio.textContent = formatCurrency(media);
}

function renderPasseios(data) {
  // Alterado para buscar o ID da lista
  const listContainer = document.getElementById("passeiosList");
  listContainer.innerHTML = "";

  if (!data.length) {
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  data.forEach(p => {
    const item = document.createElement("div");
    item.className = "list-item";
    item.id = `passeio-${p.id}`;

    // Esta é a estrutura que o seu CSS novo reconhece
    item.innerHTML = `
      <div class="list-item-header" onclick="togglePasseio(${p.id})">
        <img src="${buildImageUrl(p.imagem)}" class="mini-thumb" onerror="this.src='../../logo-matrip-oficial-01.png'">
        <div>
          <h4>${p.local}</h4>
          <small>${p.categoria || 'Geral'}</small>
        </div>
        <span>📍 ${p.cidade || '--'}</span>
        <strong style="color: #11c5b6">${formatCurrency(p.valor_final)}</strong>
        <span class="arrow-icon">▼</span>
      </div>

      <div class="list-item-details">
        <div class="details-grid">
          <img src="${buildImageUrl(p.imagem)}" class="details-img-large" onerror="this.src='../../logo-matrip-oficial-01.png'">
          <div>
            <h3>Detalhes do Passeio #${p.id}</h3>
            <p><strong>Descrição:</strong> ${p.descricao || 'Sem descrição.'}</p>
            <p><strong>Estado:</strong> ${p.estado || '--'}</p>
            
            <div style="margin-top: 20px; display: flex; gap: 10px;">
              <button class="primary-btn" onclick="window.location.href='../detalhes.html?id=${p.id}'">Ver no Site</button>
              <button class="secondary-btn" style="background: #fee2e2; color: #b91c1c; border-color: #fecaca;" onclick="excluirPasseioAdmin(${p.id})">Remover Sistema</button>
            </div>
          </div>
        </div>
      </div>
    `;
    listContainer.appendChild(item);
  });
}

// ADICIONE ESTA FUNÇÃO PARA FAZER O CLIQUE FUNCIONAR
function togglePasseio(id) {
  const el = document.getElementById(`passeio-${id}`);
  
  // Verifica se já está aberto
  const isOpen = el.classList.contains('active');
  
  // Fecha todos os outros (opcional, deixa mais organizado)
  document.querySelectorAll('.list-item').forEach(item => {
    item.classList.remove('active');
    const icon = item.querySelector('.arrow-icon');
    if(icon) icon.textContent = '▼';
  });

  // Se não estava aberto, abre este
  if (!isOpen) {
    el.classList.add('active');
    el.querySelector('.arrow-icon').textContent = '▲';
  }
}

// --- FILTROS ---

// A FUNÇÃO DE FILTRAR (Reforçada)
function applyFilters() {
  const cat = (document.getElementById("filterCategoria")?.value || "").toLowerCase().trim();
  const cid = (document.getElementById("filterCidade")?.value || "").toLowerCase().trim();
  const search = (document.getElementById("searchPasseio")?.value || "").toLowerCase().trim();

  filteredPasseios = allPasseios.filter(p => {
    const pCat = (p.categoria || "").toLowerCase();
    const pCid = (p.cidade || "").toLowerCase();
    const pLocal = (p.local || "").toLowerCase();
    const pDesc = (p.descricao || "").toLowerCase();

    const matchCat = !cat || pCat === cat;
    const matchCid = !cid || pCid.includes(cid);
    const matchSearch = !search || pLocal.includes(search) || pDesc.includes(search);

    return matchCat && matchCid && matchSearch;
  });

  renderPasseios(filteredPasseios);
  updateMetrics(filteredPasseios);
}

// OS EVENTOS (Para a lupa e o Enter funcionarem)
document.addEventListener('DOMContentLoaded', () => {
  const btnSearch = document.getElementById("btnSearch");
  const inputSearch = document.getElementById("searchPasseio");

  // Clique na lupa
  btnSearch?.addEventListener("click", applyFilters);

  // Aperta Enter no teclado
  inputSearch?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") applyFilters();
  });

  // Filtros automáticos de clique
  document.getElementById("filterCategoria")?.addEventListener("change", applyFilters);
  document.getElementById("filterCidade")?.addEventListener("input", applyFilters);
});

// --- CARREGAMENTO INICIAL ---

async function loadPasseios() {
  try {
    const response = await fetch(`${API_BASE_URL}/passeios`);
    if (!response.ok) throw new Error("Erro ao carregar banco de dados.");

    allPasseios = await response.json();
    filteredPasseios = [...allPasseios];

    renderPasseios(allPasseios);
    updateMetrics(allPasseios);
  } catch (error) {
    showMessage("error", error.message);
  }
}

// --- AÇÕES DE ADMIN ---

async function excluirPasseioAdmin(id) {
  if (!confirm(`ADMIN: Deseja realmente REMOVER o passeio #${id} do sistema? Esta ação é irreversível.`)) return;

  try {
    const res = await fetch(`${API_BASE_URL}/passeios/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showMessage("success", "Passeio removido com sucesso!");
      loadPasseios(); // Recarrega a lista
    } else {
      throw new Error("Erro ao excluir o passeio.");
    }
  } catch (err) {
    showMessage("error", err.message);
  }
}

// Eventos
//filterCategoria?.addEventListener("change", applyFilters);
//filterCidade?.addEventListener("input", applyFilters);
//searchPasseio?.addEventListener("input", applyFilters);
//clearFiltersBtn?.addEventListener("click", () => {
//  filterCategoria.value = "";
//  filterCidade.value = "";
//  searchPasseio.value = "";
//  applyFilters();
//});

window.addEventListener("DOMContentLoaded", loadPasseios);