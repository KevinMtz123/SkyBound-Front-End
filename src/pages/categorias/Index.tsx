import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CategoriaEstacional } from "../../types/CategoriaEstacional";
import api from "../../services/api";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Toast from "react-bootstrap/Toast";
import ToastContainer from "react-bootstrap/ToastContainer";

const CategoriaIndex = () => {
  const [categorias, setCategorias] = useState<CategoriaEstacional[]>([]);
  const [modalShow, setModalShow] = useState(false);
  const [modalEditShow, setModalEditShow] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [usuarioLogueado, setUsuarioLogueado] = useState(false);

  const [categoriaEditar, setCategoriaEditar] = useState<CategoriaEstacional | null>(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<CategoriaEstacional | null>(null);
  const [categoria, setCategoria] = useState<Omit<CategoriaEstacional, "idCategoria" | "fechaRegistro" | "aves">>({
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
      // Opcional: Redirigir automáticamente
      // navigate("/login");
    } else {
      setUsuarioLogueado(true);
      cargarCategorias();
    }
  }, [navigate]);

  const cargarCategorias = async () => {
    try {
      const response = await api.get<CategoriaEstacional[]>("/CategoriaEstacionals");
      setCategorias(response.data);
    } catch (error) {
      console.error("Error al cargar categorías", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(null);
    setError(null);

    try {
      await api.post("/CategoriaEstacionals", categoria);
      setMensaje("✅ Categoría agregada correctamente");
      setTimeout(() => {
        setModalShow(false);
        setCategoria({ descripcion: "", activo: true });
        cargarCategorias();
      }, 1000);
    } catch (error) {
      console.error(error);
      setError("❌ Error al guardar categoría.");
    }
  };

  const handleOpenEditModal = (cat: CategoriaEstacional) => {
    setCategoriaEditar(cat);
    setModalEditShow(true);
  };

  const handleUpdateCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoriaEditar) return;

    try {
      await api.put(`/CategoriaEstacionals/${categoriaEditar.idCategoria}`, categoriaEditar);
      setModalEditShow(false);
      setCategoriaEditar(null);
      cargarCategorias();
    } catch (error) {
      console.error("Error al actualizar categoría", error);
    }
  };

  const handleShowDeleteModal = (cat: CategoriaEstacional) => {
    setCategoriaSeleccionada(cat);
    setShowDeleteModal(true);
  };

  const handleDeleteCategoria = async () => {
    if (!categoriaSeleccionada) return;

    try {
      await api.delete(`/CategoriaEstacionals/${categoriaSeleccionada.idCategoria}`);
      setShowDeleteModal(false);
      setCategoriaSeleccionada(null);
      cargarCategorias();
      setShowToast(true);
    } catch (error) {
      console.error("Error al eliminar categoría", error);
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
        Lista de Categorías Estacionales 🌤️
      </h2>

      <Button
        variant="outline-primary"
        onClick={() => setModalShow(true)}
        className="mb-4 fw-semibold"
      >
        + Agregar Nueva Categoría
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
              {categorias.map((cat, index) => (
                <tr key={cat.idCategoria} className="border-bottom">
                  <td className="text-muted">{index + 1}</td>
                  <td className="fw-semibold">{cat.descripcion ?? "Sin descripción"}</td>
                  <td>
                    {cat.activo ? (
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
                    {cat.fechaRegistro
                      ? new Date(cat.fechaRegistro).toLocaleDateString()
                      : "Sin fecha"}
                  </td>
                  <td>
                    <Button
                      variant="outline-warning"
                      size="sm"
                      className="fw-bold me-2"
                      onClick={() => handleOpenEditModal(cat)}
                    >
                      ✏️ Editar
                    </Button>

                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="fw-bold"
                      onClick={() => handleShowDeleteModal(cat)}
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
          <Modal.Title>Agregar Nueva Categoría</Modal.Title>
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
                      value={categoria.descripcion ?? ""}
                      onChange={(e) =>
                        setCategoria({ ...categoria, descripcion: e.target.value })
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
                      checked={categoria.activo ?? true}
                      onChange={(e) =>
                        setCategoria({ ...categoria, activo: e.target.checked })
                      }
                    />
                    <label className="form-check-label" htmlFor="activoSwitch">
                      Activo
                    </label>
                  </div>

                  {mensaje && <div className="alert alert-success">{mensaje}</div>}
                  {error && <div className="alert alert-danger">{error}</div>}

                  <button type="submit" className="btn btn-success w-100">
                    Guardar Categoría
                  </button>
                </form>
              </Col>
            </Row>
          </Container>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalShow(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Editar */}
      <Modal show={modalEditShow} onHide={() => setModalEditShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Editar Categoría</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Container>
            <Row>
              <Col>
                {categoriaEditar && (
                  <form onSubmit={handleUpdateCategoria}>
                    <div className="form-outline mb-3">
                      <input
                        type="text"
                        className="form-control"
                        value={categoriaEditar.descripcion ?? ""}
                        onChange={(e) =>
                          setCategoriaEditar({ ...categoriaEditar, descripcion: e.target.value })
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
                        checked={categoriaEditar.activo ?? true}
                        onChange={(e) =>
                          setCategoriaEditar({ ...categoriaEditar, activo: e.target.checked })
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
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalEditShow(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Confirmar Eliminación */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered animation={false}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {categoriaSeleccionada && (
            <p>¿Seguro que quieres eliminar la categoría "<strong>{categoriaSeleccionada.descripcion}</strong>"?</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDeleteCategoria}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Toast de éxito */}
      <ToastContainer position="top-end" className="p-3">
        <Toast bg="success" show={showToast} onClose={() => setShowToast(false)} delay={2000} autohide>
          <Toast.Body className="text-white">
            ✅ Categoría eliminada exitosamente
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default CategoriaIndex;
