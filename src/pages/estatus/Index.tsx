import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EstatusProteccion } from "../../types/EstatusProteccion";
import api from "../../services/api";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Toast from "react-bootstrap/Toast";
import ToastContainer from "react-bootstrap/ToastContainer";

const EstatusIndex = () => {
  const [estatus, setEstatus] = useState<EstatusProteccion[]>([]);
  const [modalShow, setModalShow] = useState(false);
  const [modalEditShow, setModalEditShow] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const [usuarioLogueado, setUsuarioLogueado] = useState(false);

  const [estatusEditar, setEstatusEditar] = useState<EstatusProteccion | null>(null);
  const [estatusSeleccionado, setEstatusSeleccionado] = useState<EstatusProteccion | null>(null);

  const [nuevoEstatus, setNuevoEstatus] = useState<Omit<EstatusProteccion, "idEstatus" | "fechaRegistro" | "aves">>({
    descripcion: "",
    activo: true,
  });

  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const usuario = localStorage.getItem("usuario");
    if (!usuario) {
      setUsuarioLogueado(false);
      // Opcional: Redirigir
      // navigate("/login");
    } else {
      setUsuarioLogueado(true);
      cargarEstatus();
    }
  }, [navigate]);

  const cargarEstatus = async () => {
    try {
      const response = await api.get<EstatusProteccion[]>("/EstatusProteccions");
      setEstatus(response.data);
    } catch (error) {
      console.error("Error al cargar estatus", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(null);
    setError(null);

    try {
      await api.post("/EstatusProteccions", nuevoEstatus);
      setMensaje("✅ Estatus agregado correctamente");
      setTimeout(() => {
        setModalShow(false);
        setNuevoEstatus({ descripcion: "", activo: true });
        cargarEstatus();
      }, 1000);
    } catch (error) {
      console.error(error);
      setError("❌ Error al guardar estatus.");
    }
  };

  const handleOpenEditModal = (est: EstatusProteccion) => {
    setEstatusEditar(est);
    setModalEditShow(true);
  };

  const handleUpdateEstatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!estatusEditar) return;

    try {
      await api.put(`/EstatusProteccions/${estatusEditar.idEstatus}`, estatusEditar);
      setModalEditShow(false);
      setEstatusEditar(null);
      cargarEstatus();
    } catch (error) {
      console.error("Error al actualizar estatus", error);
    }
  };

  const handleShowDeleteModal = (est: EstatusProteccion) => {
    setEstatusSeleccionado(est);
    setShowDeleteModal(true);
  };

  const handleDeleteEstatus = async () => {
    if (!estatusSeleccionado) return;

    try {
      await api.delete(`/EstatusProteccions/${estatusSeleccionado.idEstatus}`);
      setShowDeleteModal(false);
      setEstatusSeleccionado(null);
      cargarEstatus();
      setShowToast(true);
    } catch (error) {
      console.error("Error al eliminar estatus", error);
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
        Lista de Estatus de Protección ⚠️
      </h2>

      <Button
        variant="outline-primary"
        onClick={() => setModalShow(true)}
        className="mb-4 fw-semibold"
      >
        + Agregar Nuevo Estatus
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
              {estatus.map((est, index) => (
                <tr key={est.idEstatus} className="border-bottom">
                  <td className="text-muted">{index + 1}</td>
                  <td className="fw-semibold">{est.descripcion ?? "Sin descripción"}</td>
                  <td>
                    {est.activo ? (
                      <span className="badge rounded-pill bg-success-subtle text-success px-3 py-1">Activo</span>
                    ) : (
                      <span className="badge rounded-pill bg-danger-subtle text-danger px-3 py-1">Inactivo</span>
                    )}
                  </td>
                  <td className="text-muted">
                    {est.fechaRegistro
                      ? new Date(est.fechaRegistro).toLocaleDateString()
                      : "Sin fecha"}
                  </td>
                  <td>
                    <Button
                      variant="outline-warning"
                      size="sm"
                      className="fw-bold me-2"
                      onClick={() => handleOpenEditModal(est)}
                    >
                      ✏️ Editar
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="fw-bold"
                      onClick={() => handleShowDeleteModal(est)}
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

      {/* Modal Agregar */}
      <Modal show={modalShow} onHide={() => setModalShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Nuevo Estatus</Modal.Title>
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
                      value={nuevoEstatus.descripcion ?? ""}
                      onChange={(e) =>
                        setNuevoEstatus({ ...nuevoEstatus, descripcion: e.target.value })
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
                      checked={nuevoEstatus.activo ?? true}
                      onChange={(e) =>
                        setNuevoEstatus({ ...nuevoEstatus, activo: e.target.checked })
                      }
                    />
                    <label className="form-check-label" htmlFor="activoSwitch">
                      Activo
                    </label>
                  </div>

                  {mensaje && <div className="alert alert-success">{mensaje}</div>}
                  {error && <div className="alert alert-danger">{error}</div>}

                  <button type="submit" className="btn btn-success w-100">
                    Guardar Estatus
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
          <Modal.Title>Editar Estatus</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Container>
            <Row>
              <Col>
                {estatusEditar && (
                  <form onSubmit={handleUpdateEstatus}>
                    <div className="form-outline mb-3">
                      <input
                        type="text"
                        className="form-control"
                        value={estatusEditar.descripcion ?? ""}
                        onChange={(e) =>
                          setEstatusEditar({ ...estatusEditar, descripcion: e.target.value })
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
                        checked={estatusEditar.activo ?? true}
                        onChange={(e) =>
                          setEstatusEditar({ ...estatusEditar, activo: e.target.checked })
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
          {estatusSeleccionado && (
            <p>¿Seguro que quieres eliminar el estatus "<strong>{estatusSeleccionado.descripcion}</strong>"?</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDeleteEstatus}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Toast de éxito */}
      <ToastContainer position="top-end" className="p-3">
        <Toast bg="success" show={showToast} onClose={() => setShowToast(false)} delay={2000} autohide>
          <Toast.Body className="text-white">
            ✅ Estatus eliminado exitosamente
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default EstatusIndex;
