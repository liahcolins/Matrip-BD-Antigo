// Dados temporários para testar a tela
let allAgencias = [
  { id: 1, razao_social: "Aventuras Maranhão LTDA", nome_fantasia: "Aventuras MA", cnpj: "12.345.678/0001-90", email: "contato@aventuras.com", telefone: "(98) 99999-1111", status: "ativo", passeios_ativos: 12 },
  { id: 2, razao_social: "Lençóis Turismo EIRELI", nome_fantasia: "Lençóis Tour", cnpj: "98.765.432/0001-10", email: "reserva@lencoistour.com", telefone: "(98) 98888-2222", status: "pendente", passeios_ativos: 0 },
  { id: 3, razao_social: "São Luís Histórico SA", nome_fantasia: "SLZ Viagens", cnpj: "45.678.123/0001-55", email: "slz@viagens.com", telefone: "(98) 97777-3333", status: "bloqueado", passeios_ativos: 5 }
];

let filteredAgencias = [...allAgencias];

// Atualiza os cartões lá de cima
function updateMetrics() {
  document.getElementById("metricTotal").textContent = filteredAgencias.length;
  document.getElementById("metricPendentes").textContent = filteredAgencias.filter(a => a.status === 'pendente').length;
  document.getElementById("metricAtivas").textContent = filteredAgencias.filter(a => a.status === 'ativo').length;
}

// Renderiza a lista sanfona
function renderAgencias(data) {
  const listContainer = document.getElementById("agenciasList");
  const emptyState = document.getElementById("emptyState");
  listContainer.innerHTML = "";

  if (!data.length) {
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  data.forEach(ag => {
    const item = document.createElement("div");
    item.className = "list-item";
    item.id = `agencia-${ag.id}`;

    // Define qual botão mostrar baseado no status
    let botoesAcao = '';
    if(ag.status === 'pendente') {
      botoesAcao = `
        <button class="primary-btn btn-approve" onclick="alterarStatus(${ag.id}, 'ativo')">✅ Aprovar Agência</button>
        <button class="primary-btn btn-reject" onclick="alterarStatus(${ag.id}, 'rejeitado')">❌ Rejeitar</button>
      `;
    } else {
      botoesAcao = `
        <button class="primary-btn" onclick="alert('Indo para edição da agência ${ag.id}')">Editar Cadastro</button>
        <button class="primary-btn btn-reject" onclick="alterarStatus(${ag.id}, 'bloqueado')">Bloquear Acesso</button>
      `;
    }

    item.innerHTML = `
      <div class="list-item-header" onclick="toggleAgencia(${ag.id})">
        <strong>#${ag.id}</strong>
        <div>
          <h4>${ag.nome_fantasia}</h4>
          <small>CNPJ: ${ag.cnpj}</small>
        </div>
        <div>
          <span style="display:block; font-size: 14px;">${ag.email}</span>
          <small>${ag.telefone}</small>
        </div>
        <div class="status-badge ${ag.status}">${ag.status}</div>
        <span class="arrow-icon">▼</span>
      </div>

      <div class="list-item-details">
        <div class="agency-details-grid">
          <div class="info-block">
            <h4>Dados da Empresa</h4>
            <p><strong>Razão Social:</strong> ${ag.razao_social}</p>
            <p><strong>CNPJ:</strong> ${ag.cnpj}</p>
            <p><strong>Passeios Cadastrados:</strong> ${ag.passeios_ativos}</p>
          </div>
          <div class="info-block">
            <h4>Contato Principal</h4>
            <p><strong>E-mail:</strong> ${ag.email}</p>
            <p><strong>Telefone:</strong> ${ag.telefone}</p>
          </div>
        </div>
        <div class="action-bar">
          ${botoesAcao}
        </div>
      </div>
    `;
    listContainer.appendChild(item);
  });
}

function toggleAgencia(id) {
  const el = document.getElementById(`agencia-${id}`);
  const isOpen = el.classList.contains('active');
  
  document.querySelectorAll('.list-item').forEach(item => {
    item.classList.remove('active');
    const icon = item.querySelector('.arrow-icon');
    if(icon) icon.textContent = '▼';
  });

  if (!isOpen) {
    el.classList.add('active');
    el.querySelector('.arrow-icon').textContent = '▲';
  }
}

// Simulador de ação de aprovação
function alterarStatus(id, novoStatus) {
  if(confirm(`Deseja alterar o status da agência #${id} para ${novoStatus.toUpperCase()}?`)) {
    const agencia = allAgencias.find(a => a.id === id);
    if(agencia) {
      agencia.status = novoStatus;
      applyFilters(); // Recarrega a tela com o novo status
      alert("Status atualizado com sucesso!");
    }
  }
}

function applyFilters() {
  const status = document.getElementById("filterStatus")?.value.toLowerCase().trim();
  const search = document.getElementById("searchAgencia")?.value.toLowerCase().trim();

  filteredAgencias = allAgencias.filter(a => {
    const matchStatus = !status || a.status.toLowerCase() === status;
    const matchSearch = !search || 
                        a.nome_fantasia.toLowerCase().includes(search) || 
                        a.cnpj.includes(search);
    return matchStatus && matchSearch;
  });

  renderAgencias(filteredAgencias);
  updateMetrics();
}

// Eventos
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById("btnSearch")?.addEventListener("click", applyFilters);
  document.getElementById("searchAgencia")?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") applyFilters();
  });
  document.getElementById("filterStatus")?.addEventListener("change", applyFilters);
  document.getElementById("clearFiltersBtn")?.addEventListener("click", () => {
    document.getElementById("searchAgencia").value = "";
    document.getElementById("filterStatus").value = "";
    applyFilters();
  });

  // Carrega a tela pela primeira vez
  renderAgencias(allAgencias);
  updateMetrics();
});