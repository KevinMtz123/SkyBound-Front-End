import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { Usuario } from "../../types/Usuario";
import CryptoJS from "crypto-js"; // 👈 Acuérdate de instalarlo si no lo tienes: npm install crypto-js

const LoginPage = () => {
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
  
    try {
      const claveEncriptada = CryptoJS.SHA256(clave).toString(); // 👈 ENCRIPTAR antes de enviar
  
      const response = await api.post<{ token: string; usuario: Usuario }>("/usuarios/login", {
        correo,
        clave: claveEncriptada,
      });
  
      const { token, usuario } = response.data;
  
      localStorage.setItem("token", token);
      localStorage.setItem("usuario", JSON.stringify(usuario));
  
      navigate("/aves"); // 🔵 primero navega a aves
      window.location.reload(); // 🔥 luego recarga la página
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
        setError("Correo o contraseña incorrectos");
      } else {
        console.error(error);
        setError("Error inesperado.");
      }
    }
  };
  

  return (
    <div className="container py-5" style={{ maxWidth: "400px" }}>
      <h2 className="mb-4 text-center">Iniciar sesión</h2>

      <form onSubmit={handleLogin}>
        <div className="form-outline mb-4">
          <input
            type="email"
            className="form-control"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />
          <label className="form-label">Correo</label>
        </div>

        <div className="form-outline mb-4">
          <input
            type="password"
            className="form-control"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            required
          />
          <label className="form-label">Contraseña</label>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <button type="submit" className="btn btn-primary w-100">
          Ingresar
        </button>
      </form>

      
    </div>
  );
};

export default LoginPage;
