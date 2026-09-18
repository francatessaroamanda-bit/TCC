import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Sidebar from "./components/Sidebar";

import Home from "./pages/Home";
import Clientes from "./pages/Clientes";
import Pets from "./pages/Pets";
import Agendamentos from "./pages/Agendamentos";
import Servicos from "./pages/Servicos";
import Login from "./pages/Login";


// ==========================================
// ROTA PROTEGIDA
// ==========================================

function RotaProtegida({ children }) {
  const estaLogado =
    sessionStorage.getItem("adminLogado") === "true";

  if (!estaLogado) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}


// ==========================================
// LAYOUT DO SISTEMA
// ==========================================

function LayoutProtegido() {
  return (
    <div className="layout">

      <Sidebar />

      <main className="content">

        <Routes>

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/clientes"
            element={<Clientes />}
          />

          <Route
            path="/pets"
            element={<Pets />}
          />

          <Route
            path="/agendamentos"
            element={<Agendamentos />}
          />

          <Route
            path="/servicos"
            element={<Servicos />}
          />

        </Routes>

      </main>

    </div>
  );
}


// ==========================================
// APP
// ==========================================

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* ================================
            LOGIN
        ================================= */}

        <Route
          path="/login"
          element={<Login />}
        />


        {/* ================================
            ÁREA PROTEGIDA
        ================================= */}

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

