import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Habitat } from "../../types/Habitat";
import api from "../../services/api";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Toast from "react-bootstrap/Toast";
import ToastContainer from "react-bootstrap/ToastContainer";

const HabitatIndex = () => {
  const [habitats, setHabitats] = useState<Habitat[]>([]);
  const [modalShow, setModalShow] = useState(false);
  const [modalEditShow, setModalEditShow] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const [habitatEditar, setHabitatEditar] = useState<Habitat | null>(null);
  const [habitatSeleccionado, setHabitatSeleccionado] = useState<Habitat | null>(null);

  const [nuevoHabitat, setNuevoHabitat] = useState<Omit<Habitat, "idHabitat" | "fechaRegistro" | "aves">>({
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
      // Opcionalmente puedes redirigir aquí:
      // navigate("/login");
    } else {
      setUsuarioLogueado(true);
      cargarHabitats();
    }
  }, [navigate]);

  const cargarHabitats = async () => {
    try {
      const response = await api.get<Habitat[]>("/Habitats");
      setHabitats(response.data);
    } catch (error) {
      console.error("Error al cargar habitats", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(null);
    setError(null);

    try {
      await api.post("/Habitats", nuevoHabitat);
      setMensaje("✅ Habitat agregado correctamente");

      setTimeout(() => {
        setModalShow(false);
        setNuevoHabitat({ descripcion: "", activo: true });
        cargarHabitats();
      }, 1000);
    } catch (error) {
      console.error(error);
      setError("❌ Error al guardar habitat.");
    }
  };

  const handleOpenEditModal = (hab: Habitat) => {
    setHabitatEditar(hab);
    setModalEditShow(true);
  };

  const handleUpdateHabitat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitatEditar) return;

    try {
      await api.put(`/Habitats/${habitatEditar.idHabitat}`, habitatEditar);
      setModalEditShow(false);
      setHabitatEditar(null);
      cargarHabitats();
    } catch (error) {
      console.error("Error al actualizar habitat", error);
    }
  };

  const handleShowDeleteModal = (hab: Habitat) => {
    setHabitatSeleccionado(hab);
    setShowDeleteModal(true);
  };

  const handleDeleteHabitat = async () => {
    if (!habitatSeleccionado) return;

    try {
      await api.delete(`/Habitats/${habitatSeleccionado.idHabitat}`);
      setShowDeleteModal(false);
      setHabitatSeleccionado(null);
      cargarHabitats();
      setShowToast(true);
    } catch (error) {
      console.error("Error al eliminar habitat", error);
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
        Lista de Hábitats 🌿
      </h2>

      <Button
        variant="outline-primary"
        onClick={() => setModalShow(true)}
        className="mb-4 fw-semibold"
      >
        + Agregar Nuevo Hábitat
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
              {habitats.map((hab, index) => (
                <tr key={hab.idHabitat} className="border-bottom">
                  <td className="text-muted">{index + 1}</td>
                  <td className="fw-semibold">{hab.descripcion ?? "Sin descripción"}</td>
                  <td>
                    {hab.activo ? (
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
                    {hab.fechaRegistro
                      ? new Date(hab.fechaRegistro).toLocaleDateString()
                      : "Sin fecha"}
                  </td>
                  <td>
                    <Button
                      variant="outline-warning"
                      size="sm"
                      className="fw-bold me-2"
                      onClick={() => handleOpenEditModal(hab)}
                    >
                      ✏️ Editar
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="fw-bold"
                      onClick={() => handleShowDeleteModal(hab)}
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
          <Modal.Title>Agregar Nuevo Hábitat</Modal.Title>
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
                      value={nuevoHabitat.descripcion ?? ""}
                      onChange={(e) =>
                        setNuevoHabitat({ ...nuevoHabitat, descripcion: e.target.value })
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
                      checked={nuevoHabitat.activo ?? true}
                      onChange={(e) =>
                        setNuevoHabitat({ ...nuevoHabitat, activo: e.target.checked })
                      }
                    />
                    <label className="form-check-label" htmlFor="activoSwitch">
                      Activo
                    </label>
                  </div>

                  {mensaje && <div className="alert alert-success">{mensaje}</div>}
                  {error && <div className="alert alert-danger">{error}</div>}

                  <button type="submit" className="btn btn-success w-100">
                    Guardar Hábitat
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
          <Modal.Title>Editar Hábitat</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Container>
            <Row>
              <Col>
                {habitatEditar && (
                  <form onSubmit={handleUpdateHabitat}>
                    <div className="form-outline mb-3">
                      <input
                        type="text"
                        className="form-control"
                        value={habitatEditar.descripcion ?? ""}
                        onChange={(e) =>
                          setHabitatEditar({ ...habitatEditar, descripcion: e.target.value })
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
                        checked={habitatEditar.activo ?? true}
                        onChange={(e) =>
                          setHabitatEditar({ ...habitatEditar, activo: e.target.checked })
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
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered animation={false}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {habitatSeleccionado && (
            <p>¿Seguro que quieres eliminar el hábitat "<strong>{habitatSeleccionado.descripcion}</strong>"?</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDeleteHabitat}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Toast de éxito */}
      <ToastContainer position="top-end" className="p-3">
        <Toast bg="success" show={showToast} onClose={() => setShowToast(false)} delay={2000} autohide>
          <Toast.Body className="text-white">
            ✅ Hábitat eliminado exitosamente
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default HabitatIndex;
