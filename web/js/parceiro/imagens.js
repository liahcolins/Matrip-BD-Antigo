const API_BASE_URL = "http://localhost:3000";

const passeioSelect = document.getElementById("passeioSelect");
const reloadGalleryBtn = document.getElementById("reloadGalleryBtn");
const uploadForm = document.getElementById("uploadForm");
const imageFilesInput = document.getElementById("imageFiles");

const messageBox = document.getElementById("messageBox");
const previewList = document.getElementById("previewList");
const galleryGrid = document.getElementById("galleryGrid");

const emptyState = document.getElementById("emptyState");
const passeioSummary = document.getElementById("passeioSummary");
const uploadPanel = document.getElementById("uploadPanel");
const galleryPanel = document.getElementById("galleryPanel");

const summaryTitle = document.getElementById("summaryTitle");
const summarySubtitle = document.getElementById("summarySubtitle");
const summaryCategoria = document.getElementById("summaryCategoria");
const summaryDescription = document.getElementById("summaryDescription");

let passeios = [];
let currentPasseioId = "";

function showMessage(type, text) {
  messageBox.className = `message-box ${type}`;
  messageBox.textContent = text;
}

function clearMessage() {
  messageBox.className = "message-box hidden";
  messageBox.textContent = "";
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

function toggleContent(hasPasseio) {
  if (hasPasseio) {
    emptyState.classList.add("hidden");
    passeioSummary.classList.remove("hidden");
    uploadPanel.classList.remove("hidden");
    galleryPanel.classList.remove("hidden");
    return;
  }

  emptyState.classList.remove("hidden");
  passeioSummary.classList.add("hidden");
  uploadPanel.classList.add("hidden");
  galleryPanel.classList.add("hidden");
}

function populatePasseioSelect(data) {
  passeioSelect.innerHTML = `<option value="">Selecione um passeio</option>`;

  data.forEach((passeio) => {
    const option = document.createElement("option");
    option.value = passeio.id;
    option.textContent = `${passeio.local || "Passeio"} — ${passeio.cidade || "--"}/${passeio.estado || "--"}`;
    passeioSelect.appendChild(option);
  });
}

function renderPreview(files) {
  previewList.innerHTML = "";

  if (!files || !files.length) return;

  Array.from(files).forEach((file) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const card = document.createElement("div");
      card.className = "preview-card";

      card.innerHTML = `
        <img src="${event.target.result}" alt="${file.name}" />
        <span>${file.name}</span>
      `;

      previewList.appendChild(card);
    };

    reader.readAsDataURL(file);
  });
}

function renderSummary(passeio) {
  summaryTitle.textContent = passeio.local || "Passeio sem nome";
  summarySubtitle.textContent = `${passeio.cidade || "--"} / ${passeio.estado || "--"}`;
  summaryCategoria.textContent = passeio.categoria || "Sem categoria";
  summaryDescription.textContent = passeio.descricao || "Sem descrição disponível.";
}

function renderGallery(imagens) {
  galleryGrid.innerHTML = "";

  if (!imagens || !imagens.length) {
    galleryGrid.innerHTML = `
      <div class="gallery-card">
        <img src="../../logo-matrip-oficial-01.png" alt="Sem imagens" />
        <div class="gallery-caption">Este passeio ainda não possui imagens cadastradas.</div>
      </div>
    `;
    return;
  }

  imagens.forEach((imagem) => {
    const caminho = typeof imagem === "string" ? imagem : imagem.caminho;
    const imageUrl = buildImageUrl(caminho);

    const card = document.createElement("div");
    card.className = "gallery-card";

    card.innerHTML = `
      <img src="${imageUrl}" alt="Imagem do passeio" onerror="this.src='../../logo-matrip-oficial-01.png'" />
      <div class="gallery-caption">${caminho}</div>
    `;

    galleryGrid.appendChild(card);
  });
}

