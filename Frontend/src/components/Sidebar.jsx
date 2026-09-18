import { Link, useNavigate } from "react-router-dom";

import {
  FaHome,
  FaUsers,
  FaDog,
  FaCalendarAlt,
  FaCut
} from "react-icons/fa";

function Sidebar() {
  const navigate = useNavigate();

  const adminLogado =
    sessionStorage.getItem("adminLogado") === "true";

  function sair() {
    // Remove o acesso do administrador
    sessionStorage.removeItem("adminLogado");

    // Remove o acesso do cliente
    sessionStorage.removeItem("usuarioLogado");

    // Volta para o único login
    navigate("/login", {
      replace: true
    });
  }

  return (
    <aside className="sidebar">

      {/* LOGO */}

      <div className="logo">
        <h2>Mundo Pet</h2>
      </div>

      {/* HOME */}

      <Link to="/">
        <FaHome /> Home
      </Link>

      {/* CLIENTES - SOMENTE ADMIN */}

      {adminLogado && (
        <Link to="/clientes">
          <FaUsers /> Clientes
        </Link>
      )}

      {/* PETS */}

      <Link to="/pets">
        <FaDog /> Pets
      </Link>

      {/* AGENDAMENTOS */}

      <Link to="/agendamentos">
        <FaCalendarAlt /> Agendamentos
      </Link>

      {/* SERVIÇOS */}

      <Link to="/servicos">
        <FaCut /> Serviços
      </Link>

      {/* SAIR */}

      <button
        className="logout"
        onClick={sair}
      >
        Sair
      </button>

    </aside>
  );
}

export default Sidebar;