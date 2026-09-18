import { useState } from "react";
import {
  Link,
  useNavigate
} from "react-router-dom";

function Cadastro() {
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [mensagemErro, setMensagemErro] =
    useState("");

  const [mensagemSucesso, setMensagemSucesso] =
    useState("");

  async function cadastrar(e) {
    e.preventDefault();

    setMensagemErro("");
    setMensagemSucesso("");

    // ==============================
    // VALIDAR CAMPOS
    // ==============================

    if (
      !nome.trim() ||
      !telefone.trim() ||
      !email.trim() ||
      !senha.trim() ||
      !confirmarSenha.trim()
    ) {
      setMensagemErro(
        "Preencha todos os campos."
      );
      return;
    }

    // ==============================
    // CONFIRMAR SENHA
    // ==============================

    if (senha !== confirmarSenha) {
      setMensagemErro(
        "As senhas não são iguais."
      );
      return;
    }

    try {
      // ==============================
      // CADASTRAR CLIENTE NO MONGODB
      // ==============================

      const resposta = await fetch(
        "http://localhost:5000/api/clientes",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            nome: nome.trim(),
            telefone: telefone.trim(),
            email: email.trim()
          })
        }
      );

      const dados = await resposta.json();

      // ==============================
      // ERRO NO CADASTRO
      // ==============================

      if (!resposta.ok) {
        setMensagemErro(
          dados.mensagem ||
          "Não foi possível criar a conta."
        );

        return;
      }

      // ==============================
      // SALVAR DADOS DA CONTA
      // ==============================

      const usuario = {
        nome: nome.trim(),
        telefone: telefone.trim(),
        email: email.trim(),
        senha
      };

      localStorage.setItem(
        "usuarioCadastrado",
        JSON.stringify(usuario)
      );

      // ==============================
      // SUCESSO
      // ==============================

      setMensagemSucesso(
        "Conta criada com sucesso!"
      );

      setTimeout(() => {
        navigate("/login");
      }, 1000);

    } catch (error) {
      console.error(
        "Erro ao cadastrar:",
        error
      );

      setMensagemErro(
        "Não foi possível conectar ao servidor."
      );
    }
  }

  return (
    <div className="login-container">

      <div className="login-card">

        <h1>Mundo Pet</h1>

        <p>
          Crie sua conta de cliente
        </p>

        <form onSubmit={cadastrar}>

          {/* NOME */}

          <input
            type="text"
            placeholder="Nome"
            value={nome}
            onChange={(e) => {
              setMensagemErro("");
              setMensagemSucesso("");
              setNome(e.target.value);
            }}
          />

          {/* TELEFONE */}

          <input
            type="text"
            placeholder="Telefone"
            value={telefone}
            onChange={(e) => {
              setMensagemErro("");
              setMensagemSucesso("");
              setTelefone(e.target.value);
            }}
          />

          {/* E-MAIL */}

          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => {
              setMensagemErro("");
              setMensagemSucesso("");
              setEmail(e.target.value);
            }}
          />

          {/* SENHA */}

          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => {
              setMensagemErro("");
              setMensagemSucesso("");
              setSenha(e.target.value);
            }}
          />

          {/* CONFIRMAR SENHA */}

          <input
            type="password"
            placeholder="Confirmar senha"
            value={confirmarSenha}
            onChange={(e) => {
              setMensagemErro("");
              setMensagemSucesso("");
              setConfirmarSenha(e.target.value);
            }}
          />

          {/* MENSAGEM DE ERRO */}

          {mensagemErro && (
            <p className="mensagem-erro">
              {mensagemErro}
            </p>
          )}

          {/* MENSAGEM DE SUCESSO */}

          {mensagemSucesso && (
            <p className="mensagem-sucesso">
              {mensagemSucesso}
            </p>
          )}

          <button type="submit">
            Criar conta
          </button>

        </form>

        <div className="criar-conta">

          <p>
            Já possui uma conta?
          </p>

          <Link to="/login">
            Voltar para o login
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Cadastro;