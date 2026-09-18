import { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginAdmin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");

  function entrar(e) {
    e.preventDefault();

    setMensagemErro("");

    if (!email.trim() || !senha.trim()) {
      setMensagemErro("Preencha todos os campos.");
      return;
    }

    // Dados do administrador
    if (
      email.trim() !== "admin" ||
      senha !== "1234"
    ) {
      setMensagemErro(
        "E-mail ou senha de administrador incorretos."
      );
      return;
    }

    sessionStorage.setItem(
      "adminLogado",
      "true"
    );

    sessionStorage.removeItem("usuarioLogado");

    navigate("/", {
      replace: true
    });
  }

  return (
    <div className="login-container">
      <div className="login-card">

        <h1>Mundo Pet</h1>

        <p>
          Acesso do administrador
        </p>

        <form onSubmit={entrar}>

          <input
            type="email"
            placeholder="E-mail do administrador"
            value={email}
            onChange={(e) => {
              setMensagemErro("");
              setEmail(e.target.value);
            }}
          />

          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => {
              setMensagemErro("");
              setSenha(e.target.value);
            }}
          />

          {mensagemErro && (
            <p className="mensagem-erro">
              {mensagemErro}
            </p>
          )}

          <button type="submit">
            Entrar
          </button>

        </form>

        <div className="voltar-acesso">

          <button
            type="button"
            onClick={() => navigate("/login-escolha")}
          >
            Voltar
          </button>

        </div>

      </div>
    </div>
  );
}

export default LoginAdmin;