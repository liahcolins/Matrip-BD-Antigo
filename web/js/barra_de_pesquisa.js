// ====== Carrega e injeta a barra de pesquisa ======
fetch('paginas/barra_de_pesquisa.html')
  .then(r => r.text())
  .then(html => {
    const container = document.getElementById('barra-pesquisa-container');
    container.innerHTML = html;

    // ====== Garante que o CSS está carregado ======
    const cssPath = '/css/barra_de_pesquisa.css';
    if (!document.querySelector(`link[href="${cssPath}"]`)) {
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = cssPath;
      document.head.appendChild(css);
    }

    // ====== Animação fade-in ======
    const barra = container.querySelector('.container');
    if (barra) {
      barra.classList.add('barra-fadein');
      requestAnimationFrame(() => barra.classList.add('show'));
    }

    // ====== Inicializa dropdowns do Bootstrap ======
    const dropdownTriggers = container.querySelectorAll('.dropdown-toggle');
    dropdownTriggers.forEach(trigger => new bootstrap.Dropdown(trigger));

    // ====== Dados de estados e municípios ======
    const estados = {
      "AC": ["Rio Branco", "Cruzeiro do Sul", "Sena Madureira"],
      "AL": ["Maceió", "Arapiraca", "Penedo"],
      "AM": ["Manaus", "Parintins", "Itacoatiara"],
      "AP": ["Macapá", "Santana"],
      "BA": ["Salvador", "Feira de Santana", "Ilhéus", "Itabuna"],
      "CE": ["Fortaleza", "Juazeiro do Norte", "Sobral"],
      "DF": ["Brasília"],
      "ES": ["Vitória", "Vila Velha", "Serra"],
      "GO": ["Goiânia", "Anápolis", "Aparecida de Goiânia"],
      "MA": ["São Luís", "Imperatriz", "Barreirinhas", "Santo Amaro", "Paulino Neves"],
      "MG": ["Belo Horizonte", "Uberlândia", "Ouro Preto"],
      "MS": ["Campo Grande", "Dourados"],
      "MT": ["Cuiabá", "Rondonópolis"],
      "PA": ["Belém", "Santarém", "Marabá"],
      "PB": ["João Pessoa", "Campina Grande"],
      "PE": ["Recife", "Olinda", "Petrolina"],
      "PI": ["Teresina", "Parnaíba"],
      "PR": ["Curitiba", "Londrina", "Maringá"],
      "RJ": ["Rio de Janeiro", "Niterói", "Petrópolis", "Angra dos Reis"],
      "RN": ["Natal", "Mossoró"],
      "RO": ["Porto Velho", "Ji-Paraná"],
      "RR": ["Boa Vista"],
      "RS": ["Porto Alegre", "Caxias do Sul", "Gramado"],
      "SC": ["Florianópolis", "Joinville", "Blumenau"],
      "SE": ["Aracaju", "Lagarto"],
      "SP": ["São Paulo", "Campinas", "Santos", "São José dos Campos"],
      "TO": ["Palmas", "Araguaína"]
    };

    // ====== Referências de elementos ======
    const ufList = container.querySelector('#ufList');
    const municipioList = container.querySelector('#municipioList');
    const ufButton = container.querySelector('#dropdownUF');
    const municipioButton = container.querySelector('#dropdownMunicipio');

    // ====== Preenche lista de UFs ======
    Object.keys(estados).forEach(uf => {
      const li = document.createElement('li');
      li.innerHTML = `<button class="dropdown-item" type="button">${uf}</button>`;
      ufList.appendChild(li);
    });

    // ====== Evento: selecionar UF ======
    ufList.querySelectorAll('.dropdown-item').forEach(item => {
      item.addEventListener('click', e => {
        e.preventDefault(); // 🔥 evita scroll ao topo

        const uf = e.target.textContent;
        ufButton.textContent = uf;
        municipioButton.textContent = "Município";
        municipioList.innerHTML = '';

        // Popula municípios da UF selecionada
        estados[uf].forEach(m => {
          const li = document.createElement('li');
          li.innerHTML = `<button class="dropdown-item" type="button">${m}</button>`;
          municipioList.appendChild(li);
        });

        // Reativa o dropdown dos municípios
        municipioList.querySelectorAll('.dropdown-item').forEach(mItem => {
          mItem.addEventListener('click', ev => {
            ev.preventDefault(); // 🔥 evita scroll também aqui
            municipioButton.textContent = ev.target.textContent;
          });
        });
      });
    });

    console.log("✅ Barra de pesquisa carregada com UFs e municípios!");
    // ====== Botão Buscar ======
    const btnBuscar = container.querySelector('.btn-brand');

    btnBuscar.addEventListener('click', () => {
      const estado = ufButton.textContent;
      const cidade = municipioButton.textContent;

      if (estado === 'UF' || cidade === 'Município') {
        alert('Selecione o estado e o município');
        return;
      }

      buscarPasseios(estado, cidade);
    });
  })
  .catch(err => console.error("❌ Erro ao carregar barra de pesquisa:", err));


