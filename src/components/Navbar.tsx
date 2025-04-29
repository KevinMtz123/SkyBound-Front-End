import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Usuario } from "../types/Usuario";

const Navbar = () => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const cargarUsuario = () => {
      const userData = localStorage.getItem("usuario");
      if (userData) {
        setUsuario(JSON.parse(userData));
      } else {
        setUsuario(null);
      }
    };

    // Cada vez que cambia la ruta, intentamos cargar el usuario
    window.addEventListener("storage", cargarUsuario);
    cargarUsuario();

    return () => {
      window.removeEventListener("storage", cargarUsuario);
    };
  }, []);

  const cerrarSesion = () => {
    localStorage.removeItem("usuario");
    setUsuario(null);
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top shadow">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold" to="/aves">SkyBound</Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse justify-content-between" id="navbarNav">
          {/* Navegación izquierda */}
          <ul className="navbar-nav ms-3">
            <li className="nav-item">
              <Link className="nav-link" to="/aves">Inicio</Link>
            </li>
            <li className="nav-item">
                  <Link className="nav-link" to="/aves">Aves</Link>
                </li>
            {usuario && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/categorias">Categorías</Link>
                </li>
                
                <li className="nav-item">
              <Link className="nav-link" to="/estatus">Estatus de Protección</Link>
            </li>
                <li className="nav-item">
              <Link className="nav-link" to="/familias">Familias</Link>
            </li>
                <li className="nav-item">
              <Link className="nav-link" to="/habitats">Habitats</Link>
            </li>
            <li className="nav-item">
                  <Link className="nav-link" to="/register">Registro de Usuarios</Link>
                </li>
              </>
            )}
          </ul>

          {/* Navegación derecha */}
          <ul className="navbar-nav">
            {!usuario ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Login</Link>
                </li>
                
              </>
            ) : (
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                >
                  {usuario.nombres}
                </a>
                <ul className="dropdown-menu dropdown-menu-end dropdown-menu-dark">
                  <li>
                    <button className="dropdown-item" onClick={cerrarSesion}>Cerrar sesión</button>
                  </li>
                </ul>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
