const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Preencha todos os campos");
    return;
  }

  try {
    const resposta = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      alert(dados.error || "Erro ao fazer login");
      return;
    }

    // salva dados do usuário
    localStorage.setItem("usuario", JSON.stringify(dados));
    localStorage.setItem("tipo", dados.tipo);














    // 🔁 REDIRECT APÓS LOGIN (corrigido)
    // 🔁 REDIRECIONAMENTO POR TIPO DE USUÁRIO
    // Temporariamente, usuários do tipo "guia" acessarão o dashboard do parceiro.
    // Isso será revisado caso o professor aprove um tipo específico "parceiro" no banco.
const redirect = localStorage.getItem("redirectAfterLogin");

if (redirect) {
  localStorage.removeItem("redirectAfterLogin");
  window.location.href = redirect;
} else {

  const tipo = (dados.tipo || "").toLowerCase();

  if (tipo === "admin") {
    window.location.href = "/paginas/admin/index.html";
    return;
  }

  // TEMPORÁRIO: guia acessa painel parceiro
  if (tipo === "guia") {
    window.location.href = "/paginas/parceiro/index.html";
    return;
  }

  // usuário comum (turista)
  window.location.href = "/index.html";
}

















  } catch (error) {
    console.error(error);
    alert("Erro ao conectar com o servidor");
  }
});

// ==============================
// LOGIN COM GOOGLE
// ==============================
const googleBtn = document.getElementById("googleLoginBtn");

if (googleBtn) {
  googleBtn.addEventListener("click", () => {
    window.location.href = "http://localhost:3000/auth/google";
  });
}

// ==============================
// LOGIN COM FACEBOOK
// ==============================
const facebookBtn = document.getElementById("facebookLoginBtn");

if (facebookBtn) {
  facebookBtn.addEventListener("click", () => {
    window.location.href = "http://localhost:3000/auth/facebook";
  });
}