function renderizarFlashcards(passeios) {
  const container = document.getElementById('flashcards-container');

  // recria a row (importante pro Bootstrap)
  //container.innerHTML = '<div class="row" id="flashcards-row"></div>'; modifiquei aqui
  //container.innerHTML = '<div class="cards-row" id="flashcards-row" style="flex-wrap: wrap;"></div>';
  container.innerHTML = '<div class="cards-row" id="flashcards-row"></div>';
  const row = document.getElementById('flashcards-row');

  if (!Array.isArray(passeios) || passeios.length === 0) {
    row.innerHTML = `
      <div class="col-12">
        <div class="alert alert-warning text-center">
          😕 Nenhum passeio encontrado para essa região.
        </div>
      </div>
    `;
    return;
  }

  passeios.forEach(p => {
    row.innerHTML += criarFlashcard(p);
  });
}

//modifiquei para ao invés de flashcard, ser apenas card e mais outros detalhes

function criarFlashcard(p) {
  return `
      <div class="card">
        <img 
          src="${p.imagem ? `${API_BASE}/uploads/${p.imagem}` : '/img/padrao.jpg'}"
          class="flashcard-img"
          alt="${p.local}">

        <div class="card-body">
          <h5 class="flashcard-title">${p.local}</h5>
          <p class="flashcard-text">${p.descricao}</p>

          <div class="card-prices">
            <ul>
              <li><i class="fa-solid fa-user"></i> Adultos: <strong>R$ ${p.valor_adulto ?? '-'}</strong></li>
              <li><i class="fa-solid fa-graduation-cap"></i> Estudantes: <strong>R$ ${p.valor_estudante ?? '-'}</strong></li>
              <li><i class="fa-solid fa-child"></i> Crianças: <strong>R$ ${p.valor_crianca ?? '-'}</strong></li>
            </ul>

          <div class="price-highlight">
            <div class="price-text">
              <span>Por apenas</span>
              <strong>R$ ${Number(p.valor_final).toFixed(2).replace('.', ',')}</strong>
            </div>
            <button class="btn-comprar" type="button" onclick="window.location.href='/paginas/detalhes.html?id=${p.id}'">Comprar</button>
          </div>
          </div>
        </div>
      </div>
  `;
}

// tirei esse aqui de dentro do de cima
// <button class="btn btn-brand w-100 mt-2">
//              Comprar
//            </button>

function buscarPasseios(estado, cidade) {
  fetch(`${API_BASE}/api/passeios?estado=${estado}&cidade=${cidade}`)
    .then(res => {
      if (!res.ok) {
        throw new Error('Erro na API');
      }
      return res.json();
    })
    .then(passeios => {
      if (!Array.isArray(passeios)) {
        console.error('Resposta inesperada:', passeios);
        renderizarFlashcards([]);
        return;
      }

      renderizarFlashcards(passeios);
    })
    .catch(err => {
      console.error(err);
      renderizarFlashcards([]);
    });
}


