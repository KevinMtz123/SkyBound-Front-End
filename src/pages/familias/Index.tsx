import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Familium } from "../../types/Familium";
import api from "../../services/api";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Toast from "react-bootstrap/Toast";
import ToastContainer from "react-bootstrap/ToastContainer";

const FamiliumIndex = () => {
  const [familias, setFamilias] = useState<Familium[]>([]);
  const [modalShow, setModalShow] = useState(false);
  const [modalEditShow, setModalEditShow] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const [familiaEditar, setFamiliaEditar] = useState<Familium | null>(null);
  const [familiaSeleccionada, setFamiliaSeleccionada] = useState<Familium | null>(null);

  const [nuevaFamilia, setNuevaFamilia] = useState<Omit<Familium, "idFamilia" | "fechaRegistro" | "aves">>({
    descripcion: "",
    activo: true,
  });

  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usuarioLogueado, setUsuarioLogueado] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const usuario = localStorage.getItem("usuario");
    if (!usuario) {
      setUsuarioLogueado(false);
      // Opcionalmente redirigir
      // navigate("/login");
    } else {
      setUsuarioLogueado(true);
      cargarFamilias();
    }
  }, [navigate]);

  const cargarFamilias = async () => {
    try {
      const response = await api.get<Familium[]>("/Familiums");
      setFamilias(response.data);
    } catch (error) {
      console.error("Error al cargar familias", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(null);
    setError(null);

    try {
      await api.post("/Familiums", nuevaFamilia);
      setMensaje("✅ Familia agregada correctamente");

      setTimeout(() => {
        setModalShow(false);
        setNuevaFamilia({ descripcion: "", activo: true });
        cargarFamilias();
      }, 1000);
    } catch (error) {
      console.error(error);
      setError("❌ Error al guardar familia.");
    }
  };

  const handleOpenEditModal = (fam: Familium) => {
    setFamiliaEditar(fam);
    setModalEditShow(true);
  };

  const handleUpdateFamilia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!familiaEditar) return;

    try {
      await api.put(`/Familiums/${familiaEditar.idFamilia}`, familiaEditar);
      setModalEditShow(false);
      setFamiliaEditar(null);
      cargarFamilias();
    } catch (error) {
      console.error("Error al actualizar familia", error);
    }
  };

  const handleShowDeleteModal = (fam: Familium) => {
    setFamiliaSeleccionada(fam);
    setShowDeleteModal(true);
  };

  const handleDeleteFamilia = async () => {
    if (!familiaSeleccionada) return;

    try {
      await api.delete(`/Familiums/${familiaSeleccionada.idFamilia}`);
      setShowDeleteModal(false);
      setFamiliaSeleccionada(null);
      cargarFamilias();
      setShowToast(true);
    } catch (error) {
      console.error("Error al eliminar familia", error);
    }
  };

  if (!usuarioLogueado) {
    return (
      <div className="container mt-5 text-center">
        <h2 className="text-danger">Acceso denegado 🚫</h2>
        <p>Debes iniciar sesión para ver esta sección.</p>
      </div>
    );
  }

  return (
    <div className="container mt-5 d-flex flex-column align-items-center">
      <h2 className="mb-4 text-center fw-bold display-6">
        Lista de Familias de Aves 🐦
      </h2>

      <Button
        variant="outline-primary"
        onClick={() => setModalShow(true)}
        className="mb-4 fw-semibold"
      >
        + Agregar Nueva Familia
      </Button>

      <div className="table-responsive w-100 d-flex justify-content-center">
        <div className="shadow-sm rounded-4 overflow-hidden" style={{ maxWidth: "1000px", width: "100%" }}>
          <table className="table table-hover align-middle mb-0 bg-white">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th>Registrado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {familias.map((fam, index) => (
                <tr key={fam.idFamilia} className="border-bottom">
                  <td className="text-muted">{index + 1}</td>
                  <td className="fw-semibold">{fam.descripcion ?? "Sin descripción"}</td>
                  <td>
                    {fam.activo ? (
                      <span className="badge rounded-pill bg-success-subtle text-success px-3 py-1">
                        Activo
                      </span>
                    ) : (
                      <span className="badge rounded-pill bg-danger-subtle text-danger px-3 py-1">
                        Inactivo
                      </span>
                    )}
                  </td>
                  <td className="text-muted">
                    {fam.fechaRegistro
                      ? new Date(fam.fechaRegistro).toLocaleDateString()
                      : "Sin fecha"}
                  </td>
                  <td>
                    <Button
                      variant="outline-warning"
                      size="sm"
                      className="fw-bold me-2"
                      onClick={() => handleOpenEditModal(fam)}
                    >
                      ✏️ Editar
                    </Button>

                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="fw-bold"
                      onClick={() => handleShowDeleteModal(fam)}
                    >
                      🗑️ Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modales y Toast */}
      {/* Modal Agregar */}
      <Modal show={modalShow} onHide={() => setModalShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Nueva Familia</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Container>
            <Row>
              <Col>
                <form onSubmit={handleSubmit}>
                  <div className="form-outline mb-3">
                    <input
                      type="text"
                      className="form-control"
                      value={nuevaFamilia.descripcion ?? ""}
                      onChange={(e) =>
                        setNuevaFamilia({ ...nuevaFamilia, descripcion: e.target.value })
                      }
                      required
                    />
                    <label className="form-label">Descripción</label>
                  </div>

                  <div className="form-check form-switch mb-4">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="activoSwitch"
                      checked={nuevaFamilia.activo ?? true}
                      onChange={(e) =>
                        setNuevaFamilia({ ...nuevaFamilia, activo: e.target.checked })
                      }
                    />
                    <label className="form-check-label" htmlFor="activoSwitch">
                      Activo
                    </label>
                  </div>

                  {mensaje && <div className="alert alert-success">{mensaje}</div>}
                  {error && <div className="alert alert-danger">{error}</div>}

                  <button type="submit" className="btn btn-success w-100">
                    Guardar Familia
                  </button>
                </form>
              </Col>
            </Row>
          </Container>
        </Modal.Body>
      </Modal>

      {/* Modal Editar */}
      <Modal show={modalEditShow} onHide={() => setModalEditShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Editar Familia</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Container>
            <Row>
              <Col>
                {familiaEditar && (
                  <form onSubmit={handleUpdateFamilia}>
                    <div className="form-outline mb-3">
                      <input
                        type="text"
                        className="form-control"
                        value={familiaEditar.descripcion ?? ""}
                        onChange={(e) =>
                          setFamiliaEditar({ ...familiaEditar, descripcion: e.target.value })
                        }
                        required
                      />
                      <label className="form-label">Descripción</label>
                    </div>

                    <div className="form-check form-switch mb-4">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="activoSwitchEdit"
                        checked={familiaEditar.activo ?? true}
                        onChange={(e) =>
                          setFamiliaEditar({ ...familiaEditar, activo: e.target.checked })
                        }
                      />
                      <label className="form-check-label" htmlFor="activoSwitchEdit">
                        Activo
                      </label>
                    </div>

                    <button type="submit" className="btn btn-primary w-100">
                      Guardar Cambios
                    </button>
                  </form>
                )}
              </Col>
            </Row>
          </Container>
        </Modal.Body>
      </Modal>

      {/* Modal Confirmar Eliminación */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {familiaSeleccionada && (
            <p>¿Seguro que quieres eliminar la familia "<strong>{familiaSeleccionada.descripcion}</strong>"?</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDeleteFamilia}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Toast */}
      <ToastContainer position="top-end" className="p-3">
        <Toast bg="success" show={showToast} onClose={() => setShowToast(false)} delay={2000} autohide>
          <Toast.Body className="text-white">
            ✅ Familia eliminada exitosamente
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default FamiliumIndex;
