import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Sidebar from "./components/Sidebar";

import Home from "./pages/Home";
import HomeCliente from "./pages/HomeCliente";

import Clientes from "./pages/Clientes";
import Pets from "./pages/Pets";
import PetsCliente from "./pages/PetsCliente";
import Agendamentos from "./pages/Agendamentos";
import AgendamentosCliente from "./pages/AgendamentosCliente";
import Servicos from "./pages/Servicos";

import Login from "./pages/login";
import Cadastro from "./pages/Cadastro";


// =========================================
// PROTEÇÃO DAS ROTAS
// =========================================

function RotaProtegida({ children }) {

  const usuarioLogado =
    sessionStorage.getItem("usuarioLogado") === "true";

  const adminLogado =
    sessionStorage.getItem("adminLogado") === "true";

  if (!usuarioLogado && !adminLogado) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}


// =========================================
// LAYOUT DO SISTEMA
// =========================================

function LayoutProtegido() {

  const usuarioLogado =
    sessionStorage.getItem("usuarioLogado") === "true";

  const adminLogado =
    sessionStorage.getItem("adminLogado") === "true";


  return (
    <div className="layout">

      <Sidebar />

      <main className="content">

        <Routes>

          {/* ==============================
              HOME
          ============================== */}

          <Route
            path="/"
            element={
              usuarioLogado
                ? <HomeCliente />
                : <Home />
            }
          />


          {/* ==============================
              CLIENTES
              SOMENTE ADMIN
          ============================== */}

          <Route
            path="/clientes"
            element={
              adminLogado
                ? <Clientes />
                : <Navigate
                    to="/"
                    replace
                  />
            }
          />


          {/* ==============================
              PETS
          ============================== */}

          <Route
            path="/pets"
            element={
              usuarioLogado
                ? <PetsCliente />
                : <Pets />
            }
          />


          {/* ==============================
              AGENDAMENTOS
          ============================== */}

          <Route
            path="/agendamentos"
            element={
              usuarioLogado
                ? <AgendamentosCliente />
                : <Agendamentos />
            }
          />


          {/* ==============================
              SERVIÇOS
              ADMIN GERENCIA
              CLIENTE VISUALIZA
          ============================== */}

          <Route
            path="/servicos"
            element={
              <Servicos />
            }
          />

        </Routes>

      </main>

    </div>
  );
}


// =========================================
// APP
// =========================================

function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* ==============================
            LOGIN ÚNICO
        ============================== */}

        <Route
          path="/login"
          element={
            <Login />
          }
        />


        {/* ==============================
            CADASTRO DE CLIENTE
        ============================== */}

        <Route
          path="/cadastro"
          element={
            <Cadastro />
          }
        />


        {/* ==============================
            SISTEMA PROTEGIDO
        ============================== */}

        <Route
          path="/*"
          element={
            <RotaProtegida>
              <LayoutProtegido />
            </RotaProtegida>
          }
        />

      </Routes>

    </BrowserRouter>

  );
}

export default App;