import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { Ave } from "../../types/Ave";

const DetalleAve = () => {
  const { id } = useParams<{ id: string }>();
  const [ave, setAve] = useState<Ave | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAve = async () => {
      try {
        const res = await api.get<Ave>(`/Aves/${id}`);
        setAve(res.data);
      } catch (error) {
        console.error("Error al cargar detalles del ave", error);
        navigate("/aves");
      }
    };

    fetchAve();
  }, [id, navigate]);

  if (!ave) return <p className="text-center mt-5">Cargando detalles...</p>;

  return (
    <div className="container py-5">
      <button className="btn btn-secondary mb-4" onClick={() => navigate("/aves")}>
        ⬅️ Volver a Aves
      </button>

      <div className="card shadow-sm p-4">
        <img
  src={`https://localhost:7164/api/imagenes/${ave.idAve}`}
  alt={ave.nombre ?? "Imagen de ave"}
  className="img-fluid rounded mb-4"
  style={{ height: "600px", width: "100%", objectFit: "cover" }}
  onError={(e) => {
    e.currentTarget.src = "/imagen-no-disponible.jpg";
  }}
/>

        <h2 className="fw-bold">{ave.nombre}</h2>
        <p>{ave.descripcion}</p>

        <hr />

        <p><strong>Alimentación:</strong> {ave.alimentacion ?? "No disponible"}</p>
        <p><strong>Función en el ecosistema:</strong> {ave.funcionEcos ?? "No disponible"}</p>
        <p><strong>Familia:</strong> {ave.idFamiliaNavigation?.descripcion ?? "No disponible"}</p>
        <p><strong>Categoría:</strong> {ave.idCategoriaNavigation?.descripcion ?? "No disponible"}</p>
        <p><strong>Estatus de Protección:</strong> {ave.idEstatusNavigation?.descripcion ?? "No disponible"}</p>
        <p><strong>Hábitat:</strong> {ave.idHabitatNavigation?.descripcion ?? "No disponible"}</p>
        <p><strong>Fecha de registro:</strong> {ave.fechaRegistro ? new Date(ave.fechaRegistro).toLocaleDateString() : "No disponible"}</p>
        <p><strong>Lista Roja:</strong> {ave.listaRoja ? "Sí" : "No"}</p>
      </div>
    </div>
  );
};

export default DetalleAve;
