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

  function sair() {

    // Remove o acesso do administrador
    sessionStorage.removeItem("adminLogado");

    // Volta para o login
    navigate("/login", {
      replace: true
    });
  }

  return (
    <aside className="sidebar">

      <div className="logo">
        <h2>Mundo Pet</h2>
      </div>


      <Link to="/">
        <FaHome /> Home
      </Link>


      <Link to="/clientes">
        <FaUsers /> Clientes
      </Link>


      <Link to="/pets">
        <FaDog /> Pets
      </Link>


      <Link to="/agendamentos">
        <FaCalendarAlt /> Agendamentos
      </Link>


      <Link to="/servicos">
        <FaCut /> Serviços
      </Link>


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