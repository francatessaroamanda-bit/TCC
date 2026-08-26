import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");

  function entrar(e) {
    e.preventDefault();

    // Login temporário
    if (usuario === "admin" && senha === "1234") {
      // Registra que o administrador está logado
      sessionStorage.setItem("adminLogado", "true");

      // Vai para a Home
      navigate("/", { replace: true });
    } else {
      alert("Usuário ou senha incorretos!");
    }
  }

  return (
    <div className="login-container">

      <div className="login-card">

        {/* Logo */}
        <div className="login-logo">
          Mundo Pet
        </div>

        <h1>Bem-vindo!</h1>

        <p className="login-subtitle">
          Acesse o sistema de gerenciamento
        </p>

        <form onSubmit={entrar}>

        <p className="login-subtitle" style={{ textAlign: 'left', marginBottom: '6px' }}>
          Usuário
      </p>
        <input
          type="text"
          placeholder="Digite seu usuário"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
        />

          
            <p className="login-subtitle" style={{ textAlign: 'left', marginBottom: '6px' }}>
              Senha
            </p>
            <input
              type="password"
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          

          <button type="submit">
            Entrar
          </button>

        </form>

      </div>

    </div>
  );
}

export default Login;