async function loadPasseios() {
  clearMessage();

  try {
    const response = await fetch(`${API_BASE_URL}/passeios`);

    if (!response.ok) {
      throw new Error("Não foi possível carregar a lista de passeios.");
    }

    const data = await response.json();
    passeios = Array.isArray(data) ? data : [];

    populatePasseioSelect(passeios);
    toggleContent(false);
  } catch (error) {
    showMessage("error", error.message);
  }
}

async function loadPasseioDetalhes(id) {
  clearMessage();

  try {
    const response = await fetch(`${API_BASE_URL}/passeios/${id}/detalhes`);

    if (!response.ok) {
      throw new Error("Não foi possível carregar a galeria do passeio.");
    }

    const passeio = await response.json();

    renderSummary(passeio);
    renderGallery(passeio.imagens || []);
    toggleContent(true);
  } catch (error) {
    showMessage("error", error.message);
    toggleContent(false);
  }
}

async function uploadImages(event) {
  event.preventDefault();
  clearMessage();

  if (!currentPasseioId) {
    showMessage("error", "Selecione um passeio antes de enviar imagens.");
    return;
  }

  const files = imageFilesInput.files;

  if (!files || !files.length) {
    showMessage("error", "Selecione pelo menos uma imagem.");
    return;
  }

  try {
    const passeioResponse = await fetch(`${API_BASE_URL}/passeios/${currentPasseioId}`);
    if (!passeioResponse.ok) {
      throw new Error("Não foi possível obter os dados do passeio.");
    }

    const passeio = await passeioResponse.json();

    const formData = new FormData();
    formData.append("categoria", passeio.categoria || "");
    formData.append("local", passeio.local || "");
    formData.append("cidade", passeio.cidade || "");
    formData.append("estado", passeio.estado || "");
    formData.append("descricao", passeio.descricao || "");
    formData.append("valor_adulto", passeio.valor_adulto || "");
    formData.append("valor_estudante", passeio.valor_estudante || "");
    formData.append("valor_crianca", passeio.valor_crianca || "");
    formData.append("valor_final", passeio.valor_final || "");
    formData.append("data_passeio", passeio.data_passeio || "");
    formData.append("roteiro", passeio.roteiro || "");
    formData.append("inclui", passeio.inclui || "");
    formData.append("locais_embarque", passeio.locais_embarque || "");
    formData.append("horarios", passeio.horarios || "");
    formData.append("frequencia", passeio.frequencia || "");
    formData.append("classificacao", passeio.classificacao || "");
    formData.append("informacoes_importantes", passeio.informacoes_importantes || "");

    Array.from(files).forEach((file) => {
      formData.append("imagens", file);
    });

    const response = await fetch(`${API_BASE_URL}/passeios/${currentPasseioId}`, {
      method: "PUT",
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || "Não foi possível enviar as imagens.");
    }

    showMessage("success", "Imagens enviadas com sucesso.");
    imageFilesInput.value = "";
    previewList.innerHTML = "";

    await loadPasseioDetalhes(currentPasseioId);
  } catch (error) {
    showMessage("error", error.message);
  }
}

passeioSelect.addEventListener("change", async (event) => {
  currentPasseioId = event.target.value;

  if (!currentPasseioId) {
    toggleContent(false);
    galleryGrid.innerHTML = "";
    previewList.innerHTML = "";
    return;
  }

  await loadPasseioDetalhes(currentPasseioId);
});

reloadGalleryBtn.addEventListener("click", async () => {
  if (!currentPasseioId) {
    showMessage("error", "Selecione um passeio para atualizar a galeria.");
    return;
  }

  await loadPasseioDetalhes(currentPasseioId);
});

imageFilesInput.addEventListener("change", () => {
  renderPreview(imageFilesInput.files);
});

uploadForm.addEventListener("submit", uploadImages);

window.addEventListener("DOMContentLoaded", loadPasseios);