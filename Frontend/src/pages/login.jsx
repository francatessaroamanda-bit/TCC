import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");

  async function entrar(e) {
    e.preventDefault();

    setMensagemErro("");

    const emailDigitado = email.trim().toLowerCase();

    if (!emailDigitado || !senha.trim()) {
      setMensagemErro("Preencha todos os campos.");
      return;
    }

    // ==========================================
    // LOGIN DO ADMINISTRADOR
    // ==========================================

    if (
      emailDigitado === "admin@admin.com" &&
      senha === "1234"
    ) {
      sessionStorage.setItem(
        "adminLogado",
        "true"
      );

      sessionStorage.removeItem(
        "usuarioLogado"
      );

      navigate("/", {
        replace: true
      });

      return;
    }

    // ==========================================
    // LOGIN DO CLIENTE
    // ==========================================

    const usuarioSalvo =
      localStorage.getItem(
        "usuarioCadastrado"
      );

    if (!usuarioSalvo) {
      setMensagemErro(
        "Conta não encontrada. Crie sua conta primeiro."
      );

      return;
    }

    try {
      const usuario =
        JSON.parse(usuarioSalvo);

      // ========================================
      // VERIFICAR SE O CLIENTE AINDA EXISTE
      // NO MONGODB
      // ========================================

      const respostaClientes =
        await fetch(
          "http://localhost:5000/api/clientes"
        );

      if (!respostaClientes.ok) {
        setMensagemErro(
          "Não foi possível verificar sua conta."
        );

        return;
      }

      const clientes =
        await respostaClientes.json();

      const clienteEncontrado =
        clientes.find(
          (cliente) =>
            cliente.email.toLowerCase() ===
            emailDigitado
        );

      // ========================================
      // CLIENTE FOI EXCLUÍDO PELO ADMIN
      // ========================================

      if (!clienteEncontrado) {
        localStorage.removeItem(
          "usuarioCadastrado"
        );

        sessionStorage.removeItem(
          "usuarioLogado"
        );

        setMensagemErro(
          "Esta conta não está mais cadastrada. Crie uma nova conta."
        );

        return;
      }

      // ========================================
      // VERIFICAR SENHA
      // ========================================

      if (
        usuario.email.toLowerCase() !==
          emailDigitado ||
        usuario.senha !== senha
      ) {
        setMensagemErro(
          "E-mail ou senha incorretos."
        );

        return;
      }

      // ========================================
      // LOGIN REALIZADO
      // ========================================

      sessionStorage.setItem(
        "usuarioLogado",
        "true"
      );

      sessionStorage.removeItem(
        "adminLogado"
      );

      navigate("/", {
        replace: true
      });
    } catch (error) {
      console.error(error);

      setMensagemErro(
        "Erro ao verificar a conta."
      );
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Mundo Pet</h1>

        <p>
          Entre na sua conta
        </p>

        <form onSubmit={entrar}>
          <input
            type="email"
            placeholder="E-mail"
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

        <div className="criar-conta">
          <p>
            Não possui uma conta?
          </p>

          <Link to="/cadastro">
            Criar conta
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;